#!/usr/bin/env sh
# Install measured-design for whichever agent you run.
#
#   sh scripts/install.sh claude [--core]
#   sh scripts/install.sh codex  [--core]
#   sh scripts/install.sh any /path/to/skills
#
# --core installs the ten measured-design skills only, not the 88-skill library.
# Use it when the agent pre-loads every skill name into its prompt: Codex caps
# that list at about 8,000 characters, and 98 skills would be silently truncated.
set -e
TARGET="$1"; MODE="$2"
SRC="$(cd "$(dirname "$0")/.." && pwd)/skills"
case "$TARGET" in
  claude) DEST="$HOME/.claude/skills" ;;
  codex)  DEST="$HOME/.agents/skills" ;;
  any)    DEST="$MODE"; MODE="$3" ;;
  *) echo "usage: install.sh claude|codex|any [--core]"; exit 1 ;;
esac
mkdir -p "$DEST"
# The procedure, plus the standalone skills that do not need it. jira-backlog runs
# against any project, so it installs with --core as well — leaving it out would
# make the one skill you can use on day one the one you have to install by hand.
for d in "$SRC"/measured-design* "$SRC"/jira-backlog; do
  [ -d "$d" ] || continue
  ln -sfn "$d" "$DEST/$(basename "$d")"
done
if [ "$MODE" != "--core" ]; then
  for d in "$SRC"/library/*/; do
    ln -sfn "${d%/}" "$DEST/$(basename "${d%/}")"
  done
fi
echo "linked into $DEST"
ls "$DEST" | wc -l | sed 's/$/ skills available/'
