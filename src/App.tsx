import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTasks } from '@/hooks/useTasks'
import { Board } from '@/components/Board/Board'
import { Header } from '@/components/Header/Header'
import { TaskDetail } from '@/components/TaskDetail/TaskDetail'
import type { Task, Status } from '@/lib/types'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold">KB</span>
        </div>
        <p className="text-white/50 text-sm">Loading your board...</p>
      </div>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-6">
        <div className="text-red-400 text-4xl mb-4">⚠</div>
        <h2 className="text-white font-semibold mb-2">Something went wrong</h2>
        <p className="text-white/50 text-sm mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(userId)

  // Anonymous auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUserId(session.user.id)
        } else {
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) throw error
          setUserId(data.user?.id ?? null)
        }
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Authentication failed')
      } finally {
        setAuthLoading(false)
      }
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Keep selectedTask in sync with task updates
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id)
      if (updated) setSelectedTask(updated)
      else setSelectedTask(null)
    }
  }, [tasks])

  const handleCreateTask = async (title: string, status?: Status) => {
    const task = await createTask(title, {})
    if (task && status && status !== 'todo') {
      await updateTask(task.id, { status })
    }
  }

  const handleUpdateTask = (id: string, patch: Partial<Task>) => {
    updateTask(id, patch)
  }

  const handleDeleteTask = (id: string) => {
    deleteTask(id)
  }

  if (authLoading || (loading && tasks.length === 0)) return <LoadingScreen />
  if (authError) return <ErrorScreen message={authError} />
  if (error && tasks.length === 0) return <ErrorScreen message={error} />

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header
        tasks={tasks}
        searchQuery={searchQuery}
        priorityFilter={priorityFilter}
        onSearchChange={setSearchQuery}
        onPriorityFilterChange={setPriorityFilter}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <Board
          tasks={tasks}
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
          onTaskClick={setSelectedTask}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
        />
      </main>

      {selectedTask && userId && (
        <TaskDetail
          task={selectedTask}
          userId={userId}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  )
}
