# Documenting how I leveraged AI

This project was developed using Gemini 3 Flash as a specialised architectural collaborator and Cursor for code generation. The goal was to produce a PoC within a strict 2-hour window.

## Key Prompts

Each prompt was paired with the [`CONTEXT.md`](./CONTEXT.md) and [`.cursorrules`](./.cursorrules) files to ensure the project context was never lost and the coding guidelines were enforced.

- Project Scaffolding: "Create a Node.js Express API with TypeScript using a Service-Controller-Route architecture. Use an in-memory Map for storage and Zod for schema validation."
- Logic Refinement: "Implement a Node.js EventEmitter in the Service layer to handle asset lifecycle events, specifically `assetCreated`."
- Quality Assurance: "Generate a Jest and Supertest suite covering happy paths for CRUD and edge cases for Zod validation errors."

## Tooling & Model Selection

- Cursor IDE: Love the Composer and Inline Diff features to review AI suggestions line-by-line
- Claude Sonnet 4.6: Chose Sonnet over Opus for its balance of speed and logical precision. It provides great output with higher efficiency, allowing for rapid iteration and relatively low API/token usage.

## Review Workflow

My workflow followed a strict Propose, Review, Refine cycle:

- Propose: Prompted the AI to generate logic based on my architectural rules (defined in [`.cursorrules`](./.cursorrules)).
- Review: Used Cursor's diff tool to inspect every change. I specifically looked for hallucinated fields or unnecessary dependencies.
- Refine: For simple tasks with a small context window, minimal refinement was required. In contrast, production systems, whether monoliths or microservices, deeper project understanding is required. AI-generated code may work but can still be misaligned with existing conventions, architecture, or long-term product direction, which the developer must account for.
