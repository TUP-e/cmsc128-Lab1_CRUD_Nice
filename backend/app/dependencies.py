from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import supabase
from app.security import decode_access_token

# auto_error=False so we can return our own 401 message
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """
    Reads 'Authorization: Bearer <token>', verifies it, and loads the user.
    Add Depends(get_current_user) to any route that must be protected.
    The password hash is never selected, so it can't leak from here.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    result = (
        supabase.table("users")
        .select("id, email, display_name, created_at")
        .eq("id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=401, detail="Account not found.")

    return result.data[0]