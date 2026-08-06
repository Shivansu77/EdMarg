# EdMarg developer shortcuts.
# Run `make help` to see everything. Requires Docker + Docker Compose.

COMPOSE := docker compose -f docker-compose.dev.yml

.DEFAULT_GOAL := help
.PHONY: help setup dev up build down stop restart logs logs-backend logs-frontend \
        seed shell-backend shell-frontend mongo ps clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

setup: ## Create .env files from templates (run once)
	@bash scripts/setup-dev.sh

dev: setup ## Start the full stack with hot reload (foreground)
	@$(COMPOSE) up

up: setup ## Start the full stack in the background
	@$(COMPOSE) up -d

build: ## Rebuild images (after dependency changes)
	@$(COMPOSE) up --build -d

down: ## Stop and remove containers
	@$(COMPOSE) down

stop: ## Stop containers without removing them
	@$(COMPOSE) stop

restart: ## Restart all services
	@$(COMPOSE) restart

logs: ## Tail logs for all services
	@$(COMPOSE) logs -f

logs-backend: ## Tail backend logs
	@$(COMPOSE) logs -f backend

logs-frontend: ## Tail frontend logs
	@$(COMPOSE) logs -f frontend

seed: ## Seed admin user + sample assessments (stack must be running)
	@$(COMPOSE) exec backend npm run seed:admin
	@$(COMPOSE) exec backend npm run seed:assessments

shell-backend: ## Open a shell in the backend container
	@$(COMPOSE) exec backend sh

shell-frontend: ## Open a shell in the frontend container
	@$(COMPOSE) exec frontend sh

mongo: ## Open a mongosh shell against the dev database
	@$(COMPOSE) exec mongodb mongosh edmarg_db

ps: ## Show running services
	@$(COMPOSE) ps

clean: ## Stop containers AND delete volumes (wipes the local database)
	@$(COMPOSE) down -v
