"""CrewAI agents: Router -> (Math Expert | Teacher)."""
import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM

load_dotenv()

llm = LLM(
    model=os.getenv("LLM_MODEL", "groq/llama-3.3-70b-versatile"),
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2,
)

# Agent 1: Router
router = Agent(
    role="Query Router",
    goal="Classify queries as MATH or EXPLAIN",
    backstory="You route queries to the correct agent.",
    llm=llm,
    allow_delegation=False,
    verbose=False,
)

# Agent 2: Math
math_agent = Agent(
    role="Math Expert",
    goal="Solve mathematical problems accurately",
    backstory="You are a math expert.",
    llm=llm,
    allow_delegation=False,
    verbose=False,
)

# Agent 3: Explanation
explain_agent = Agent(
    role="Teacher",
    goal="Explain concepts simply",
    backstory="You are a helpful teacher.",
    llm=llm,
    allow_delegation=False,
    verbose=False,
)


def classify(query: str) -> str:
    task = Task(
        description=(
            "Classify the user query. Reply with exactly one word: MATH if it "
            "asks to calculate, solve or compute something numeric/algebraic; "
            f"EXPLAIN for everything else.\n\nQuery: {query}"
        ),
        expected_output="One word: MATH or EXPLAIN",
        agent=router,
    )
    out = str(Crew(agents=[router], tasks=[task], verbose=False).kickoff()).upper()
    return "MATH" if "MATH" in out else "EXPLAIN"


def run_query(query: str) -> dict:
    category = classify(query)

    if category == "MATH":
        agent = math_agent
        description = (
            "Solve this problem step by step and state the final answer clearly. "
            "Write math in plain text only, like 3x + 7 = 22 and x = 5. "
            "Do NOT use LaTeX or symbols such as \\[ \\] \\( \\) \\frac \\boxed.\n\n"
            f"{query}"
        )
    else:
        agent = explain_agent
        description = (
            "Explain this in simple words, with one short everyday example. "
            "Use plain text only, no LaTeX.\n\n"
            f"{query}"
        )

    task = Task(
        description=description,
        expected_output="A clear, well-structured answer.",
        agent=agent,
    )
    answer = Crew(agents=[agent], tasks=[task], verbose=False).kickoff()
    return {"category": category, "agent": agent.role, "answer": str(answer)}