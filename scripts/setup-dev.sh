#!/usr/bin/env bash
#
# One-time local development bootstrap for EdMarg.
#
# Creates backend/.env and frontend/.env.local from the committed templates
# (only if they don't already exist) and injects a strong random JWT secret so
# the backend boots without manual editing.
#
# Usage: ./scripts/setup-dev.sh   (or: make setup)

set -euo pipefail

# Resolve the repo root regardless of where the script is invoked from.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { printf "${BLUE}==>${NC} %s\n" "$1"; }
ok()    { printf "${GREEN}✓${NC} %s\n" "$1"; }
warn()  { printf "${YELLOW}!${NC} %s\n" "$1"; }

# Generate a URL-safe random secret (falls back if openssl is unavailable).
random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '\n/+=' | cut -c1-48
  else
    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  fi
}

info "Setting up EdMarg local development environment..."

# --- Backend env -----------------------------------------------------------
if [ -f backend/.env ]; then
  warn "backend/.env already exists — leaving it untouched."
else
  cp backend/.env.example backend/.env
  SECRET="$(random_secret)"
  # Replace the placeholder secret with a generated one (portable sed).
  if sed --version >/dev/null 2>&1; then
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${SECRET}|" backend/.env
  else
    # BSD/macOS sed requires an explicit backup suffix.
    sed -i '' "s|^JWT_SECRET=.*|JWT_SECRET=${SECRET}|" backend/.env
  fi
  ok "Created backend/.env with a generated JWT_SECRET."
fi

# --- Frontend env ----------------------------------------------------------
if [ -f frontend/.env.local ]; then
  warn "frontend/.env.local already exists — leaving it untouched."
else
  cp frontend/.env.example frontend/.env.local
  ok "Created frontend/.env.local."
fi

echo
ok "Environment files are ready."
info "Optional: add Cloudinary / Zoom / SMTP / Clerk credentials to backend/.env"
info "          to enable uploads, video sessions, email, and auth webhooks."
echo
info "Next steps:"
echo "  make dev        # start the full stack in Docker (hot reload)"
echo "  make seed       # seed the admin user + sample assessments"
echo "  make logs       # tail service logs"
