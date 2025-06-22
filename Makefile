# ClassSwift Teacher Dashboard - Development Makefile

.PHONY: help dev up down logs clean backend-only frontend-only status be-integration-test be-unit-test be-e2e-test 

# Default target
help: ## Show available commands
	@echo "ClassSwift Teacher Dashboard - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'
	@echo ""

# Core Commands
dev: ## Start development environment with live reloading
	@echo "🚀 Starting ClassSwift development environment..."
	@echo "📁 Creating required directories..."
	@mkdir -p backend/migrations backend/tmp backend/bin
	@echo "🔧 Starting services with Docker Compose watch mode..."
	docker-compose up --watch

up: ## Start services in background
	@echo "🚀 Starting ClassSwift services in background..."
	@mkdir -p backend/migrations backend/tmp backend/bin
	docker-compose up -d

down: ## Stop all services
	@echo "🛑 Stopping ClassSwift services..."
	docker-compose down --volumes

logs: ## Show service logs
	@echo "📜 Showing service logs..."
	docker-compose logs -f

clean: ## Clean restart (removes data volumes)
	@echo "🧹 Cleaning up ClassSwift environment..."
	docker-compose down --volumes
	docker-compose build --no-cache
	@mkdir -p backend/migrations backend/tmp backend/bin
	docker-compose up --watch

backend-only: ## Start only backend services (backend, db, redis)
	@echo "🔧 Starting backend services only..."
	@mkdir -p backend/migrations backend/tmp backend/bin
	docker-compose up backend db redis --watch

frontend-only: ## Start only frontend service
	@echo "🎨 Starting frontend service only..."
	docker-compose up frontend --watch

status: ## Show service status
	@echo "📊 ClassSwift service status:"
	docker-compose ps

be-unit-test: ## Run all Go unit tests in the backend (excluding integration/e2e tests)
	cd ./backend && go test -count=1 ./internal/... ./config/... ./pkg/... ./api/... ./cmd/...

be-integration-test: ## Run integration tests with test DB
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml up -d
	sleep 3
	cd ./backend && go test -count=1 ./tests/integration/...
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml down

be-e2e-test: ## Run e2e tests with test server
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml up -d
	sleep 3
	cd ./backend && go test -count=1 ./tests/e2e/...
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml down