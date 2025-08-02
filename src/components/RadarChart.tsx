import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface RadarChartData {
  metric: string;
  value: number;
  maxValue: number;
}

interface SystemRadarChartProps {
  llmStats: {
    totalTechniques: number;
    totalKnowledgeNodes: number;
    successRate: number;
    avgTechniqueEffectiveness: number;
  };
  infectionStats: {
    infected: number;
    totalTargets: number;
    spreadingRate: number;
    avgInfectionDepth: number;
  };
  agentStatus: {
    autonomyLevel: number;
    capabilities: number;
    averageSuccessRate: number;
    decisionsMade: number;
  };
  networkStats: {
    activeNodes: number;
    totalNodes: number;
    transmissionRate: number;
  };
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
};

export const SystemRadarChart: React.FC<SystemRadarChartProps> = ({
  llmStats,
  infectionStats,
  agentStatus,
  networkStats
}) => {
  // Normalize all metrics to 0-100 scale for radar chart
  const data: RadarChartData[] = [
    {
      metric: 'AI Techniques',
      value: Math.min(100, (llmStats.totalTechniques / 50) * 100),
      maxValue: 100
    },
    {
      metric: 'Knowledge Base',
      value: Math.min(100, (llmStats.totalKnowledgeNodes / 100) * 100),
      maxValue: 100
    },
    {
      metric: 'AI Success Rate',
      value: llmStats.successRate * 100,
      maxValue: 100
    },
    {
      metric: 'Infection Rate',
      value: infectionStats.spreadingRate * 100,
      maxValue: 100
    },
    {
      metric: 'Network Coverage',
      value: infectionStats.totalTargets > 0 ? (infectionStats.infected / infectionStats.totalTargets) * 100 : 0,
      maxValue: 100
    },
    {
      metric: 'Agent Autonomy',
      value: agentStatus.autonomyLevel * 100,
      maxValue: 100
    },
    {
      metric: 'Capabilities',
      value: Math.min(100, (agentStatus.capabilities / 20) * 100),
      maxValue: 100
    },
    {
      metric: 'Agent Success',
      value: agentStatus.averageSuccessRate * 100,
      maxValue: 100
    },
    {
      metric: 'Node Activity',
      value: networkStats.totalNodes > 0 ? (networkStats.activeNodes / networkStats.totalNodes) * 100 : 0,
      maxValue: 100
    },
    {
      metric: 'Transmission',
      value: Math.min(100, networkStats.transmissionRate * 100),
      maxValue: 100
    }
  ];

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[400px]">
      <RadarChart data={data}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <PolarGrid gridType="polygon" />
        <PolarAngleAxis dataKey="metric" className="text-xs" />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={false}
          tickFormatter={(value) => `${value}%`}
        />
        <Radar
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
};