import { useState, useEffect, useRef } from 'react'
import { X, Trash2, Calendar, Flag, Users } from 'lucide-react'
import type { Task, Priority, Status, TeamMember } from '@/lib/types'
import { COLUMNS } from '@/lib/types'
import { CommentList } from './CommentList'

interface Props {
  task: Task | null
  userId: string
  teamMembers: TeamMember[]
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Task>) => void
  onDelete: (id: string) => void
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-slate-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
]

export function TaskDetail({ task, userId, teamMembers, onClose, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
    }
  }, [task?.id])

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus()
  }, [editingTitle])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!task) return null

  const saveTitle = () => {
    setEditingTitle(false)
    const trimmed = title.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed })
    } else {
      setTitle(task.title)
    }
  }

  const saveDescription = () => {
    if (description !== (task.description ?? '')) {
      onUpdate(task.id, { description: description || null })
    }
  }

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      onDelete(task.id)
      onClose()
    }
  }

  const column = COLUMNS.find((c) => c.id === task.status)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: column?.accent }}
            />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {column?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Title */}
          <div>
            {editingTitle ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle()
                  if (e.key === 'Escape') {
                    setTitle(task.title)
                    setEditingTitle(false)
                  }
                }}
                className="w-full text-lg font-semibold text-slate-900 outline-none border-b-2 border-blue-400 pb-0.5"
              />
            ) : (
              <h2
                className="text-lg font-semibold text-slate-900 cursor-text hover:text-blue-700 transition-colors"
                onClick={() => setEditingTitle(true)}
                title="Click to edit"
              >
                {task.title}
              </h2>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              placeholder="Add a description..."
              rows={3}
              className="w-full resize-none text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Status
            </label>
            <select
              value={task.status}
              onChange={(e) => onUpdate(task.id, { status: e.target.value as Status })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition bg-white"
            >
              {COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              <Flag size={11} className="inline mr-1" />
              Priority
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => onUpdate(task.id, { priority: p.value })}
                  className={`flex-1 text-xs py-1.5 rounded-lg border font-medium transition-all ${
                    task.priority === p.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              <Calendar size={11} className="inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={task.due_date ?? ''}
              onChange={(e) => onUpdate(task.id, { due_date: e.target.value || null })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              <Users size={11} className="inline mr-1" />
              Assignee
            </label>
            <select
              value={task.assignee_id ?? ''}
              onChange={(e) => onUpdate(task.id, { assignee_id: e.target.value || null })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition bg-white"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Comments */}
          <CommentList taskId={task.id} userId={userId} />
        </div>
      </div>
    </>
  )
}
