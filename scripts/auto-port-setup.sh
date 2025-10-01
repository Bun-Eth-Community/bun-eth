#!/bin/bash
# Automatically configure free ports in .env

echo "🔍 Finding free ports..."

# Find free ports
WEB_PORT=$(bash scripts/find-free-port.sh 3000)
API_PORT=$(bash scripts/find-free-port.sh 3001)
ANVIL_PORT=$(bash scripts/find-free-port.sh 8545)

echo "✅ Found free ports:"
echo "   WEB_PORT=$WEB_PORT"
echo "   API_PORT=$API_PORT"
echo "   ANVIL_PORT=$ANVIL_PORT"

# Update .env file
if [ -f .env ]; then
  # Update existing values or add new ones
  if grep -q "^WEB_PORT=" .env; then
    sed -i.bak "s/^WEB_PORT=.*/WEB_PORT=$WEB_PORT/" .env
  else
    echo "WEB_PORT=$WEB_PORT" >> .env
  fi

  if grep -q "^API_PORT=" .env; then
    sed -i.bak "s/^API_PORT=.*/API_PORT=$API_PORT/" .env
  else
    echo "API_PORT=$API_PORT" >> .env
  fi

  if grep -q "^ANVIL_PORT=" .env; then
    sed -i.bak "s/^ANVIL_PORT=.*/ANVIL_PORT=$ANVIL_PORT/" .env
  else
    echo "ANVIL_PORT=$ANVIL_PORT" >> .env
  fi

  rm -f .env.bak
  echo ""
  echo "✨ Updated .env with free ports"
else
  echo ""
  echo "⚠️  No .env file found. Run 'task setup' first."
fi
