#!/bin/bash

MAX_WAIT=180
WAITED=0

while true; do
  echo "Checking database connectivity..."

  echo "SELECT 1;" | npx prisma db execute --stdin
  if [ $? -eq 0 ]; then
    break
  fi

  echo "Cannot connect to the database, retrying in 5 seconds..."

  sleep 5

  WAITED=$((WAITED + 5))
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    echo "Prisma couldn't connect after $MAX_WAIT seconds. Exiting."
    exit 1
  fi
done

echo
echo "Applying database migrations..."
echo

npx prisma migrate deploy;

echo
echo "Generating Prisma client..."
echo

npx prisma generate

echo
echo "Starting the application..."
echo

npx tsc -p tsconfig.json

node dist/src/main.js

exit $?
