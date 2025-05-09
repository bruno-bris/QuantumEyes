import React from "react";

interface DataPoint {
  label: string;
  value: number;
  max?: number;
}

interface RadarChartProps {
  data: DataPoint[];
  size?: number;
  strokeColor?: string;
  fillColor?: string;
  backgroundColor?: string;
}

export function RadarChart({
  data,
  size = 300,
  strokeColor = "#6236ff",
  fillColor = "#6236ff",
  backgroundColor = "#eaeef4",
}: RadarChartProps) {
  // Center point of the chart
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Radius is adjusted to leave some margin
  const radius = (size / 2) * 0.8;
  
  // Convert to radians and calculate positions
  const angle = (Math.PI * 2) / data.length;
  
  // Generate coordinates for each data point
  const points = data.map((point, i) => {
    // Normalize the value (0-1)
    const normalizedValue = point.value / (point.max || 100);
    
    // Calculate position
    const x = centerX + radius * normalizedValue * Math.sin(angle * i);
    const y = centerY - radius * normalizedValue * Math.cos(angle * i);
    
    return { x, y, label: point.label, value: point.value };
  });
  
  // Create polygon points string for the data shape
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(" ");
  
  // Calculate axis lines and circles for the background
  const backgroundCircles = [0.25, 0.5, 0.75, 1].map(ratio => ({
    radius: radius * ratio,
  }));
  
  const axisLines = data.map((_, i) => {
    const x = centerX + radius * Math.sin(angle * i);
    const y = centerY - radius * Math.cos(angle * i);
    return { x1: centerX, y1: centerY, x2: x, y2: y };
  });
  
  // Calculate label positions (slightly outside the radar)
  const labelPositions = data.map((point, i) => {
    const labelPadding = 15; // Distance beyond the radar edge
    const x = centerX + (radius + labelPadding) * Math.sin(angle * i);
    const y = centerY - (radius + labelPadding) * Math.cos(angle * i);
    
    // Adjust text-anchor based on position
    let textAnchor = "middle";
    if (x < centerX - 10) textAnchor = "end";
    if (x > centerX + 10) textAnchor = "start";
    
    return { x, y, label: point.label, textAnchor };
  });
  
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      className="radar-chart"
    >
      {/* Background circles */}
      {backgroundCircles.map((circle, i) => (
        <circle
          key={`circle-${i}`}
          cx={centerX}
          cy={centerY}
          r={circle.radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth="1"
        />
      ))}
      
      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={`axis-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#d5dde9"
          strokeWidth="1"
        />
      ))}
      
      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill={fillColor}
        fillOpacity="0.2"
        stroke={strokeColor}
        strokeWidth="2"
        className="radar-section"
      />
      
      {/* Data points */}
      {points.map((point, i) => (
        <circle
          key={`point-${i}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={strokeColor}
        />
      ))}
      
      {/* Labels */}
      {labelPositions.map((item, i) => (
        <text
          key={`label-${i}`}
          x={item.x}
          y={item.y}
          textAnchor={item.textAnchor}
          fontSize="12"
          fill="#334155"
        >
          {item.label}
        </text>
      ))}
    </svg>
  );
}
