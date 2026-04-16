# Stream AMG Media Asset API

A PoC REST API for managing media assets, built in Node.js + TypeScript. The goal was to demonstrate clean architecture, event-driven thinking, and pragmatic decision-making under time constraints.

## Getting Started

### Prerequisites

- Node.js v18+

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/arsy786/stream-amg-api
cd stream-amg-api
npm install
```

### Running Locally

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Start with hot-reload via `ts-node-dev` |
| `npm run build`         | Compile TypeScript to `dist/`           |
| `npm start`             | Run the compiled build                  |
| `npm test`              | Run the Jest + Supertest suite          |
| `npm run test:coverage` | Run tests with coverage report          |

The server starts on **port 3000** by default.

---

## API Reference

Postman examples can be found in the `./manual-tests` folder.

### `POST /assets`

Create a new media asset.

**Body**

```json
{
	"title": "My Documentary",
	"contentType": "VOD",
	"status": "DRAFT",
	"url": "https://cdn.example.com/asset.mp4"
}
```

| Field         | Type         | Required | Values                                                      |
| ------------- | ------------ | -------- | ----------------------------------------------------------- |
| `title`       | string       | yes      | min 1 char                                                  |
| `contentType` | enum         | yes      | `VOD`, `LIVE_EVENT`, `HIGHLIGHT`                            |
| `status`      | enum         | yes      | `DRAFT`, `PROCESSING`, `PUBLISHED`, `FAILED`, `UNPUBLISHED` |
| `url`         | string (URL) | no       | valid URL                                                   |

**Response:** `201 Created` with the full asset including server-assigned `id` and `createdAt`.

---

### `GET /assets`

Retrieve all assets. Supports optional query filters - filters are ANDed together.

| Query param   | Example                             |
| ------------- | ----------------------------------- |
| `status`      | `?status=PUBLISHED`                 |
| `contentType` | `?contentType=VOD`                  |
| Combined      | `?status=PUBLISHED&contentType=VOD` |

**Response:** `200 OK` - array of matching assets (empty array if none match).

---

### `GET /assets/:id`

Retrieve a single asset by its UUID.

**Response:** `200 OK` with the asset, or `404` if not found.

---

### Validation errors

All `400` responses follow a consistent shape:

```json
{
	"error": "Validation failed",
	"details": {
		"title": ["Title is required"]
	}
}
```

---

## Architecture

The API follows a strict three-layer architecture: Routes → Controller → Service.

- Routes: Handle HTTP wiring.
- Controller: Translates HTTP requests to service calls; handles event registration.
- Service: Owns business logic, persistence (Map<string, MediaAsset>), and lifecycle events via Node's EventEmitter.

Event-Driven Audit: The AssetController registers a listener in its constructor. This demonstrates how side-effects (logging, notifications) are decoupled from the HTTP response path - a critical pattern for high-performance streaming pipelines.

```
src/
├── app.ts                      # Express app (no listen - keeps it testable)
├── index.ts                    # Entrypoint - binds port, imports app
├── models/
│   └── asset.model.ts          # Zod schemas + inferred TypeScript types
├── middleware/
│   └── validation.middleware.ts # Generic Zod body validation
├── controllers/
│   └── asset.controller.ts     # HTTP ↔ service translation + event listener
├── services/
│   └── asset.service.ts        # Business logic, Map store, EventEmitter
└── routes/
    └── asset.routes.ts         # Route definitions
```

## Key Technical Decisions

- Test-Ready: `app.ts` is decoupled from `listen()`, allowing Supertest to run integration tests without port collisions.
- Constructor Injection: Manual injection in the router ensures the code remains simple, readable, and testable.
- Zod for Validation: `z.infer<>` derives TypeScript types directly from schemas, eliminating type-drift.
- Contract-First Validation: A generic validation middleware ensures every request is sanitised and returns structured `fieldErrors`.

## Assumptions

- No authentication or authorisation: out of scope for a PoC. In production, routes would sit behind a JWT middleware layer.
- No PATCH/DELETE routes: the brief focused on Create and Retrieve. The `STATUS_CHANGED` event and `updateAssetStatus` method are stubbed in the service to demonstrate the event-driven pattern.
- No pagination: `GET /assets` returns the full collection. Acceptable for a bounded in-memory dataset.

## Scaling & Production Roadmap

1. Database

- Data Tier: Replace the Map with actual database PostgreSQL/DynamoDB.
- Horizontal Scaling: Moving state to Redis allows multiple Node.js instances to scale behind a load balancer (AWS ELB/NGINX) without coordination issues.

2. Event Driven

- Message Broker: Transition from EventEmitter to AWS EventBridge, SQS, or Kafka. This allows downstream consumers to fail and retry independently of the API.

3. Edge Performance & Resiliency

- Traffic Management: Deploy the service behind an AWS Elastic Load Balancer (ELB) to distribute traffic across multiple Availability Zones, ensuring high availability during peak usage periods.

- Rate Limiting: Implement a multi-layered rate-limiting strategy

- Observability: Implement structured logging (Pino/Winston) streamed to CloudWatch/ELK and centralised error-handling middleware.

- Documentation: Export an OpenAPI/Swagger spec to define the API contract for external teams.

## AI Development Process

This project was built collaboratively with Cursor and Claude 4.6 Sonnet. Full documentation of is available in in [`AI_PROCESS.md`](./AI_PROCESS.md).
