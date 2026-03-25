import { useState } from 'react'
import { X, Trash2, UserPlus } from 'lucide-react'
import type { TeamMember } from '@/lib/types'

interface Props {
  teamMembers: TeamMember[]
  onAdd: (name: string, email?: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function TeamModal({ teamMembers, onAdd, onDelete, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, email.trim() || undefined)
    setName('')
    setEmail('')
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Manage Team</h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Add form */}
          <div className="px-5 py-4 space-y-2 border-b border-slate-100">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Name *"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Email (optional)"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <UserPlus size={12} />
              Add member
            </button>
          </div>

          {/* Member list */}
          <div className="px-5 py-3 max-h-52 overflow-y-auto">
            {teamMembers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No team members yet</p>
            ) : (
              <ul className="space-y-1">
                {teamMembers.map((m) => (
                  <li key={m.id} className="flex items-center gap-2 py-1.5">
                    <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center shrink-0">
                      {m.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{m.name}</p>
                      {m.email && <p className="text-xs text-slate-400 truncate">{m.email}</p>}
                    </div>
                    <button
                      onClick={() => onDelete(m.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
