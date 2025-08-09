import os
import json
import subprocess
import tempfile
import sys

# Minimal loop: read preplanned code from env or arg to avoid requiring an API key for tests

def run_snippet_py(code: str):
    with tempfile.TemporaryDirectory() as td:
        path = os.path.join(td, "snippet.py")
        with open(path, "w") as f:
            f.write(code)
        try:
            cp = subprocess.run([sys.executable, path], capture_output=True, text=True, timeout=2)
        except subprocess.TimeoutExpired:
            return {"output": None, "error": "timeout"}
        return {"output": cp.stdout.strip(), "stderr": cp.stderr.strip()}


def main():
    task = "Compute average of numbers [1,2,3,4]. print only the numeric result."
    plan_code = os.environ.get("PLAN_CODE") or (len(sys.argv) > 1 and sys.argv[1] or None)
    if not plan_code:
        # safe default code
        plan_code = "arr=[1,2,3,4]; import statistics; print(statistics.mean(arr))"
    out = run_snippet_py(plan_code)
    print(json.dumps(out))

if __name__ == "__main__":
    main()
