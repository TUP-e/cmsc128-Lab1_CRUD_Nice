from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tasks

app = FastAPI(title="To-Do List API")
'''
 Allow the Vite dev server to call this API during development
 Central Hub of the backend that creates FastAPI
'''
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register task routes under /tasks
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])


@app.get("/")
def root():
    return {"status": "ok", "message": "To-Do List API is running"} 
