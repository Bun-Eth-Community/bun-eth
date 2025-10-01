#!/bin/bash
# Kill processes on common development ports

PORTS=(3000 3001 8545)

echo "🔍 Checking for processes on ports: ${PORTS[@]}"

for port in "${PORTS[@]}"; do
  PID=$(lsof -ti:$port 2>/dev/null)

  if [ -n "$PID" ]; then
    echo "💀 Killing process $PID on port $port"
    kill -9 $PID 2>/dev/null
  else
    echo "✅ Port $port is free"
  fi
done

echo ""
echo "✨ All ports cleared!"
