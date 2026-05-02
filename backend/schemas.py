from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    avatar_color: str

    model_config = {"from_attributes": True}


class DocumentCreate(BaseModel):
    owner_id: int
    title: str = "Untitled Document"
    content: str = ""


class DocumentSave(BaseModel):
    content: str
    title: Optional[str] = None


class DocumentRename(BaseModel):
    title: str


class DocumentSummary(BaseModel):
    id: int
    title: str
    owner_id: int
    owner: UserOut
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_owner: bool
    is_shared: bool

    model_config = {"from_attributes": True}


class DocumentOut(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    owner: UserOut
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    is_owner: bool
    is_shared: bool

    model_config = {"from_attributes": True}
