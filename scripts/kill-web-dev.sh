#!/bin/bash
# Safely kill Next.js dev server by port, not by process name
# This avoids accidentally killing Docker/OrbStack processes

PORT=${1:-3000}

echo "Looking for process on port $PORT..."

# Find process using the port
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "No process found on port $PORT"
  exit 0
fi

# Check if it's a Next.js/Bun process before killing
PROCESS_INFO=$(ps -p $PID -o command= 2>/dev/null)

if echo "$PROCESS_INFO" | grep -q -E "(next dev|bun.*dev)"; then
  echo "Found Next.js/Bun process on port $PORT (PID: $PID)"
  echo "Killing: $PROCESS_INFO"
  kill -9 $PID 2>/dev/null
  echo "Process killed successfully"
else
  echo "Process on port $PORT doesn't appear to be Next.js/Bun"
  echo "Process: $PROCESS_INFO"
  echo "Skipping for safety"
fi
