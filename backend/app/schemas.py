from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum

# Pydantic models for request and response validation

class Priority(str, Enum):    
    LOW = "Low"
    MED = "Med"
    HIGH = "High"


class Tag(str, Enum):
    SCHOOL = "School"
    PERSONAL = "Personal"
    OTHERS = "Others"


class TaskBase(BaseModel):
    """Shared fields for creating and updating a task."""
    title: str = Field(..., min_length=1, max_length=100)
    due_date: datetime
    priority: Priority
    tag: Tag


class TaskCreate(TaskBase):
    """Fields required when creating a new task."""
    ...


class TaskUpdate(BaseModel):
    """
    Fields allowed when updating a task.
    All optional so the client can send only the fields that changed.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    due_date: Optional[datetime] = None
    priority: Optional[Priority] = None
    tag: Optional[Tag] = None
    is_done: Optional[bool] = None


class TaskResponse(TaskBase):
    """Full task shape returned by the API."""
    id: str
    is_done: bool
    created_at: datetime
    deleted_at: Optional[datetime] = None