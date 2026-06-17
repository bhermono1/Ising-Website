"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function DailyRevenueChart({ data }: { data: { date: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d91b8c" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#d91b8c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2640" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => v.slice(5)}
          stroke="#9b96b3"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#9b96b3" fontSize={11} tickLine={false} axisLine={false} width={50} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="amount" stroke="#d91b8c" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MonthlyRevenueChart({ data }: { data: { month: string; amount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2640" vertical={false} />
        <XAxis dataKey="month" stroke="#9b96b3" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#9b96b3" fontSize={11} tickLine={false} axisLine={false} width={50} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="amount" fill="#5443a7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
