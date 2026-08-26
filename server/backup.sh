#!/usr/bin/env bash
set -euo pipefail

backup_dir="/var/backups/nellos-world"
timestamp=$(date -u +%Y%m%d-%H%M%S)
archive="$backup_dir/nellos-world-$timestamp.tar.gz"

install -d -m 700 "$backup_dir"
sqlite3 /var/lib/nellos-world/posts.db ".backup '$backup_dir/posts-$timestamp.db'"
tar -czf "$archive" \
  -C "$backup_dir" "posts-$timestamp.db" \
  -C /var/www/nellos-world.de uploads
rm -f "$backup_dir/posts-$timestamp.db"
find "$backup_dir" -type f -name 'nellos-world-*.tar.gz' -mtime +30 -delete
