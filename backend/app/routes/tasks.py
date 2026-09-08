from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from app.config import supabase
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()


@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate):
    """Insert a new task. created_at and is_done use DB defaults."""
    # model_dump converts enums to their string values automatically
    payload = task.model_dump(mode="json")

    result = supabase.table("tasks").insert(payload).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create task")

    return result.data[0]


@router.get("/", response_model=list[TaskResponse])
def get_tasks():
    """
    Return all active (non soft-deleted) tasks.
    Sorting and filtering are handled on the frontend since the
    dataset is small and this keeps the API simple.
    """
    result = (
        supabase.table("tasks")
        .select("*")
        .is_("deleted_at", "null")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str):
    """Fetch a single task by id."""
    result = supabase.table("tasks").select("*").eq("id", task_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")

    return result.data[0]


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task: TaskUpdate):
    """
    Update one or more fields of an existing task.
    Only fields explicitly provided by the client are sent to Supabase.
    """
    payload = task.model_dump(mode="json", exclude_unset=True)

    if not payload:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    result = supabase.table("tasks").update(payload).eq("id", task_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")

    return result.data[0]


@router.delete("/{task_id}")
def delete_task(task_id: str):
    """
    Soft-delete a task by setting deleted_at to the current timestamp.
    The task is hidden from GET /tasks but remains in the database
    so it can be restored via the Undo action.
    """
    now = datetime.now(timezone.utc).isoformat()

    result = (
        supabase.table("tasks")
        .update({"deleted_at": now})
        .eq("id", task_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"message": "Task deleted", "id": task_id}


@router.post("/{task_id}/restore", response_model=TaskResponse)
def restore_task(task_id: str):
    """
    Reverse a soft-delete by clearing deleted_at.
    Called when the user clicks Undo on the delete toast.
    """
    result = (
        supabase.table("tasks")
        .update({"deleted_at": None})
        .eq("id", task_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")

    return result.data[0]