// src/components/ui/GaugeChart.tsx
import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface GaugeChartProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
  railColor?: string;  // cor do trilho (fundo)
  fillColor?: string;  // cor do arco preenchido
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  size = 200,
  strokeWidth = 50,
  title = "Percent",
  railColor = "#66666634",
}) => {
  const data = [{ name: title, value }];

  // converte strokeWidth para % de raio interno
  const outerRadius = 120;
  const innerRadius = outerRadius - (strokeWidth / size) * 100;

  return (
    <div
      className="
        relative 
        flex items-center justify-center 
        rounded-full shadow-lg
        bg-white dark:bg-neutral-900/30
      "
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius={`${innerRadius}%`}
            outerRadius={`${outerRadius}%`}
            barSize={strokeWidth}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />

            {/* Trilho de fundo usando railColor */}
            <RadialBar
              dataKey={() => 100}
              cornerRadius={strokeWidth / 2}
              fill={railColor}
            />
            

            {/* Arco colorido usando fillColor (com degradê opcional) */}
            <defs>
              <linearGradient id="gradGauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1b0bf7f4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#c6c3f1eb" stopOpacity={1} />
              </linearGradient>
            </defs>
            <RadialBar
              dataKey="value"
              cornerRadius={strokeWidth / 10}
              fill="url(#gradGauge)"
            />
            

          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Texto central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs xl:text-sm text-gray-500 dark:text-gray-400 px-6 text-center">
          {title}
        </span>
        <span className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">
          {value}%
        </span>
      </div>
    </div>
  );
};

export default GaugeChart;
