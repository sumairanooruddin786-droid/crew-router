# CrewAI Query Router

A multi-agent system built with CrewAI. A **Query Router** agent classifies each question as `MATH` or `EXPLAIN`, then hands it to either the **Math Expert** or the **Teacher** agent. A web UI shows which agent handled the question.

## Architecture
```
User question -> Query Router -> MATH    -> Math Expert -> answer
                              -> EXPLAIN -> Teacher     -> answer
```

## Project structure
```
backend/   agents.py (agents + routing), main.py (FastAPI), cli.py (terminal version)
frontend/  index.html, style.css, script.js
```

## Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows  (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env         # then put your GROQ_API_KEY inside
```

## Run the web app
```bash
uvicorn main:app --reload
```
Open http://127.0.0.1:8000

## Run in the terminal
```bash
python cli.py
```

## Tech
Python, CrewAI, FastAPI, Groq (llama-3.3-70b), HTML/CSS/JavaScript.
