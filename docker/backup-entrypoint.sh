#!/bin/sh
set -e

mkdir -p /backups

while true; do
  TS=$(date +%F_%H-%M-%S)
  echo "[backup] $TS"
  PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h postgres -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
    | gzip > "/backups/${POSTGRES_DB}_${TS}.sql.gz"
  RETENTION="${BACKUP_RETENTION_DAYS:-7}"
  find /backups -type f -name "*.sql.gz" -mtime "+${RETENTION}" -delete
  sleep 86400
done
