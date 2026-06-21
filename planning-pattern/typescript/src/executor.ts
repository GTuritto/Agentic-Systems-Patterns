export type ExecutionFailure = {
  status: "failed";
  error_type: "unsupported_step" | "missing_numbers";
  step_id: string;
  description: string;
};

export type ExecutionValue = number[] | number | ExecutionFailure;
export type ExecutionResults = Record<string, ExecutionValue>;

export async function executePlan(steps: { id: string; description: string }[], onProgress?: (pct: number, stage: string) => void): Promise<ExecutionResults> {
  const results: ExecutionResults = {};
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    onProgress?.(Math.round((i / steps.length) * 100), s.id);
    // trivial synthetic execution
    if (s.description.includes('Load numbers')) {
      const raw = s.description.match(/\[([^\]]+)\]/)?.[1] ?? '';
      results[s.id] = raw
        .split(',')
        .map(value => Number(value.trim()))
        .filter(Number.isFinite);
    }
    else if (s.description.includes('Compute average')) {
      const arr = Array.isArray(results['s1']) ? results['s1'] : [];
      results[s.id] = arr.length > 0
        ? arr.reduce((a:number,b:number)=>a+b,0)/arr.length
        : {
          status: "failed",
          error_type: "missing_numbers",
          step_id: s.id,
          description: s.description
        };
    } else results[s.id] = {
      status: "failed",
      error_type: "unsupported_step",
      step_id: s.id,
      description: s.description
    };
  }
  onProgress?.(100, 'done');
  return results;
}
