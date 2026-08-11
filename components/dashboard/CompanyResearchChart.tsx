"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

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
        <Bar dataKey="count" fill="#61A8FF" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
