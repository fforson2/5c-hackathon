#!/usr/bin/env bash
# Stops the team's terminals (only windows running the team's agents; nothing else).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
pkill -f "claude --agent (manager|frontend|backend|reviewer)" 2>/dev/null
pkill -f "bin/worker.sh" 2>/dev/null
sleep 1
osascript <<'OSA'
tell application "Terminal"
  repeat with w in (reverse of (get windows))
    try
      set n to name of w
      if n contains "worker.sh" or n contains "--agent manager" or n contains "--agent frontend" or n contains "--agent backend" or n contains "--agent reviewer" or n is "manager" or n is "frontend" or n is "backend" or n is "reviewer" then close w saving no
    end try
  end repeat
end tell
OSA
rm -rf "$ROOT/docs/.terminals"
