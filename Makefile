# ClassSwift Teacher Dashboard - Makefile

.PHONY: help dev up down logs clean backend-only frontend-only status \
        docker-build docker-build-prod be-unit-test be-integration-test be-e2e-test

# Default target
help: ## Show available commands
	@echo "ClassSwift Teacher Dashboard - Available Commands:"
	@echo ""
	@echo "🚀 Development Commands:"
	@grep -E '^(dev|up|down|logs|clean|backend-only|frontend-only|status):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'
	@echo ""
	@echo "🐳 Docker Commands:"
	@grep -E '^(docker-.*):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'
	@echo ""
	@echo "🧪 Docker Test Commands:"
	@grep -E '^(be-unit-test|be-integration-test|be-e2e-test):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# Development Commands
# =============================================================================

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
	docker builder prune --all

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

# =============================================================================
# Docker Build Commands
# =============================================================================

docker-build: ## Build Docker images for development
	@echo "🐳 Building Docker images for development..."
	docker-compose build

docker-build-prod: ## Build Docker images for production
	@echo "🐳 Building Docker images for production..."
	docker build -f frontend/Dockerfile -t classswift/frontend:latest ./frontend
	docker build -f backend/Dockerfile -t classswift/backend:latest ./backend


# =============================================================================
# Docker Test Commands
# =============================================================================

be-unit-test: ## Run all Go backend unit tests (excluding integration/e2e)
	cd ./backend && go test -count=1 ./internal/... ./config/... ./pkg/... ./api/... ./cmd/...

be-integration-test: ## Run backend integration tests with test DB
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml up -d
	cd ./backend && go test -count=1 ./tests/integration/...
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml down

be-e2e-test: ## Run backend e2e tests with test server
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml up -d
	cd ./backend && go test -count=1 ./tests/e2e/...
	docker-compose -f ./backend/tests/docker/docker-compose.test.yml down