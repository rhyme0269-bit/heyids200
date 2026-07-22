#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")" && pwd)"
python3 "$DIR/dashboard.py" "$@"
