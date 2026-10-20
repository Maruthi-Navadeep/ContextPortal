import json

from app.core.setup import (
    get_contextportal_mcp_entry,
    get_supported_clients,
    inject_mcp_config,
)


def test_get_supported_clients():
    clients = get_supported_clients()
    names = [c.name for c in clients]
    assert "claude" in names
    assert "cursor" in names
    assert "antigravity" in names
    assert "claude-code" in names
    assert "windsurf" in names
    assert "cline" in names
    assert "roo-code" in names
    assert "amazon-q" in names
    assert "gemini-cli" in names


def test_inject_mcp_config_fresh_file(tmp_path):
    config_file = tmp_path / "test_client" / "config.json"

    # Without force and parent non-existent, should skip
    success_skip, msg_skip = inject_mcp_config(config_file, force=False)
    assert success_skip is True
    assert "Skipped" in msg_skip
    assert not config_file.exists()

    # With force=True, should create and configure
    success, msg = inject_mcp_config(config_file, force=True)
    assert success is True
    assert config_file.exists()

    with open(config_file, encoding="utf-8") as f:
        data = json.load(f)

    assert "mcpServers" in data
    assert "context-portal" in data["mcpServers"]
    assert data["mcpServers"]["context-portal"] == get_contextportal_mcp_entry()


def test_inject_mcp_config_preserves_existing_servers(tmp_path):
    config_file = tmp_path / "config.json"
    initial_data = {
        "mcpServers": {"custom-tool": {"command": "custom", "args": ["serve"]}}
    }
    with open(config_file, "w", encoding="utf-8") as f:
        json.dump(initial_data, f)

    success, msg = inject_mcp_config(config_file)
    assert success is True

    # Check backup was created
    backup_file = config_file.with_suffix(".json.bak")
    assert backup_file.exists()

    with open(config_file, encoding="utf-8") as f:
        data = json.load(f)

    # Both servers must exist
    assert "custom-tool" in data["mcpServers"]
    assert "context-portal" in data["mcpServers"]
    assert data["mcpServers"]["custom-tool"]["command"] == "custom"


def test_inject_mcp_config_idempotent(tmp_path):
    config_file = tmp_path / "config.json"
    config_file.touch()

    # First injection
    success1, msg1 = inject_mcp_config(config_file)
    assert success1 is True
    assert "Configured successfully" in msg1

    # Second injection (no-op)
    success2, msg2 = inject_mcp_config(config_file)
    assert success2 is True
    assert "Already configured" in msg2


def test_inject_mcp_config_dry_run(tmp_path):
    # If parent exists, dry run previews
    config_file = tmp_path / "preview.json"

    success, msg = inject_mcp_config(config_file, dry_run=True)
    assert success is True
    assert "[Dry Run]" in msg
    assert not config_file.exists()
