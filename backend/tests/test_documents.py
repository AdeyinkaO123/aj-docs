import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models import User

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# Seed test users into the in-memory DB
_db = TestingSessionLocal()
if _db.query(User).count() == 0:
    _db.add_all([
        User(id=1, name="Alice", email="alice@ajaia.com", avatar_color="#7C3AED"),
        User(id=2, name="Bob", email="bob@ajaia.com", avatar_color="#0D9488"),
        User(id=3, name="Carol", email="carol@ajaia.com", avatar_color="#DC2626"),
    ])
    _db.commit()
_db.close()

client = TestClient(app)


def test_create_document():
    res = client.post("/api/documents/", json={"owner_id": 1, "title": "Test Doc", "content": "<p>Hello</p>"})
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Test Doc"
    assert data["owner_id"] == 1
    assert data["is_owner"] is True


def test_list_documents():
    client.post("/api/documents/", json={"owner_id": 1, "title": "List Test", "content": ""})
    res = client.get("/api/documents/?user_id=1")
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_get_document():
    create_res = client.post("/api/documents/", json={"owner_id": 1, "title": "Get Test", "content": "<p>Content</p>"})
    doc_id = create_res.json()["id"]
    res = client.get(f"/api/documents/{doc_id}?user_id=1")
    assert res.status_code == 200
    assert res.json()["content"] == "<p>Content</p>"


def test_save_document():
    create_res = client.post("/api/documents/", json={"owner_id": 1, "title": "Save Test", "content": ""})
    doc_id = create_res.json()["id"]
    res = client.patch(f"/api/documents/{doc_id}/save?user_id=1", json={"content": "<p>Updated</p>"})
    assert res.status_code == 200
    assert res.json()["content"] == "<p>Updated</p>"


def test_rename_document():
    create_res = client.post("/api/documents/", json={"owner_id": 1, "title": "Old Name", "content": ""})
    doc_id = create_res.json()["id"]
    res = client.patch(f"/api/documents/{doc_id}/rename?user_id=1", json={"title": "New Name"})
    assert res.status_code == 200
    assert res.json()["title"] == "New Name"


def test_delete_document():
    create_res = client.post("/api/documents/", json={"owner_id": 1, "title": "Delete Me", "content": ""})
    doc_id = create_res.json()["id"]
    res = client.delete(f"/api/documents/{doc_id}?user_id=1")
    assert res.status_code == 200
    get_res = client.get(f"/api/documents/{doc_id}?user_id=1")
    assert get_res.status_code == 404


def test_access_control():
    create_res = client.post("/api/documents/", json={"owner_id": 1, "title": "Private Doc", "content": ""})
    doc_id = create_res.json()["id"]
    # Bob (user 2) has no access yet
    res = client.get(f"/api/documents/{doc_id}?user_id=2")
    assert res.status_code == 403
