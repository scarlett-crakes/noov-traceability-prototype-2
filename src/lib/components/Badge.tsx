import { cn } from '@/lib/utils'

type BadgeProps = {
  variant?: 'active' | 'transit' | 'quarantine' | 'consumed' | 'expired' | 'default'
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  transit: 'bg-blue-100 text-blue-800',
  quarantine: 'bg-red-100 text-red-800',
  consumed: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-700',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variantClasses[variant], className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    active: { label: 'Active', variant: 'active' },
    in_transit: { label: 'In Transit', variant: 'transit' },
    quarantine: { label: 'Quarantine', variant: 'quarantine' },
    consumed: { label: 'Consumed', variant: 'consumed' },
  }
  const entry = map[status] ?? { label: status, variant: 'default' }
  return <Badge variant={entry.variant}>{entry.label}</Badge>
}
