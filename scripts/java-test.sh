#!/usr/bin/env bash
# Compiles every Java file under java/src for Java 11 (judge-safe) and runs every self-test:
# a class whose main() line carries the marker `// @selftest`. (Contest templates also have a
# main() that reads stdin; they are compiled but not run.)
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=java/out
rm -rf "$OUT"
mkdir -p "$OUT"

FILES=$(find java/src -name '*.java' | sort)
[ -z "$FILES" ] && { echo "No Java files found."; exit 0; }

# shellcheck disable=SC2086
javac --release 11 -Xlint:all -Werror -d "$OUT" $FILES

fail=0
for f in $FILES; do
  grep -q 'static void main.*// @selftest' "$f" || continue
  cls=$(echo "${f#java/src/}" | sed 's#/#.#g; s#\.java$##')
  if out=$(java -ea -cp "$OUT" "$cls" < /dev/null 2>&1); then
    echo "PASS  $cls  ($out)"
  else
    echo "FAIL  $cls"
    echo "$out" | sed 's/^/      /'
    fail=1
  fi
done
exit $fail
