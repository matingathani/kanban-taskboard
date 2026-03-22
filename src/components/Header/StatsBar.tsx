import { CheckCircle2, AlertTriangle, LayoutGrid } from 'lucide-react'
import type { Task } from '@/lib/types'
import { getDueDateStatus } from '@/lib/utils'

interface Props {
  tasks: Task[]
}

export function StatsBar({ tasks }: Props) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter((t) => getDueDateStatus(t.due_date) === 'overdue').length

  const stats = [
    { label: 'Total', value: total, icon: LayoutGrid, color: 'text-slate-300' },
    { label: 'Completed', value: done, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-red-400' },
  ]

  return (
    <div className="flex items-center gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-1.5">
          <stat.icon size={13} className={stat.color} />
          <span className="text-sm font-semibold text-white/90">{stat.value}</span>
          <span className="text-xs text-white/40 hidden sm:block">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
