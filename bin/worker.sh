#!/usr/bin/env bash
# Usage: bin/worker.sh <frontend|backend|reviewer>
# One terminal = one role. Waits for jobs in docs/inbox/<role>/, runs each in a
# headless Claude session as that agent, writes the result to docs/outbox/<role>-<id>.md.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
role="${1:?role required}"
cd "$ROOT"
inbox="docs/inbox/$role"; mkdir -p "$inbox" docs/outbox docs/done docs/logs
printf '\033]0;%s\007' "$role"
echo "[$role] ready. Watching $inbox (Ctrl-C to stop)"
while true; do
  job="$(ls -1 "$inbox"/*.md 2>/dev/null | head -n1)"
  if [ -z "$job" ]; then sleep 2; continue; fi
  id="$(basename "$job" .md)"
  echo "[$role] $(date +%T) starting $id"
  out="docs/outbox/$role-$id.md"
  if claude -p --agent "$role" --permission-mode acceptEdits \
       --allowedTools "Bash" \
       "You have been assigned the job in $job. Read it, do the work within your scope, and finish with a short report (what changed, files touched, how you verified it, open issues)." \
       > "$out.tmp" 2> "docs/logs/$role-$id.err"; then
    mv "$out.tmp" "$out"
  else
    { echo "STATUS: FAILED"; cat "$out.tmp"; echo; echo "stderr:"; cat "docs/logs/$role-$id.err"; } > "$out"; rm -f "$out.tmp"
  fi
  mv "$job" "docs/done/$role-$id.md"
  echo "[$role] $(date +%T) finished $id -> $out"
done
