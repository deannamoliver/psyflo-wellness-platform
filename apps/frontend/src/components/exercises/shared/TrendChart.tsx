"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface ThresholdLine {
  value: number;
  label: string;
  color: string;
  strokeDasharray?: string;
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  label: string;
  color?: string;
  thresholdLines?: ThresholdLine[];
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
}

export function TrendChart({
  data,
  label,
  color = "#3b82f6",
  thresholdLines = [],
  height = 200,
  showGrid = true,
  showDots = true,
}: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50"
        style={{ height }}
      >
        <p className="text-sm text-gray-400">No data to display</p>
      </div>
    );
  }

  const minValue = Math.min(...data.map((d) => d.value), ...thresholdLines.map((t) => t.value));
  const maxValue = Math.max(...data.map((d) => d.value), ...thresholdLines.map((t) => t.value));
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={{ stroke: "#d1d5db" }}
            axisLine={{ stroke: "#d1d5db" }}
          />
          <YAxis
            domain={[Math.floor(minValue - padding), Math.ceil(maxValue + padding)]}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={{ stroke: "#d1d5db" }}
            axisLine={{ stroke: "#d1d5db" }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          {thresholdLines.map((threshold) => (
            <ReferenceLine
              key={threshold.label}
              y={threshold.value}
              stroke={threshold.color}
              strokeDasharray={threshold.strokeDasharray ?? "5 5"}
              label={{
                value: threshold.label,
                position: "right",
                fontSize: 10,
                fill: threshold.color,
              }}
            />
          ))}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={showDots ? { fill: color, strokeWidth: 2, r: 4 } : false}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: "white" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
