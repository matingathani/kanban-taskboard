import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, ClipboardList } from 'lucide-react'
import type { Task, Status } from '@/lib/types'
import { TaskCard } from './TaskCard'

interface Props {
  id: Status
  label: string
  color: string
  accent: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: (title: string) => void
}

export function Column({ id, label, color, accent, tasks, onTaskClick, onAddTask }: Props) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, isOver } = useDroppable({ id })

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (trimmed) {
      onAddTask(trimmed)
    }
    setNewTitle('')
    setAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') {
      setNewTitle('')
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col min-w-0 w-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full`}
            style={{ backgroundColor: accent }}
          />
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
          title="Add task"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 flex flex-col gap-2 rounded-xl p-2 min-h-[200px] transition-colors duration-150
          border-l-2 ${color}
          ${isOver ? 'bg-blue-50/60' : 'bg-slate-50/60'}
        `}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !adding && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <ClipboardList size={24} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-400">No tasks yet</p>
          </div>
        )}

        {/* Add task inline input */}
        {adding && (
          <div className="bg-white rounded-lg border border-blue-300 shadow-sm p-2.5">
            <input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAdd}
              placeholder="Task title..."
              className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            <div className="mt-2 flex gap-1.5">
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleAdd()
                }}
                className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault()
                  setNewTitle('')
                  setAdding(false)
                }}
                className="text-xs text-slate-500 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add task button at bottom */}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors w-full"
          >
            <Plus size={12} />
            Add task
          </button>
        )}
      </div>
    </div>
  )
}
