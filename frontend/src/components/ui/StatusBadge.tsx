import Badge from './Badge';

interface StatusBadgeProps {
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'CANCELLED';
}

const statusConfig = {
  COMPLETED: { variant: 'success' as const, label: 'Selesai' },
  PENDING: { variant: 'warning' as const, label: 'Tertunda' },
  REFUNDED: { variant: 'danger' as const, label: 'Refund' },
  CANCELLED: { variant: 'default' as const, label: 'Dibatalkan' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
