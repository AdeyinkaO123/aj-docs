from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Document, SharedAccess, User
from schemas import DocumentCreate, DocumentOut, DocumentSave, DocumentRename, DocumentSummary

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _enrich(doc: Document, current_user_id: int) -> dict:
    shared_ids = [s.shared_with_id for s in doc.shared_access]
    return {
        **doc.__dict__,
        "owner": doc.owner,
        "is_owner": doc.owner_id == current_user_id,
        "is_shared": current_user_id in shared_ids,
    }


@router.get("/", response_model=List[DocumentSummary])
def list_documents(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    owned = db.query(Document).filter(
        Document.owner_id == user_id,
        Document.deleted_at == None,  # noqa: E711
    ).all()

    shared_doc_ids = (
        db.query(SharedAccess.document_id)
        .filter(SharedAccess.shared_with_id == user_id)
        .all()
    )
    shared_doc_ids = [r[0] for r in shared_doc_ids]
    shared = db.query(Document).filter(
        Document.id.in_(shared_doc_ids),
        Document.deleted_at == None,  # noqa: E711
    ).all()

    results = []
    for doc in owned:
        results.append({**doc.__dict__, "owner": doc.owner, "is_owner": True, "is_shared": False})
    for doc in shared:
        results.append({**doc.__dict__, "owner": doc.owner, "is_owner": False, "is_shared": True})

    return results


@router.post("/", response_model=DocumentOut)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.owner_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    doc = Document(
        title=payload.title.strip() or "Untitled Document",
        content=payload.content,
        owner_id=payload.owner_id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {**doc.__dict__, "owner": doc.owner, "is_owner": True, "is_shared": False}


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.deleted_at == None).first()  # noqa: E711
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    shared_ids = [s.shared_with_id for s in doc.shared_access]
    if doc.owner_id != user_id and user_id not in shared_ids:
        raise HTTPException(status_code=403, detail="Access denied")

    return _enrich(doc, user_id)


@router.patch("/{doc_id}/save", response_model=DocumentOut)
def save_document(doc_id: int, payload: DocumentSave, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.deleted_at == None).first()  # noqa: E711
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    shared_ids = [s.shared_with_id for s in doc.shared_access]
    if doc.owner_id != user_id and user_id not in shared_ids:
        raise HTTPException(status_code=403, detail="Access denied")

    doc.content = payload.content
    if payload.title is not None:
        doc.title = payload.title.strip() or doc.title
    db.commit()
    db.refresh(doc)
    return _enrich(doc, user_id)


@router.patch("/{doc_id}/rename", response_model=DocumentOut)
def rename_document(doc_id: int, payload: DocumentRename, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.deleted_at == None).first()  # noqa: E711
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can rename")

    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")

    doc.title = title
    db.commit()
    db.refresh(doc)
    return _enrich(doc, user_id)


@router.delete("/{doc_id}")
def delete_document(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.deleted_at == None).first()  # noqa: E711
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can delete")

    doc.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}
