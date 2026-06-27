# AGENTS

## Scope
- This file applies to the backend project in this folder.
- Prefer small, targeted edits and keep changes within the existing layered structure.

## Quick Start Commands
- Install dependencies in PowerShell: npm.cmd install
- Start server: npm.cmd start
- Development mode: npm.cmd run dev
- Seed database: npm.cmd run populate

## Project Entry Points
- App bootstrap: [main.js](main.js)
- Server lifecycle: [server.js](server.js)
- Database connection: [db.js](db.js)
- Express app wiring: [src/app.js](src/app.js)

## Architecture Boundaries
- Models: [src/models](src/models)
- Services: [src/services](src/services)
- Controllers: [src/controllers](src/controllers)
- Routes: [src/routes](src/routes)
- Middleware: [src/middleware](src/middleware)
- Utilities: [src/utils](src/utils)

Expected flow:
- Route -> Controller -> Service -> Model

## Route Mounts and API Surface
- Mounted API base paths are defined in [src/app.js](src/app.js).
- API endpoint reference: [resources/finalized-apis.md](resources/finalized-apis.md)
- Postman collection: [resources/threadhive-postman-collection.json](resources/threadhive-postman-collection.json)

## Repo Conventions
- Use ESM imports/exports only.
- Keep request validation in controllers and data logic in services.
- Return meaningful HTTP status codes and JSON error messages.
- Do not edit generated dependencies under node_modules.

## Known Pitfalls
- PowerShell execution policy may block npm.ps1. Use npm.cmd.
- This project currently uses header-based auth middleware with x-user-id on protected write routes.
- Auth service depends on JWT_SECRET and DB connection values from .env.
- DNS/SRV resolution can fail on some machines; non-SRV MongoDB URI may be required.

## Working Safely
- Do not print secrets from .env.
- Avoid broad refactors unless explicitly requested.
- After edits, run at least an app import check and syntax check before handing off.

## Linked Project Context
- Feature scope and priorities: [features.md](features.md)
- Review prompt and team context: [resources/review-code.prompt.md](resources/review-code.prompt.md)
- Starter guidance template: [resources/AGENTS-template.md](resources/AGENTS-template.md)
