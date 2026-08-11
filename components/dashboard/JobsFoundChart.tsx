"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DayCount = {
  day: string;
  count: number;
};

type Props = {
  data: DayCount[];
};

export function JobsFoundChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="jobsFoundGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C5CFC" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#7C5CFC" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#E7EAF3" vertical={false} />
        <XAxis
          dataKey="day"
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
        <Tooltip
          cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            boxShadow: "0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)",
          }}
          labelStyle={{ color: "var(--color-text-secondary)", fontSize: 12, fontWeight: 500 }}
          itemStyle={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 500 }}
          formatter={(value) => [value, "Jobs found"]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#7C5CFC"
          strokeWidth={3}
          fill="url(#jobsFoundGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
