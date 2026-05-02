# AI Workflow Note

## Which AI tools I used

- **Claude (claude.ai)** — used for the initial brainstorm and planning session: talking through architecture decisions, data model design, and feature scope before any code was written
- **Claude Code** — used to scaffold and build the entire project from scratch (all 28+ files), run tests, debug issues, and iterate on features locally

---

## Where AI materially sped up my work

**Architecture and scoping (biggest time save)**
Instead of spending an hour mapping out the data model, API surface, and component structure, I used Claude as a thinking partner. We talked through tradeoffs — SQLite vs Supabase, HTML vs Tiptap JSON, single deployment vs split frontend/backend — and landed on decisions in minutes that would have taken much longer solo. The DB schema and component structure we agreed on before writing a line of code meant there were no structural surprises mid-build.

**Full project scaffolding**
Claude Code generated the entire working project — FastAPI routers, SQLAlchemy models, Pydantic schemas, Vite config, all React components, and the test suite — in a single session. FastAPI routers, SQLAlchemy models, Pydantic schemas, Vite config, and package.json are all genuinely tedious to write from scratch. I estimate this saved 2–3 hours of mechanical work and documentation lookup.

**Tiptap integration**
I had not used Tiptap before this project. Claude Code produced a working editor with the correct extensions (StarterKit, Underline) configured correctly on the first attempt, including the autosave debounce and stale-closure fix using refs — skipping the documentation spelunking that would have eaten significant time.

**Test scaffolding**
The pytest suite — including the in-memory DB override with `StaticPool` — was generated and debugged correctly. The first attempt used a plain `sqlite://` URL which creates a fresh DB per connection; Claude Code diagnosed the "no such table" error and fixed it with `StaticPool` immediately. Writing and debugging seven meaningful tests from scratch would have taken 30–40 minutes.

**Iterative feature additions**
After the initial build, two features were added through natural conversation: a Google Docs-inspired sidebar redesign (action cards, recent documents section) and a soft-delete trash system with restore and permanent delete. Each was implemented end-to-end — backend model change, new router, API calls, and UI — in a single exchange.

---

## What AI-generated output I changed or rejected

**Persona bubble placement**
The initial suggestion was to put the user switcher in the navbar as a standard dropdown. I pushed back on this because I wanted it visually distinct from the product UI — clearly a demo mechanism, not a real auth feature. The final implementation (avatar circle, top-right, labeled "Demo — switch user") was my direction; Claude Code executed it.

**`getAllUsers` in api.js**
The brainstorm session had floated a `getAllUsers` API call, which would have been a workaround that hit a documents endpoint to infer users. I rejected it and instead hardcoded `SEED_USERS` directly in `App.jsx`, which is more honest and simpler. The API doesn't need a `/users` endpoint for this scope.

**Upload error handling flow**
The first draft of the upload component validated file type only on the backend and surfaced errors generically. I directed Claude Code to add client-side extension validation in `Sidebar.jsx` before the file is sent, so users get immediate feedback rather than a round-trip error.

**Architecture note depth**
Claude produced a solid first draft of `architecture.md`. I reviewed each decision and shaped the "what I would add with more time" section based on my own genuine priorities — real auth, Postgres with Alembic, WebSocket collaboration — rather than accepting a generic list.

---

## How I verified correctness, UX quality, and implementation reliability

**Correctness**
- Ran all 7 pytest tests against the actual backend; verified they passed cleanly
- Caught and fixed a real bug during the test run: in-memory SQLite with multiple connections requires `StaticPool`, which Claude Code diagnosed and corrected from the error output
- Manually tested document CRUD, file upload for all three types, share + revoke, soft delete, restore, and permanent delete via the running app
- Checked access control: confirmed a user without ownership or shared access gets a 403

**UX quality**
- Walked through the full user flow as each of the three demo users
- Verified the owned vs shared distinction was immediately readable in the sidebar and header badges
- Confirmed the persona bubble read as a demo mechanism, not a product feature
- Verified the trash section collapsed/expanded correctly and that restored documents reappeared in the sidebar immediately

**Implementation reliability**
- Verified autosave fired correctly by watching the "Saved" indicator and checking the DB
- Confirmed documents survived page refresh with formatting intact
- Tested switching users mid-session and verified document visibility updated correctly
- Checked that the `.docx` parser preserved headings, bold, and italic from a real Word file
