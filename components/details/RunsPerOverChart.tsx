"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, Cell } from "recharts";

type DataPoint = { over: number; runs: number; wicket: number };

export function RunsPerOverChart({ data }: { data: DataPoint[] }) {
  
  
  const chartData = Array.from({ length: 20 }, (_, i) => {
    const o = data.find((r) => r.over === i + 1);
    return { over: i + 1, runs: o?.runs ?? 0, wicket: o?.wicket ?? 0 };
  });


  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 14, right: 8, left: -28, bottom: 0 }} barCategoryGap={2}>
        <XAxis
          dataKey="over"
          tick={{ fontSize: 8, fill: "currentColor" }}
          tickLine={false}
          axisLine={{ stroke: "currentColor", strokeOpacity: 0.2 }}
          interval={0}
        />
        <YAxis hide />
        <Bar dataKey="runs" radius={[2, 2, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.runs > 0 ? "oklch(0.62 0.22 27)" : "transparent"} />
          ))}
          <LabelList
            dataKey="wicket"
            position="top"
            content={(props: any) => {
              const w = Number(props.value ?? 0);
              if (!w) return null;
              const cx = Number(props.x ?? 0) + Number(props.width ?? 0) / 2;
              const cy = Number(props.y ?? 0) - 2;
              return (
                <g>
                  {Array.from({ length: w }).map((_, k) => (
                    <text key={k} x={cx} y={cy - k * 8} textAnchor="middle" fontSize="8" fontWeight="700" fill="oklch(0.62 0.22 27)">W</text>
                  ))}
                </g>
              );
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}