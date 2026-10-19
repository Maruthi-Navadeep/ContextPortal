import json
import os
import platform
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class ClientConfig:
    name: str
    display_name: str
    config_path: Path
    key_name: str = "mcpServers"


def get_supported_clients() -> list[ClientConfig]:
    """Returns the list of supported AI agent clients and their default config locations."""
    system = platform.system()
    home = Path.home()
    clients: list[ClientConfig] = []

    # 1. Claude Desktop
    if system == "Windows":
        claude_path = (
            Path(os.environ.get("APPDATA", str(home / "AppData" / "Roaming")))
            / "Claude"
            / "claude_desktop_config.json"
        )
    elif system == "Darwin":
        claude_path = (
            home
            / "Library"
            / "Application Support"
            / "Claude"
            / "claude_desktop_config.json"
        )
    else:
        claude_path = home / ".config" / "Claude" / "claude_desktop_config.json"

    clients.append(
        ClientConfig(
            name="claude", display_name="Claude Desktop", config_path=claude_path
        )
    )

    # 2. Cursor IDE
    if system == "Windows":
        cursor_path = (
            Path(os.environ.get("APPDATA", str(home / "AppData" / "Roaming")))
            / "Cursor"
            / "mcp.json"
        )
    elif system == "Darwin":
        cursor_path = home / "Library" / "Application Support" / "Cursor" / "mcp.json"
    else:
        cursor_path = home / ".config" / "Cursor" / "mcp.json"
    clients.append(
        ClientConfig(name="cursor", display_name="Cursor IDE", config_path=cursor_path)
    )

    # 3. Google Antigravity IDE
    antigravity_path = home / ".gemini" / "antigravity" / "mcp_config.json"
    clients.append(
        ClientConfig(
            name="antigravity",
            display_name="Antigravity IDE",
            config_path=antigravity_path,
        )
    )

    # 4. Claude Code (CLI + VS Code / JetBrains extension)
    # Global user settings at ~/.claude/settings.json — works for all Claude Code surfaces.
    claude_code_path = home / ".claude" / "settings.json"
    clients.append(
        ClientConfig(
            name="claude-code",
            display_name="Claude Code",
            config_path=claude_code_path,
        )
    )

    # 5. Windsurf (Codeium)
    if system == "Windows":
        windsurf_path = (
            Path(os.environ.get("APPDATA", str(home / "AppData" / "Roaming")))
            / "Windsurf"
            / "mcp.json"
        )
    elif system == "Darwin":
        windsurf_path = home / "Library" / "Application Support" / "Windsurf" / "mcp.json"
    else:
        windsurf_path = home / ".config" / "Windsurf" / "mcp.json"
    clients.append(
        ClientConfig(name="windsurf", display_name="Windsurf", config_path=windsurf_path)
    )

    # 6. Cline (VS Code extension — formerly Claude Dev)
    if system == "Windows":
        vscode_storage = (
            Path(os.environ.get("APPDATA", str(home / "AppData" / "Roaming")))
            / "Code" / "User" / "globalStorage"
        )
    elif system == "Darwin":
        vscode_storage = home / "Library" / "Application Support" / "Code" / "User" / "globalStorage"
    else:
        vscode_storage = home / ".config" / "Code" / "User" / "globalStorage"

    cline_path = vscode_storage / "saoudrizwan.claude-dev" / "settings" / "cline_mcp_settings.json"
    clients.append(
        ClientConfig(name="cline", display_name="Cline (VS Code)", config_path=cline_path)
    )

    # 7. Roo Code (VS Code extension — Cline fork)
    roo_path = vscode_storage / "rooveterinaryinc.roo-cline" / "settings" / "cline_mcp_settings.json"
    clients.append(
        ClientConfig(name="roo-code", display_name="Roo Code (VS Code)", config_path=roo_path)
    )

    # 8. Amazon Q Developer
    amazon_q_path = home / ".aws" / "amazonq" / "mcp.json"
    clients.append(
        ClientConfig(name="amazon-q", display_name="Amazon Q Developer", config_path=amazon_q_path)
    )

    # 9. Gemini CLI
    gemini_path = home / ".gemini" / "settings.json"
    clients.append(
        ClientConfig(name="gemini-cli", display_name="Gemini CLI", config_path=gemini_path)
    )

    return clients


def get_contextportal_mcp_entry() -> dict[str, Any]:
    """Returns the standardized MCP server configuration entry for ContextPortal."""
    return {"command": "contextportal", "args": ["mcp"]}


def is_client_detected(client: ClientConfig) -> bool:
    """Returns True if the client's config file or parent directory exists on the system."""
    return client.config_path.exists() or client.config_path.parent.exists()


def inject_mcp_config(
    config_path: Path,
    key_name: str = "mcpServers",
    dry_run: bool = False,
    force: bool = False,
) -> tuple[bool, str]:
    """
    Safely injects ContextPortal into the given client's configuration file.
    Creates parent directories and a .bak backup file if modified.
    If force is False and parent directory does not exist, skips configuration.
    Returns (success, message).
    """
    target_entry = get_contextportal_mcp_entry()

    # Skip if client is not detected on this system, unless force is requested
    if not force and not config_path.exists() and not config_path.parent.exists():
        return True, "Skipped (Client not installed on this system)"

    try:
        data: dict[str, Any] = {}
        file_exists = config_path.exists()

        if file_exists:
            try:
                with open(config_path, encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        data = json.loads(content)
            except Exception as e:
                return False, f"Failed to parse existing JSON in {config_path}: {e}"

        # Initialize root key if not present
        if key_name not in data or not isinstance(data[key_name], dict):
            data[key_name] = {}

        # Check if already up-to-date
        current = data[key_name].get("context-portal")
        if current == target_entry:
            return True, "Already configured and up-to-date"

        data[key_name]["context-portal"] = target_entry

        if dry_run:
            return True, f"[Dry Run] Would update {config_path}"

        # Ensure parent directory exists
        config_path.parent.mkdir(parents=True, exist_ok=True)

        # Create backup if file exists
        if file_exists:
            backup_path = config_path.with_suffix(config_path.suffix + ".bak")
            try:
                shutil.copy2(config_path, backup_path)
            except Exception as e:
                return False, f"Could not create backup at {backup_path}: {e}"

        # Write formatted JSON atomically
        temp_path = config_path.with_suffix(config_path.suffix + ".tmp")
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")

        shutil.move(temp_path, config_path)
        return True, "Configured successfully (backup created)"

    except Exception as e:
        return False, f"Error updating {config_path}: {e}"
