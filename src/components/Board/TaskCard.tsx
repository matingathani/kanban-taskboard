import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, AlertCircle, GripVertical } from 'lucide-react'
import type { Task } from '@/lib/types'
import { getDueDateStatus, formatDueDate } from '@/lib/utils'

interface Props {
  task: Task
  onClick: () => void
}

const priorityConfig = {
  high: { label: 'High', classes: 'bg-red-100 text-red-700' },
  normal: { label: 'Normal', classes: 'bg-blue-100 text-blue-700' },
  low: { label: 'Low', classes: 'bg-slate-100 text-slate-600' },
}

const dueDateConfig = {
  overdue: 'bg-red-100 text-red-700',
  soon: 'bg-amber-100 text-amber-700',
  normal: 'bg-slate-100 text-slate-600',
}

export function TaskCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dueDateStatus = getDueDateStatus(task.due_date)
  const priority = priorityConfig[task.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-white rounded-lg border border-slate-200 p-3.5 cursor-pointer
        hover:border-slate-300 hover:shadow-md transition-all duration-150 select-none
        ${isDragging ? 'opacity-40 shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
            {task.title}
          </p>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-1">{task.description}</p>
          )}

          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            {task.priority !== 'normal' && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priority.classes}`}>
                {priority.label}
              </span>
            )}

            {dueDateStatus && task.due_date && (
              <span
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${dueDateConfig[dueDateStatus]}`}
              >
                {dueDateStatus === 'overdue' && <AlertCircle size={10} />}
                {dueDateStatus !== 'overdue' && <Calendar size={10} />}
                {formatDueDate(task.due_date)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Overlay clone during drag
export function TaskCardOverlay({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority]
  const dueDateStatus = getDueDateStatus(task.due_date)

  return (
    <div className="drag-overlay bg-white rounded-lg border border-slate-300 p-3.5 w-full">
      <p className="text-sm font-medium text-slate-800 leading-snug">{task.title}</p>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        {task.priority !== 'normal' && (
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${priority.classes}`}>
            {priority.label}
          </span>
        )}
        {dueDateStatus && task.due_date && (
          <span
            className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium ${dueDateConfig[dueDateStatus]}`}
          >
            <Calendar size={10} />
            {formatDueDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  )
}
