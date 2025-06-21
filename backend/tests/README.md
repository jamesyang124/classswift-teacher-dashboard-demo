# This README explains the test folder structure and usage.

## Structure

- integration/: Integration tests using real DB or HTTP server
- e2e/: End-to-end tests for full user flows
- data/: Seed data for test DB
- docker/: Docker Compose for test DB

## Usage

- To run integration tests, ensure the test DB is running:

  docker-compose -f tests/docker/docker-compose.test.yml up -d

- To run all tests:

  cd backend
  go test ./...

- To run only integration or e2e tests:

  go test ./tests/integration/...
  go test ./tests/e2e/...

- To seed the test DB, use the provided seed.sql or let Docker Compose do it on container start.

- Set TEST_DATABASE_URL if you want to override the default test DB connection string.
