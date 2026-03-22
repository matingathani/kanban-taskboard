import { Search, X, SlidersHorizontal } from 'lucide-react'
import type { Task } from '@/lib/types'
import { StatsBar } from './StatsBar'

interface Props {
  tasks: Task[]
  searchQuery: string
  priorityFilter: string
  onSearchChange: (q: string) => void
  onPriorityFilterChange: (p: string) => void
}

export function Header({ tasks, searchQuery, priorityFilter, onSearchChange, onPriorityFilterChange }: Props) {
  return (
    <header className="bg-[#0f172a] text-white px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">KB</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">TaskBoard</h1>
            <p className="text-xs text-white/40 mt-0.5">Next Play Games</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white/10 text-white text-sm placeholder-white/30 pl-8 pr-8 py-2 rounded-lg border border-white/10 outline-none focus:border-white/30 focus:bg-white/15 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="relative flex items-center gap-1.5">
            <SlidersHorizontal size={13} className="text-white/40 shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="bg-white/10 text-white text-xs py-2 pl-1 pr-6 rounded-lg border border-white/10 outline-none focus:border-white/30 transition appearance-none cursor-pointer"
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <StatsBar tasks={tasks} />
      </div>
    </header>
  )
}
