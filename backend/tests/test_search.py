"""Tests for the SerpApi search integration."""

from unittest.mock import MagicMock, patch

import pytest

from app.core.search import (
    SearchResponse,
    SearchResultItem,
    format_results_as_markdown,
    search,
)

# ── fixtures ──────────────────────────────────────────────────────────────────

MOCK_SERPAPI_RESPONSE = {
    "search_information": {"total_results": 1234},
    "organic_results": [
        {
            "position": 1,
            "title": "Handshake - Career Community",
            "link": "https://app.joinhandshake.com/",
            "snippet": "Handshake is the career network for students and young alumni.",
            "source": "joinhandshake.com",
        },
        {
            "position": 2,
            "title": "Handshake Login",
            "link": "https://app.joinhandshake.com/login",
            "snippet": "Sign in to your Handshake account.",
            "source": "joinhandshake.com",
        },
    ],
    "answer_box": {"answer": "Handshake is a career platform for college students."},
    "knowledge_graph": {
        "title": "Handshake",
        "description": "Career services platform",
    },
}


# ── test search function ─────────────────────────────────────────────────────

@patch("app.core.search.serpapi.Client")
@patch("app.core.search._get_api_key", return_value="test-key")
def test_search_returns_structured_results(mock_key, mock_client_cls):
    mock_client = MagicMock()
    mock_client.search.return_value = MOCK_SERPAPI_RESPONSE
    mock_client_cls.return_value = mock_client

    response = search("Handshake AI")

    assert isinstance(response, SearchResponse)
    assert response.query == "Handshake AI"
    assert response.engine == "google"
    assert response.total_results == 1234
    assert len(response.results) == 2
    assert response.results[0].title == "Handshake - Career Community"
    assert response.results[0].link == "https://app.joinhandshake.com/"
    assert response.answer_box == "Handshake is a career platform for college students."
    assert response.knowledge_panel == "Handshake: Career services platform"


@patch("app.core.search.serpapi.Client")
@patch("app.core.search._get_api_key", return_value="test-key")
def test_search_passes_custom_parameters(mock_key, mock_client_cls):
    mock_client = MagicMock()
    mock_client.search.return_value = MOCK_SERPAPI_RESPONSE
    mock_client_cls.return_value = mock_client

    search(
        "AI agents",
        engine="google_scholar",
        num_results=8,
        location="India",
        gl="in",
        hl="en",
    )

    mock_client.search.assert_called_once_with(
        {
            "engine": "google_scholar",
            "q": "AI agents",
            "hl": "en",
            "num": 8,
            "location": "India",
            "gl": "in",
        }
    )


@patch("app.core.search.serpapi.Client")
@patch("app.core.search._get_api_key", return_value="test-key")
def test_search_handles_empty_results(mock_key, mock_client_cls):
    mock_client = MagicMock()
    mock_client.search.return_value = {"search_information": {"total_results": 0}}
    mock_client_cls.return_value = mock_client

    response = search("xyznonexistentquery123")
    assert response.results == []
    assert response.total_results == 0


def test_search_missing_api_key():
    with patch.dict("os.environ", {}, clear=True):
        with patch("app.config.settings.serpapi_api_key", None):
            with pytest.raises(ValueError, match="SERPAPI_API_KEY"):
                search("test")


@patch("app.core.search.serpapi.Client")
def test_search_reads_api_key_from_settings(mock_client_cls):
    mock_client = MagicMock()
    mock_client.search.return_value = {"search_information": {"total_results": 0}}
    mock_client_cls.return_value = mock_client

    with patch.dict("os.environ", {}, clear=True):
        with patch("app.config.settings.serpapi_api_key", "settings-key"):
            response = search("query")
            assert response.total_results == 0
            mock_client_cls.assert_called_once_with(api_key="settings-key")


# ── test markdown formatting ─────────────────────────────────────────────────

def test_format_results_as_markdown():
    response = SearchResponse(
        query="Handshake AI",
        engine="google",
        total_results=2,
        results=[
            SearchResultItem(
                position=1,
                title="Handshake",
                link="https://joinhandshake.com",
                snippet="Career platform",
                source="joinhandshake.com",
            ),
        ],
        answer_box="Handshake is a career platform.",
        knowledge_panel="Handshake: Student jobs",
    )
    md = format_results_as_markdown(response)

    assert "# Search Results: Handshake AI" in md
    assert "**Engine**: google" in md
    assert "### 1. Handshake" in md
    assert "**URL:** https://joinhandshake.com" in md
    assert "Career platform" in md
    assert "Direct Answer" in md
    assert "Knowledge Panel" in md
    assert "fetch_context" in md


def test_format_results_empty():
    response = SearchResponse(
        query="nothing",
        engine="google",
        total_results=0,
        results=[],
    )
    md = format_results_as_markdown(response)
    assert "No results found" in md
