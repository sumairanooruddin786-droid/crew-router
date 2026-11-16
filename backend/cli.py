"""Terminal version (the original assignment behaviour)."""
from agents import run_query

query = input("Enter your query: ")
result = run_query(query)
print(f"\n[{result['category']}] handled by {result['agent']}\n")
print(result["answer"])
