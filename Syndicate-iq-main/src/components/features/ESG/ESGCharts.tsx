import { Card } from '../../ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ESGReport } from '../../../types';

interface ESGChartsProps {
  report: ESGReport;
}

const COLORS = ['#10B981', '#3B82F6', '#D4AF37'];

export function ESGCharts({ report }: ESGChartsProps) {
  // Prepare quarterly trend data
  const quarterlyData = report.quarterlyTrends.map((trend) => ({
    quarter: trend.quarter.split('-')[1], // Q1, Q2, etc.
    Environmental: trend.environmental,
    Social: trend.social,
    Governance: trend.governance,
  }));

  // Prepare pie chart data
  const pieData = [
    { name: 'Environmental', value: report.environmentalScore },
    { name: 'Social', value: report.socialScore },
    { name: 'Governance', value: report.governanceScore },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg font-semibold text-white mb-6">Quarterly ESG Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="quarter" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
            />
            <Legend wrapperStyle={{ color: '#9CA3AF' }} />
            <Line
              type="monotone"
              dataKey="Environmental"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Social"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Governance"
              stroke="#D4AF37"
              strokeWidth={2}
              dot={{ fill: '#D4AF37', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-6">ESG Score Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
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
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-6">Category Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pieData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
