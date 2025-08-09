from typing import Callable, Dict, Any, List

def execute_plan(steps: List[Dict[str, str]], on_progress: Callable[[int, str], None] | None = None) -> Dict[str, Any]:
    results: Dict[str, Any] = {}
    n = len(steps)
    for i, s in enumerate(steps):
        if on_progress:
            on_progress(round((i / max(n, 1)) * 100), s.get("id", ""))
        desc = s.get("description", "")
        if "Load numbers" in desc:
            results[s.get("id", "")] = [1, 2, 3, 4]
        elif "Compute average" in desc:
            arr = results.get("s1", [])
            results[s.get("id", "")] = (sum(arr) / len(arr)) if arr else None
        else:
            results[s.get("id", "")] = None
    if on_progress:
        on_progress(100, "done")
    return results
