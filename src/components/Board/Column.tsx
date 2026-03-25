import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, ClipboardList } from 'lucide-react'
import type { Task, Status, TeamMember, NewTaskData, Priority } from '@/lib/types'
import { TaskCard } from './TaskCard'

interface Props {
  id: Status
  label: string
  color: string
  accent: string
  tasks: Task[]
  teamMembers: TeamMember[]
  onTaskClick: (task: Task) => void
  onAddTask: (data: NewTaskData) => void
}

export function Column({ id, label, color, accent, tasks, teamMembers, onTaskClick, onAddTask }: Props) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('normal')
  const [newDueDate, setNewDueDate] = useState('')
  const [newAssigneeId, setNewAssigneeId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef, isOver } = useDroppable({ id })

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const resetForm = () => {
    setNewTitle('')
    setNewDescription('')
    setNewPriority('normal')
    setNewDueDate('')
    setNewAssigneeId(null)
  }

  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (trimmed) {
      onAddTask({
        title: trimmed,
        description: newDescription.trim() || undefined,
        priority: newPriority,
        due_date: newDueDate || undefined,
        assignee_id: newAssigneeId,
      })
    }
    resetForm()
    setAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') {
      resetForm()
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
            <TaskCard key={task.id} task={task} teamMembers={teamMembers} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !adding && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <ClipboardList size={24} className="text-slate-300 mb-2" />
            <p className="text-xs text-slate-400">No tasks yet</p>
          </div>
        )}

        {/* Add task form */}
        {adding && (
          <div className="bg-white rounded-lg border border-blue-300 shadow-sm p-3 space-y-2.5">
            {/* Title */}
            <input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Task title..."
              className="w-full text-sm text-slate-800 placeholder-slate-400 outline-none border-b border-slate-100 pb-1.5"
            />

            {/* Description */}
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full resize-none text-xs text-slate-700 placeholder-slate-400 outline-none border border-slate-200 rounded px-2 py-1.5 focus:border-blue-400"
            />

            {/* Priority */}
            <div className="flex gap-1">
              {(['low', 'normal', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setNewPriority(p) }}
                  className={`flex-1 text-xs py-1 rounded border font-medium capitalize transition-all ${
                    newPriority === p
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Due date */}
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-700 outline-none focus:border-blue-400"
            />

            {/* Assignee */}
            {teamMembers.length > 0 && (
              <select
                value={newAssigneeId ?? ''}
                onChange={(e) => setNewAssigneeId(e.target.value || null)}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 text-slate-700 outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}

            {/* Actions */}
            <div className="flex gap-1.5 pt-0.5">
              <button
                onMouseDown={(e) => { e.preventDefault(); handleAdd() }}
                className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); resetForm(); setAdding(false) }}
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
