#!/usr/bin/env bash
set -euo pipefail

: "${DB_HOST:=db}"
: "${DB_PORT:=3306}"
: "${DB_USER:=root}"
: "${DB_PASSWORD:=password}"
: "${SEED_MARKER:=/var/lib/tour-booking/.seeded}"

echo "[entrypoint] waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
until mysqladmin ping -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" --silent; do
    sleep 2
done
echo "[entrypoint] MySQL is up."

mkdir -p "$(dirname "${SEED_MARKER}")"
if [ ! -f "${SEED_MARKER}" ]; then
    echo "[entrypoint] first boot detected — running database/seed.py"
    python database/seed.py
    touch "${SEED_MARKER}"
    echo "[entrypoint] seed complete."
else
    echo "[entrypoint] seed marker present — skipping seed."
fi

exec "$@"
