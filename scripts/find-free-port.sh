#!/bin/bash
# Find a free port starting from a given port

START_PORT=${1:-3000}
MAX_TRIES=100

for ((port=$START_PORT; port<$START_PORT+$MAX_TRIES; port++)); do
  if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo $port
    exit 0
  fi
done

echo "Error: Could not find a free port" >&2
exit 1
