from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Document, SharedAccess, User
from schemas import UserOut

router = APIRouter(prefix="/api/sharing", tags=["sharing"])


@router.get("/{doc_id}/access", response_model=List[UserOut])
def get_shared_users(doc_id: int, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can view sharing")

    return [sa.shared_with for sa in doc.shared_access]


@router.post("/{doc_id}/access")
def grant_access(doc_id: int, user_id: int, target_user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can share")
    if target_user_id == user_id:
        raise HTTPException(status_code=422, detail="Cannot share with yourself")

    target = db.query(User).filter(User.id == target_user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")

    existing = db.query(SharedAccess).filter(
        SharedAccess.document_id == doc_id,
        SharedAccess.shared_with_id == target_user_id,
    ).first()
    if existing:
        return {"ok": True, "message": "Already shared"}

    sa = SharedAccess(document_id=doc_id, shared_with_id=target_user_id)
    db.add(sa)
    db.commit()
    return {"ok": True}


@router.delete("/{doc_id}/access/{target_user_id}")
def revoke_access(doc_id: int, target_user_id: int, user_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the owner can revoke access")

    sa = db.query(SharedAccess).filter(
        SharedAccess.document_id == doc_id,
        SharedAccess.shared_with_id == target_user_id,
    ).first()
    if not sa:
        raise HTTPException(status_code=404, detail="Access not found")

    db.delete(sa)
    db.commit()
    return {"ok": True}
