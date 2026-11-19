#!/usr/bin/env bash
# Opens four interactive Claude terminals: manager, frontend, backend, reviewer.
# Each one accepts typed prompts AND receives dispatched jobs.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/docs/.terminals"
for r in manager frontend backend reviewer; do
  osascript - "$ROOT" "$r" <<'OSA'
on run argv
  set root to item 1 of argv
  set r to item 2 of argv
  tell application "Terminal"
    activate
    set cmd to "cd " & quoted form of root & " && claude --agent " & r & " --permission-mode acceptEdits"
    do script cmd
    delay 0.5
    set wid to id of window 1
    do shell script "echo " & wid & " > " & quoted form of (root & "/docs/.terminals/" & r)
  end tell
end run
OSA
done
