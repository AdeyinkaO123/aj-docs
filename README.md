# Ajaia Docs

A lightweight collaborative document editor. Create, edit, upload, and share documents with your team.

**Live demo:** _[add your deployed URL here]_

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Editor | Tiptap v2 |
| Backend | FastAPI (Python) |
| Database | SQLite via SQLAlchemy |
| Deployment | Single service — FastAPI serves React build |

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py                  # creates DB + seeds Alice, Bob, Carol
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` — proxies `/api` to the backend automatically.

### Build for production (single deployment)

```bash
cd frontend
npm run build                   # outputs to frontend/dist/
cd ../backend
uvicorn main:app                # serves API + React static files
```

---

## Running Tests

```bash
cd backend
pytest tests/test_documents.py -v
```

Tests use an isolated in-memory SQLite database — no setup required.

---

## Demo Users

The app is pre-seeded with 3 demo users:

| Name | Email | Color |
|---|---|---|
| Alice | alice@ajaia.com | Purple |
| Bob | bob@ajaia.com | Teal |
| Carol | carol@ajaia.com | Red |

Use the **persona bubble** (top right corner) to switch between users and demonstrate sharing.

---

## Features

- **Create & edit documents** with a full rich-text editor (bold, italic, underline, headings H1–H3, bullet lists, numbered lists, blockquotes)
- **Rename documents** by clicking the title in the header (owners only)
- **Autosave** — content saves automatically 1.5s after you stop typing
- **Upload files** — `.txt`, `.md`, and `.docx` files are imported as new editable documents
- **Share documents** — grant access to other users; revoke at any time
- **Owned vs shared** — clear visual distinction in the sidebar and header badges
- **Persistent** — all documents and sharing data survive refresh via SQLite

---

## File Upload

Supported formats: `.txt`, `.md`, `.docx`

- `.txt` — plain text, wrapped in paragraphs
- `.md` — converted to HTML via Python `markdown` library
- `.docx` — parsed with `python-docx`, preserving headings, bold, italic, and underline

Maximum file size: 5MB.

---

## Deployment (Render)

1. Push to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Set build command: `cd frontend && npm install && npm run build`
4. Set start command: `cd backend && pip install -r requirements.txt && python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env var: `PYTHON_VERSION=3.11`
