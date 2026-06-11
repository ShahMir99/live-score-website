"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";

type DataPoint = {
  over: number;
  rate: number;
  wicket?: number;
};

export function RunRateChart({ data }: { data: DataPoint[] }) {
  if (!data?.length) return null;

  const chartData = Array.from({ length: 20 }, (_, i) => {
    const overData = data.find((r) => r.over === i + 1);

    return {
      over: i + 1,
      rate: overData?.rate ?? 0,
      wicket: overData?.wicket ?? 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 12,
          right: 8,
          left: -28,
          bottom: 0,
        }}
      >
        <CartesianGrid
          vertical
          horizontal={false}
          stroke="#e5e7eb"
          strokeDasharray="2 2"
        />

        <XAxis
          dataKey="over"
          type="number"
          domain={[1, 20]}
          ticks={[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]}
          tick={{ fontSize: 8 }}
          tickLine={false}
          axisLine={{ stroke: "#d1d5db" }}
        />

        <YAxis hide domain={[0, "dataMax + 2"]} />

        <Tooltip
          cursor={{
            stroke: "#9ca3af",
            strokeWidth: 1,
            strokeDasharray: "3 3",
          }}
          labelFormatter={(label) => `Over ${label}`}
          formatter={(value) => [
            Number(value).toFixed(2),
            "Run Rate",
          ]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 12,
          }}
        />

        <Area
          type="monotone"
          dataKey="rate"
          stroke="#ef4444"
          strokeWidth={2}
          fill="#ef4444"
          fillOpacity={0.12}
          isAnimationActive={false}
        />

        {chartData.map((d) =>
          d.wicket ? (
            <ReferenceDot
              key={d.over}
              x={d.over}
              y={d.rate}
              r={0}
              label={{
                value: "W",
                position: "top",
                fill: "#ef4444",
                fontSize: 9,
                fontWeight: 700,
              }}
            />
          ) : null
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}