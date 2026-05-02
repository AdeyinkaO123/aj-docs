# Architecture Note

## What I prioritized and why

### Single deployment over microservices
FastAPI serves both the API and the compiled React build from one process. For a demo-scoped project this reduces ops complexity to zero — one URL, one service, no CORS configuration to debug, no separate frontend host. The tradeoff is that frontend and backend must be built together before deployment, which is fine at this scope.

### SQLite over hosted Postgres
SQLite gives us zero-setup persistence that works identically in development and on a single-instance deployment (Render, Fly.io). The file lives next to the app. For a real multi-user product I'd migrate to Postgres with a connection pool — but for demonstrating persistence and sharing behavior, SQLite is the right call under time pressure.

### HTML string over Tiptap JSON for document storage
Tiptap can export either HTML or its own JSON format. I chose HTML because:
- It's human-readable in the database (a reviewer can inspect it directly)
- It loads back into Tiptap with a single `setContent()` call
- It's trivially renderable in a read-only view without Tiptap
- The JSON format offers more extensibility but at the cost of coupling to Tiptap's schema version

### Seeded users over real auth
The assignment required a visible sharing model. Real auth (OAuth, JWT, sessions) would have consumed 30–40% of the timebox without adding product value to the demo. Three seeded users with a persona bubble lets reviewers explore the full sharing flow immediately — and the bubble's "Demo" label makes the mechanism transparent rather than deceptive.

### Autosave over explicit save button
Autosave (1.5s debounce after last keystroke) matches the mental model users have from Google Docs. An explicit save button would be safer from a data-loss perspective but creates unnecessary friction. The debounce prevents excessive API calls without making the user think about saving.

### Router-per-feature over a monolithic main.py
Three routers (`documents`, `upload`, `sharing`) keep concerns separated. Each is independently readable and testable. This pattern scales well — adding a comments feature, for example, would be a new `routers/comments.py` with no changes to existing files.

## What I would add with more time

- **Real authentication** — JWT tokens, proper session management, user registration
- **Postgres + Alembic** — migrations, connection pooling, production-ready storage
- **Real-time collaboration** — WebSocket-based cursor sharing and operational transforms (or CRDTs)
- **Document versioning** — store snapshots so users can revert to previous versions
- **Richer permissions** — view-only vs edit access, link-based sharing
- **Search** — full-text search across document content
- **Better test coverage** — upload parsing tests, sharing edge cases, frontend component tests with Vitest
