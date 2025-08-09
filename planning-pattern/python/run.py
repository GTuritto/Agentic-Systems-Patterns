import os
from planner import plan_task
from executor import execute_plan

def main():
    goal = " ".join(os.sys.argv[1:]) or "Compute average of [1,2,3,4]"
    plan = plan_task(goal, os.getenv("MISTRAL_API_KEY"))
    print("Plan:", plan)
    results = execute_plan(plan.get("steps", []), lambda pct, stage: print("Progress", pct, stage))
    print("Results:", results)

if __name__ == "__main__":
    main()
