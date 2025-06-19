# ClassSwift Teacher Dashboard - Development Makefile

.PHONY: help dev up down logs clean

# Default target
help: ## Show available commands
	@echo "Development Commands:"
	@echo "  dev     - Start development with live reloading"
	@echo "  up      - Start services in background"
	@echo "  down    - Stop all services"
	@echo "  logs    - Show service logs"
	@echo "  clean   - Clean restart (removes data)"

# Core Commands
dev: ## Start development environment with live reloading
	docker-compose up --watch

up: ## Start services in detached mode
	docker-compose up -d

down: ## Stop and remove containers
	docker-compose down

logs: ## Show logs for all services
	docker-compose logs -f

clean: ## Clean restart - removes volumes
	docker-compose down --volumes
	docker-compose up --watch