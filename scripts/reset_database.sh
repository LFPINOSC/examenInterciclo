#!/usr/bin/env bash
set -euo pipefail
DB_NAME="${DB_NAME:-biblioteca_examen}"

echo "ADVERTENCIA: se borrará por completo la base de datos '${DB_NAME}'."
echo "Detén el backend antes de continuar."
read -r -p "Escribe REINICIAR para continuar: " CONFIRM
if [[ "$CONFIRM" != "REINICIAR" ]]; then
  echo "Operación cancelada."
  exit 0
fi

sudo -u postgres dropdb --if-exists --force "$DB_NAME"
sudo -u postgres createdb "$DB_NAME"

echo "Base '${DB_NAME}' recreada y vacía."
echo "Ahora inicia Spring Boot: Hibernate creará las tablas y DataInitializer solo creará admin y lector."
