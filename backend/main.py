from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from agents import run_query

app = FastAPI(title="CrewAI Query Router")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Query(BaseModel):
    query: str


@app.post("/api/ask")
def ask(body: Query):
    q = body.query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query is empty.")
    try:
        return run_query(q)
    except Exception as e:  # surfaces LLM/key errors to the UI
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve the frontend from the same server -> one command to run everything
FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="frontend")
