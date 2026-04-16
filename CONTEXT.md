# Project Context: Simple Streaming Asset API

## Objective

Build a proof-of-concept (PoC) REST API for managing media assets. The goal is to demonstrate clean code, event-driven thinking, and pragmatic decision-making under a 2-hour limit.

## Stack

- Node.js + TypeScript + Express
- Jest + Supertest
- In-memory Map store
- Node.js EventEmitter + SSE

## Key Requirements

1. **CRUD:** Focus on Create and Retrieve (with filtering).
2. **Events:** Assets must emit events (e.g., `assetCreated`) using `EventEmitter` for downstream actions.
3. **Filtering:** Support filtering assets by `status` (e.g., UPLOADED, PUBLISHED) or `contentType` (VOD, LIVE).
4. **Testing:** High-value integration tests using Jest and Supertest.
