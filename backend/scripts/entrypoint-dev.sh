#!/bin/sh
set -e
if [ ! -d node_modules/reflect-metadata ]; then
  echo "Instalando dependências no volume..."
  npm ci
fi
exec "$@"
