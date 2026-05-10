import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: string
  iconColor: string
}

export default function StatsCard({ label, value, change, trend, icon: Icon, color, iconColor }: StatsCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-primary' : 'text-error'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <p className="text-sm text-on-surface-variant mb-1">{label}</p>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
    </div>
  )
}
