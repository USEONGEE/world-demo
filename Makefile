IMAGE ?= world-gate:local
CONTAINER ?= world-gate
PORT ?= 3000
ENV_FILE ?= .env.local

.PHONY: build up down logs dev

build:
	docker build -t $(IMAGE) .

up: build
	@if [ -f "$(ENV_FILE)" ]; then \
		docker run --rm --name $(CONTAINER) -p $(PORT):3000 --env-file $(ENV_FILE) $(IMAGE); \
	else \
		docker run --rm --name $(CONTAINER) -p $(PORT):3000 $(IMAGE); \
	fi

down:
	-@docker rm -f $(CONTAINER) >/dev/null 2>&1 || true

logs:
	docker logs -f $(CONTAINER)

dev:
	pnpm dev
