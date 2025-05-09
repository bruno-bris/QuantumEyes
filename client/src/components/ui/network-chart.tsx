import React from "react";

export interface DataPoint {
  value: number;
  timestamp: number;
  anomaly?: boolean;
}

interface NetworkChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  strokeColor?: string;
  anomalyColor?: string;
  gridColor?: string;
}

export function NetworkChart({
  data,
  width = 400,
  height = 200,
  strokeColor = "hsl(var(--primary))",
  anomalyColor = "hsl(var(--destructive))",
  gridColor = "#eaeef4",
}: NetworkChartProps) {
  // Find min/max values for scaling
  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // Add 10% padding on top
  
  // Scale value to fit in the chart height
  const scaleY = (value: number) => {
    return height - ((value - minValue) / (maxValue - minValue)) * height;
  };
  
  // Scale timestamp to fit in chart width
  const scaleX = (timestamp: number, index: number) => {
    return (index / (data.length - 1)) * width;
  };
  
  // Create SVG path for the line
  const linePath = data.map((point, i) => {
    const x = scaleX(point.timestamp, i);
    const y = scaleY(point.value);
    return (i === 0 ? "M" : "L") + `${x},${y}`;
  }).join(" ");
  
  // Find anomaly points
  const anomalyPoints = data
    .filter(point => point.anomaly)
    .map((point, i) => {
      const index = data.indexOf(point);
      return {
        x: scaleX(point.timestamp, index),
        y: scaleY(point.value),
      };
    });
  
  // Create grid lines (4 horizontal lines)
  const gridLines = [0.2, 0.4, 0.6, 0.8].map(ratio => {
    const y = height * ratio;
    return { x1: 0, y1: y, x2: width, y2: y };
  });
  
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox={`0 0 ${width} ${height}`} 
      preserveAspectRatio="none"
      className="network-chart"
    >
      {/* Grid lines */}
      {gridLines.map((line, i) => (
        <line
          key={`grid-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={gridColor}
          strokeWidth="1"
        />
      ))}
      
      {/* Network traffic line */}
      <path
        d={linePath}
        className="chart-line"
        stroke={strokeColor}
      />
      
      {/* Anomaly points */}
      {anomalyPoints.map((point, i) => (
        <circle
          key={`anomaly-${i}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={anomalyColor}
          stroke="#ffffff"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
