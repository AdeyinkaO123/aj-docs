from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Document, User
from schemas import DocumentSummary

router = APIRouter(prefix="/api/trash", tags=["trash"])


@router.get("/", response_model=List[DocumentSummary])
def list_trash(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    docs = db.query(Document).filter(
        Document.owner_id == user_id,
        Document.deleted_at != None,  # noqa: E711
    ).order_by(Document.deleted_at.desc()).all()

    return [{**doc.__dict__, "owner": doc.owner, "is_owner": True, "is_shared": False} for doc in docs]


@router.post("/{doc_id}/restore")
def restore_document(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.deleted_at != None,  # noqa: E711
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found in trash")
    if doc.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can restore")

    doc.deleted_at = None
    db.commit()
    return {"ok": True}


@router.delete("/{doc_id}")
def permanent_delete(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.deleted_at != None,  # noqa: E711
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found in trash")
    if doc.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can permanently delete")

    db.delete(doc)
    db.commit()
    return {"ok": True}
