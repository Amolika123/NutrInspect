"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart as RechartsRadialBarChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";

interface HealthScoreChartProps {
  score: number;
}

export function HealthScoreChart({ score }: HealthScoreChartProps) {
  const chartData = [{ name: "score", value: score * 10, fill: "hsl(var(--accent))" }];
  
  const scoreColor = useMemo(() => {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  }, [score]);

  return (
    <ChartContainer
      config={{ score: { label: "Health Score", color: "hsl(var(--accent))" } }}
      className="mx-auto aspect-square w-full max-w-[250px]"
    >
      <RechartsRadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={-270}
        innerRadius="70%"
        outerRadius="100%"
        barSize={20}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          background={{ fill: "hsl(var(--muted))" }}
        />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel hideIndicator />}
        />
        <g>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className={`fill-foreground text-5xl font-bold font-headline ${scoreColor}`}
          >
            {score.toFixed(1)}
          </text>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            dy="30"
            className="fill-muted-foreground text-sm"
          >
            / 10
          </text>
        </g>
      </RechartsRadialBarChart>
    </ChartContainer>
  );
}
