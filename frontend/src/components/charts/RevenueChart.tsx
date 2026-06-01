import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/utils/format';
import Card from '@/components/ui/Card';

interface RevenueChartProps {
  data: { label: string; value: number }[];
  title?: string;
}

export default function RevenueChart({
  data,
  title = 'Pendapatan',
}: RevenueChartProps) {
  return (
    <Card className="h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Bar
              dataKey="value"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
