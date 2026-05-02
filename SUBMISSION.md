# SUBMISSION.md

## What is included in this folder

| File / Folder | Description |
|---|---|
| `README.md` | Local setup and run instructions, feature list, deployment guide |
| `architecture.md` | Architecture decisions, tradeoffs, and what I'd build next |
| `AI_WORKFLOW.md` | AI tools used, where AI helped, what I changed, how I verified |
| `SUBMISSION.md` | This file |
| `VIDEO.txt` | Walkthrough video link |
| `backend/` | FastAPI app — models, routers, seed script, tests |
| `frontend/` | React + Vite app — Tiptap editor, all components |

---

## Live deployment

**URL:** _[add your deployed URL here]_

> **Note:** The app is hosted on Render's free tier. If the service has been inactive for 15+ minutes it will spin down and take ~30 seconds to cold-start on the first request. This is expected — just wait a moment and refresh if the page doesn't load immediately.

---

## Test accounts (seeded)

| Name | Email | Role in demo |
|---|---|---|
| Alice | alice@ajaia.com | Default user, owns the welcome document |
| Bob | bob@ajaia.com | Use to demonstrate receiving a shared document |
| Carol | carol@ajaia.com | Third user for multi-share scenarios |

Switch between users using the **avatar bubble in the top-right corner** of the app. It is labeled "Demo — switch user" to make clear it is a demo mechanism, not a real auth flow.

---

## Running locally

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## What is working end to end

- Document creation, renaming, editing, saving, and reopening
- Rich text formatting: bold, italic, underline, H1/H2/H3, bullet lists, numbered lists, blockquote
- Autosave (1.5s debounce after last keystroke)
- File upload: `.txt`, `.md`, `.docx` — imported as a new editable document
- Sharing: grant access to another user, revoke access, owned vs shared distinction in sidebar and header
- **Trash / recently deleted**: deleting a document moves it to a recoverable trash bin; users can restore or permanently delete from the sidebar
- Google Docs-inspired sidebar: prominent "New document" and "Upload file" action cards, "Recent documents" list, collapsible trash section at the bottom
- Persistence: all data (documents, sharing, trash state) survives refresh via SQLite
- 7 automated pytest tests covering core document flows

---

## What is intentionally incomplete

| Feature | Decision |
|---|---|
| Real authentication | Simulated with seeded users and a persona bubble. Real JWT auth would take 30–40% of the timebox for no additional demo value. |
| Real-time collaboration | Out of scope — would require WebSockets and operational transforms or CRDTs. |
| View-only vs edit permissions | Sharing currently grants edit access. A `permission` column on `shared_access` would be a straightforward addition. |
| `/users` API endpoint | Users are hardcoded in the frontend. For this scope, a dedicated endpoint wasn't worth the added surface area. |
| Auto-purge of trash | Deleted documents are kept indefinitely until manually purged. A 30-day auto-delete policy would be a simple cron job addition. |

---

## What I would build next with another 2–4 hours

1. **Real auth** — JWT tokens, login page, user registration
2. **Postgres + Alembic** — production-grade storage with migrations
3. **View-only sharing** — a `permission` field (`view` | `edit`) on `shared_access`
4. **Document versioning** — snapshot content on each save, allow revert
5. **Broader test coverage** — upload parsing tests, sharing edge cases, trash lifecycle, frontend component tests with Vitest
