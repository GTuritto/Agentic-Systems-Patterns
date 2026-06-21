#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
venv_dir="${TMPDIR:-/tmp}/agentic-systems-langgraph-smoke"

rm -rf "$venv_dir"
python3 -m venv "$venv_dir"

"$venv_dir/bin/pip" --disable-pip-version-check install -r "$repo_root/native-framework-examples/langgraph-refund/requirements.txt" >/dev/null

"$venv_dir/bin/python" "$repo_root/native-framework-examples/langgraph-refund/refund_graph.py" >/dev/null
"$venv_dir/bin/python" "$repo_root/native-framework-examples/langgraph-research-rag/research_rag_graph.py" >/dev/null

rm -rf "$venv_dir"
echo "Native LangGraph examples smoke checks OK"
