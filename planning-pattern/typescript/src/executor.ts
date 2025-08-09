export async function executePlan(steps: { id: string; description: string }[], onProgress?: (pct: number, stage: string) => void) {
  const results: Record<string, any> = {};
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    onProgress?.(Math.round((i / steps.length) * 100), s.id);
    // trivial synthetic execution
    if (s.description.includes('Load numbers')) results[s.id] = [1,2,3,4];
    else if (s.description.includes('Compute average')) {
      const arr = results['s1'] || [];
      results[s.id] = arr.reduce((a:number,b:number)=>a+b,0)/arr.length;
    } else results[s.id] = null;
  }
  onProgress?.(100, 'done');
  return results;
}
