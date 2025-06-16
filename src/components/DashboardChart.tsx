
import { Card, CardContent } from '@/components/ui/card';
import React, { useRef, useEffect, memo, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, RadialBar, PolarAngleAxis, RadarChart, PolarGrid, PolarAngleAxis as RadarAngleAxis, Radar } from 'recharts';
import { gsap } from 'gsap';
import { Progress } from '@/components/ui/progress';
import GaugeChart from '@/components/ui/GaugeChart';

// Define a consistent color palette for all charts
const CHART_COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', '#6366F1', '#EC4899', '#F59E0B'];
interface DashboardChartProps {
  type: string;
  data: any[];
  title: string;
  description: string;
}
const DashboardChart: React.FC<DashboardChartProps> = memo(({
  type,
  data,
  title,
  description
}) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(chartRef.current, {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });
    return () => ctx.revert();
  }, []);

  // Memoize expensive calculations with null safety
  const total = useMemo(() => data.reduce((sum, item) => sum + (item?.value || 0), 0), [data]);
  const renderProgressBars = useMemo(() => {
    if (!data || data.length === 0) {
      return <div className="space-y-3 sm:space-y-6 py-2 sm:py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum dado disponível</p>
        </div>;
    }
    return <div className="space-y-3 sm:space-y-6 py-2 sm:py-4">
        {data.map((item, index) => {
        // Add null safety checks
        const itemValue = item?.value || 0;
        const itemName = item?.name || `Item ${index + 1}`;
        const percentage = total > 0 ? Math.round(itemValue / total * 100) : 0;
        return <div key={`${itemName}-${index}`} className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2" style={{
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
              }} />
                  <span className="text-xs sm:text-sm font-medium">{itemName}</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xs sm:text-sm font-bold">R$ {itemValue.toFixed(2)}</span>
                  <span className="text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-medium">
                    {percentage}%
                  </span>
                </div>
              </div>
              <Progress value={percentage} className="h-1.5 sm:h-2.5" style={{
            background: 'linear-gradient(to right, rgba(228, 218, 253, 0.2), rgba(64, 45, 117, 0.3))'
          }} />
            </div>;
      })}
      </div>;
  }, [data, total]);
  const renderChart = useMemo(() => {
    // Add data validation
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Nenhum dado disponível para exibir</p>
        </div>;
    }
    const commonTooltipStyle = {
      backgroundColor: 'rgb(31 41 55)',
      borderColor: 'rgb(55 65 81)',
      borderRadius: '0.5rem',
      color: 'rgb(243 244 246)',
      fontSize: '12px',
      padding: '8px'
    };
    switch (type) {
      case 'bar':
        return <ResponsiveContainer width="100%" height={400} minHeight={100}>
            <BarChart data={data} margin={{
            top: 10,
            right: 30,
            left: -25,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="name" tick={{
              fill: 'currentColor',
              fontSize: '14px'
            }} stroke="currentColor" strokeOpacity={0.3} />
              <YAxis tick={{
              fill: 'currentColor',
              fontSize: '14px'
            }} stroke="currentColor" strokeOpacity={0.3} />
              <Tooltip contentStyle={commonTooltipStyle} itemStyle={{
              color: 'rgb(243 244 246)'
            }} />
              <Legend wrapperStyle={{
              fontSize: '14px'
            }} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
              {data[0]?.value2 && <Bar dataKey="value2" fill="#1D2472" />}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6842c2" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>;
      case 'line':
        return <ResponsiveContainer width="100%" height={300} minHeight={200} minWidth={300}>
            <LineChart data={data} margin={{
            top: 10,
            right: 0,
            left: -30,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="name" tick={{
              fill: 'currentColor',
              fontSize: '14px'
            }} stroke="currentColor" strokeOpacity={0.3} />
              <YAxis tick={{
              fill: 'currentColor',
              fontSize: '14px'
            }} stroke="currentColor" strokeOpacity={0.3} />
              <Tooltip contentStyle={commonTooltipStyle} itemStyle={{
              color: 'rgb(243 244 246)'
            }} />
              <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3} dot={{
              fill: '#1a0bf7ab',
              r: 4
            }} activeDot={{
              r: 6
            }} />
              {data[0]?.value2 && <Line type="monotone" dataKey="value2" stroke="#0EA5E9" strokeWidth={2} dot={{
              fill: '#1a0bf7ab',
              r: 4
            }} />}
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1a0bf7ab" />
                  <stop offset="100%" stopColor="#1a0bf7ab" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>;
      case 'area':
        return <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <AreaChart data={data} margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <XAxis dataKey="name" tick={{
              fill: 'currentColor',
              fontSize: '12px'
            }} stroke="currentColor" strokeOpacity={0.3} />
              <YAxis tick={{
              fill: 'currentColor',
              fontSize: '12px'
            }} stroke="currentColor" strokeOpacity={0.3} />
              <Tooltip contentStyle={commonTooltipStyle} itemStyle={{
              color: 'rgb(243 244 246)'
            }} />
              <Legend wrapperStyle={{
              fontSize: '12px'
            }} />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a0bf7ab" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#1a0bf7ab" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#ffffff" fillOpacity={1} fill="url(#areaGradient)" strokeWidth={2} strokeOpacity={0.4} />
              {data[0]?.value2 && <Area type="monotone" dataKey="value2" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.3} />}
            </AreaChart>
          </ResponsiveContainer>;
      case 'radar':
        return <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <RadarChart data={data} margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 20
          }}>
              <PolarGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
              <RadarAngleAxis dataKey="name" tick={{
              fill: 'currentColor',
              fontSize: '12px'
            }} stroke="currentColor" strokeOpacity={0.3} />
              <YAxis tick={false} axisLine={false} tickLine={false} domain={[0, 'dataMax']} />
              <Tooltip contentStyle={commonTooltipStyle} itemStyle={{
              color: 'rgb(243 244 246)'
            }} />
              <Radar name={title} dataKey="value" stroke="url(#radarGradient)" fill="url(#radarGradient)" fillOpacity={0.6} />
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#D946EF" />
                </linearGradient>
              </defs>
              <Legend wrapperStyle={{
              fontSize: '12px',
              paddingTop: '8px'
            }} />
            </RadarChart>
          </ResponsiveContainer>;
      case 'pie':
        return <ResponsiveContainer width="100%" height={300} minHeight={200}>
            <PieChart margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 20
          }}>
              <Pie data={data} cx="50%" cy="80%" innerRadius={40} outerRadius={80} paddingAngle={8} startAngle={180} endAngle={0} labelLine={false} label={({
              name,
              percent
            }) => `${name}: ${(percent * 100).toFixed(0)}%`} strokeOpacity={0.1} stroke="transparent" strokeWidth={2} dataKey="value">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={commonTooltipStyle} itemStyle={{
              color: 'rgb(243 244 246)'
            }} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{
              fontSize: '12px',
              paddingTop: '12px'
            }} />
            </PieChart>
          </ResponsiveContainer>;
      case 'progress':
        return renderProgressBars;
      case 'gauge':
        return <GaugeChart value={data[0]?.value || 0} size={200} title={title} />;
      default:
        return <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Tipo de gráfico não suportado: {type}</p>
          </div>;
    }
  }, [type, data, title, renderProgressBars]);
  
  return (
    <Card className="bg-white dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg">
      <CardContent className="p-6" ref={chartRef}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
        {renderChart}
      </CardContent>
    </Card>
  );
});

DashboardChart.displayName = 'DashboardChart';
export default DashboardChart;
