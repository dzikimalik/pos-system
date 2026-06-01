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

interface BestSellingChartProps {
  data: { name: string; total: number }[];
}

export default function BestSellingChart({ data }: BestSellingChartProps) {
  return (
    <Card className="h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Produk Terlaris
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={120}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Total']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Bar
              dataKey="total"
              fill="#22c55e"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
