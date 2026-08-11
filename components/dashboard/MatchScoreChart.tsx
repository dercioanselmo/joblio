"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

type RangeCount = {
  range: string;
  count: number;
};

type Props = {
  data: RangeCount[];
};

export function MatchScoreChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#E7EAF3" vertical={false} />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={{ stroke: "#E7EAF3" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}
