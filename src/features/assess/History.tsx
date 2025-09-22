import { fetchHistory } from './io';
import { useEffect, useState } from 'react';

export function Spark({ type }: { type: 'phq9' | 'gad7' }) {
  const [rows, setRows] = useState<any[]>([]);
  
  useEffect(() => {
    (async () => setRows(await fetchHistory(type)))();
  }, [type]);
  
  if (!rows.length) return null;
  
  const max = Math.max(...rows.map(r => r.total_score));
  
  return (
    <div className="h-8 flex items-end gap-1">
      {rows.slice(0, 20).reverse().map((r, i) => {
        const h = max ? Math.max(2, Math.round(24 * (r.total_score / max))) : 2;
        return (
          <div 
            key={i} 
            style={{ height: h }} 
            className="w-1.5 bg-foreground/70 rounded"
          />
        );
      })}
    </div>
  );
}