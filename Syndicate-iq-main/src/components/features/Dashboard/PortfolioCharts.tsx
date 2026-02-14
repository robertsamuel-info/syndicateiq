import { Card } from '../../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { PortfolioMetrics } from '../../../types';

interface PortfolioChartsProps {
  metrics: PortfolioMetrics;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export function PortfolioCharts({ metrics }: PortfolioChartsProps) {
  const riskDistributionData = [
    { name: 'Low Risk', value: metrics.riskDistribution.low },
    { name: 'Medium Risk', value: metrics.riskDistribution.medium },
    { name: 'High Risk', value: metrics.riskDistribution.high },
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-6">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={riskDistributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {riskDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
