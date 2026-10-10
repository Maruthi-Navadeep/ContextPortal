import asyncio
from unittest.mock import AsyncMock, patch

import pytest
from mcp.client.session import ClientSession
from mcp.server.models import InitializationOptions
from mcp.shared.memory import create_client_server_memory_streams

from app.core.retriever import ContextResult
from app.mcp.server import mcp


@pytest.fixture
def mock_get_context():
    with patch("app.mcp.server.get_context", new_callable=AsyncMock) as mock:
        mock.return_value = ContextResult(
            url="https://example.com/redirected",
            title="Example Title",
            content="# Mocked Content",
            retrieval_method="http",
            authenticated=False,
        )
        yield mock


@pytest.mark.asyncio
async def test_mcp_fetch_context(mock_get_context):
    # 1. Create in-memory streams for client and server communication
    async with create_client_server_memory_streams() as (
        client_streams,
        server_streams,
    ):
        # 2. Get the low-level Server instance from the MCPServer wrapper
        server = mcp._lowlevel_server

        init_options = InitializationOptions(
            server_name="ContextPortal",
            server_version="0.1.0",
            capabilities=server.get_capabilities(
                notification_options=None, experimental_capabilities={}
            ),
        )

        # 3. Start the server run loop in a background task
        server_task = asyncio.create_task(
            server.run(server_streams[0], server_streams[1], init_options)
        )

        try:
            # 4. Create and initialize the client session
            async with ClientSession(client_streams[0], client_streams[1]) as session:
                await session.initialize()

                # 5. List tools and verify our tools are registered
                tools_response = await session.list_tools()
                assert len(tools_response.tools) == 2
                tool_names = [t.name for t in tools_response.tools]
                assert "fetch_context" in tool_names
                assert "search_context" in tool_names

                # 6. Call the tool and verify it delegates to get_context
                result = await session.call_tool(
                    "fetch_context", {"url": "https://example.com"}
                )
                assert not result.is_error
                assert len(result.content) == 1
                assert result.content[0].type == "text"
                assert "# Example Title" in result.content[0].text
                assert (
                    "**Source URL**: https://example.com/redirected"
                    in result.content[0].text
                )
                assert "**Retrieval Method**: http" in result.content[0].text
                assert "# Mocked Content" in result.content[0].text

                mock_get_context.assert_called_once_with("https://example.com")

                # 7. Verify security policy enforcement over MCP
                result_local = await session.call_tool(
                    "fetch_context", {"url": "http://localhost:8000"}
                )
                # We return the error as a readable string to the LLM
                assert (
                    "Error: Access to localhost is forbidden by security policy"
                    in result_local.content[0].text
                )

                result_file = await session.call_tool(
                    "fetch_context", {"url": "file:///etc/passwd"}
                )
                assert "Error: Invalid scheme" in result_file.content[0].text
        finally:
            # Clean up the background server task
            server_task.cancel()
            try:
                await server_task
            except asyncio.CancelledError:
                pass


@pytest.fixture
def mock_search():
    with patch("app.mcp.server.search") as mock_s, patch(
        "app.mcp.server.format_results_as_markdown"
    ) as mock_f:
        mock_f.return_value = (
            "# Search Results: test query\n"
            "### 1. Example Result\n"
            "**URL:** https://example.com\n"
            "Test snippet\n"
        )
        yield mock_s, mock_f


@pytest.mark.asyncio
async def test_mcp_search_context(mock_search):
    mock_s, mock_f = mock_search

    async with create_client_server_memory_streams() as (
        client_streams,
        server_streams,
    ):
        server = mcp._lowlevel_server

        init_options = InitializationOptions(
            server_name="ContextPortal",
            server_version="0.1.0",
            capabilities=server.get_capabilities(
                notification_options=None, experimental_capabilities={}
            ),
        )

        server_task = asyncio.create_task(
            server.run(server_streams[0], server_streams[1], init_options)
        )

        try:
            async with ClientSession(client_streams[0], client_streams[1]) as session:
                await session.initialize()

                # Happy path
                result = await session.call_tool(
                    "search_context", {"query": "Handshake AI projects"}
                )
                assert not result.is_error
                assert len(result.content) == 1
                assert "# Search Results: test query" in result.content[0].text
                mock_s.assert_called_once_with("Handshake AI projects", "google", 5)

                # Whitespace query validation
                result_whitespace = await session.call_tool(
                    "search_context", {"query": "   "}
                )
                assert not result_whitespace.is_error
                assert (
                    "Error: Search query cannot be empty."
                    in result_whitespace.content[0].text
                )

                # Upstream error (e.g. missing API key)
                mock_s.side_effect = ValueError(
                    "SERPAPI_API_KEY environment variable is not set."
                )
                result_err = await session.call_tool(
                    "search_context", {"query": "test query"}
                )
                assert not result_err.is_error
                assert (
                    "Error: SERPAPI_API_KEY environment variable is not set."
                    in result_err.content[0].text
                )
        finally:
            server_task.cancel()
            try:
                await server_task
            except asyncio.CancelledError:
                pass

