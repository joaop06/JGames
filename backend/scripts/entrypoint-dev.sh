#!/bin/sh
set -e
if [ ! -d node_modules/reflect-metadata ]; then
  echo "Instalando dependências no volume..."
  npm ci
fi
echo "Compilando para garantir migrations em dist/..."
npm run build
exec "$@"
