"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type DayCount = {
  day: string;
  count: number;
};

type Props = {
  data: DayCount[];
};

export function CompanyResearchChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
          domain={[0, 12]}
          ticks={[0, 3, 6, 9, 12]}
        />
        <Tooltip
          cursor={{ fill: "var(--color-surface-secondary)" }}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            boxShadow: "0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)",
          }}
          labelStyle={{ color: "var(--color-text-secondary)", fontSize: 12, fontWeight: 500 }}
          itemStyle={{ color: "var(--color-text-primary)", fontSize: 14, fontWeight: 500 }}
          formatter={(value) => [value, "Researched"]}
        />
        <Bar dataKey="count" fill="#61A8FF" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
