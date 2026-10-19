from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError

from app.config import supabase, FRONTEND_URL, DEMO_MODE, RESET_TOKEN_EXPIRE_MINUTES
from app.dependencies import get_current_user
from app.schemas_auth import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    ProfileUpdate, PasswordChange, ForgotPasswordRequest, ResetPasswordRequest,
)
from app.security import (
    hash_password, verify_password, create_access_token,
    generate_reset_token, hash_reset_token,
)

router = APIRouter()

USER_FIELDS = "id, email, display_name, created_at"


def to_user(row: dict) -> dict:
    """Strip a database row down to the public fields (never the hash)."""
    return {k: row[k] for k in ("id", "email", "display_name", "created_at")}


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest):
    email = body.email.lower()

    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    try:
        result = supabase.table("users").insert({
            "email": email,
            "display_name": body.display_name,
            "password_hash": hash_password(body.password),
        }).execute()
    except APIError as e:
        # 23505 = unique violation; covers two simultaneous sign-ups with one email
        if getattr(e, "code", None) == "23505":
            raise HTTPException(status_code=409, detail="An account with this email already exists.")
        raise

    user = result.data[0]
    return {"access_token": create_access_token(user["id"]), "user": to_user(user)}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    result = supabase.table("users").select("*").eq("email", body.email.lower()).execute()
    user = result.data[0] if result.data else None

    # One generic message for both cases so attackers can't tell which emails exist
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {"access_token": create_access_token(user["id"]), "user": to_user(user)}


@router.get("/me", response_model=UserResponse)
def me(current_user: dict = Depends(get_current_user)):
    """Used by the frontend on page load to restore the session from the stored token."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(body: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    # Ignore fields that were omitted or sent as null
    payload = {
        k: v for k, v in body.model_dump(mode="json", exclude_unset=True).items()
        if v is not None
    }
    if not payload:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    if "email" in payload:
        payload["email"] = payload["email"].lower()
        taken = (
            supabase.table("users").select("id")
            .eq("email", payload["email"])
            .neq("id", current_user["id"])
            .execute()
        )
        if taken.data:
            raise HTTPException(status_code=409, detail="That email is already in use.")

    result = (
        supabase.table("users").update(payload)
        .eq("id", current_user["id"]).execute()
    )
    return to_user(result.data[0])


@router.put("/password")
def change_password(body: PasswordChange, current_user: dict = Depends(get_current_user)):
    row = (
        supabase.table("users").select("password_hash")
        .eq("id", current_user["id"]).execute()
    ).data[0]

    if not verify_password(body.current_password, row["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    supabase.table("users").update(
        {"password_hash": hash_password(body.new_password)}
    ).eq("id", current_user["id"]).execute()

    return {"message": "Password updated."}


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest):
    """
    Demo recovery flow: no email service, so the reset link is printed in the
    backend terminal (and returned in the response when DEMO_MODE=true).
    """
    generic = {"message": "If that email is registered, a reset link has been generated."}

    result = supabase.table("users").select("id").eq("email", body.email.lower()).execute()
    if not result.data:
        return generic  # same response either way

    raw_token, token_hash = generate_reset_token()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    supabase.table("users").update({
        "reset_token_hash": token_hash,
        "reset_token_expires_at": expires_at.isoformat(),
    }).eq("id", result.data[0]["id"]).execute()

    link = f"{FRONTEND_URL}/reset-password?token={raw_token}"
    print(f"[DEMO] Password reset link for {body.email}: {link}")

    if DEMO_MODE:
        return {**generic, "demo_reset_link": link}
    return generic


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest):
    now = datetime.now(timezone.utc).isoformat()

    # Match on the token hash AND require the expiry to be in the future
    result = (
        supabase.table("users").select("id")
        .eq("reset_token_hash", hash_reset_token(body.token))
        .gt("reset_token_expires_at", now)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")

    # Set the new hash and clear the token so the link cannot be reused
    supabase.table("users").update({
        "password_hash": hash_password(body.new_password),
        "reset_token_hash": None,
        "reset_token_expires_at": None,
    }).eq("id", result.data[0]["id"]).execute()

    return {"message": "Password has been reset. You can now log in."}