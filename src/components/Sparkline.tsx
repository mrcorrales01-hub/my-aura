import React from 'react';

type SparklineProps = {
  data: { v: number }[];
  width?: number;
  height?: number;
  className?: string;
};

export function Sparkline({ data, width = 320, height = 64, className = '' }: SparklineProps) {
  if (!data.length) return null;
  
  const values = data.map(d => d.v);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');
  
  const pathData = `M ${points}`;
  const fillPath = `M 0,${height} L ${points} L ${width},${height} Z`;
  
  const lastPoint = values.length > 0 ? {
    x: width,
    y: height - ((values[values.length - 1] - min) / (max - min)) * height
  } : null;
  
  return (
    <div className={className}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <path 
          d={fillPath} 
          fill="url(#sparkline-gradient)"
        />
        <path 
          d={pathData} 
          fill="none" 
          stroke="hsl(var(--primary))" 
          strokeWidth="2"
        />
        
        {lastPoint && (
          <circle 
            cx={lastPoint.x} 
            cy={lastPoint.y} 
            r="3" 
            fill="hsl(var(--primary))"
          />
        )}
      </svg>
    </div>
  );
}