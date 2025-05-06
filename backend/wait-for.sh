#!/bin/sh

hostport="$1"
shift

# Bỏ dấu -- nếu có
[ "$1" = "--" ] && shift

host=$(echo "$hostport" | cut -d: -f1)
port=$(echo "$hostport" | cut -d: -f2)

echo "⏳ Waiting for $host:$port to be available..."

while ! nc -z "$host" "$port"; do
  sleep 1
done

echo "✅ $host:$port is up. Starting app..."
exec "$@"
