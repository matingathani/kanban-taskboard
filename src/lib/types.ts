export type Priority = 'low' | 'normal' | 'high'
export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'

export interface TeamMember {
  id: string
  name: string
  email: string | null
  user_id: string
  created_at: string
}

export interface NewTaskData {
  title: string
  description?: string
  priority?: Priority
  due_date?: string
  assignee_id?: string | null
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  assignee_id: string | null
  position: number
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  content: string
  user_id: string
  created_at: string
}

export const COLUMNS: { id: Status; label: string; color: string; accent: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-slate-400', accent: '#94a3b8' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-500', accent: '#3b82f6' },
  { id: 'in_review', label: 'In Review', color: 'border-amber-500', accent: '#f59e0b' },
  { id: 'done', label: 'Done', color: 'border-green-500', accent: '#22c55e' },
]
