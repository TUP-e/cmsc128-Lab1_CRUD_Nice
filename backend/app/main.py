from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tasks, auth

app = FastAPI(title="To-Do List API")

# Allow the Vite dev server to call this API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/")
def root():
    return {"status": "ok", "message": "To-Do List API is running"} 