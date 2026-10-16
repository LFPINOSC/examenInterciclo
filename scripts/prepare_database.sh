#!/usr/bin/env bash
set -euo pipefail
DB_NAME="${DB_NAME:-biblioteca_examen}"

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql no está instalado o no está en PATH."
  exit 1
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  echo "La base de datos '${DB_NAME}' ya existe."
else
  sudo -u postgres createdb "${DB_NAME}"
  echo "Base de datos '${DB_NAME}' creada correctamente."
fi

echo "PostgreSQL listo para el examen."
