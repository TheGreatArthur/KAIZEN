.PHONY: install dev test lint build ci

install:
	pnpm install --frozen-lockfile

dev: install
	pnpm dev

test:
	pnpm test

lint:
	pnpm lint && pnpm typecheck

build:
	pnpm build

ci: lint test build
