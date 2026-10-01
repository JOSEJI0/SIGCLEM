#!/bin/bash
# Actualiza y reinicia SIGCLEM en el servidor.
set -e
echo "=== SIGCLEM: despliegue ==="
[ -f .env ] || { echo "Falta el archivo .env (copia .env.example)"; exit 1; }
git pull
docker compose up -d --build
echo "Esperando a que la API arranque..."
sleep 15
docker compose ps
docker compose logs api --tail 30
echo "=== Despliegue terminado ==="
