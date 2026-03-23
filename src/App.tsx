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
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out. Check your Supabase URL and anon key.')), ms)
        ),
      ])

    const init = async () => {
      try {
        const { data: { session } } = await withTimeout(supabase.auth.getSession(), 8000)
        if (session?.user) {
          setUserId(session.user.id)
        } else {
          const { data, error } = await withTimeout(supabase.auth.signInAnonymously(), 8000)
          if (error) throw new Error(
            error.message === 'Anonymous sign-ins are disabled'
              ? 'Anonymous sign-ins are not enabled. Enable them in Supabase → Authentication → Sign In / Sign Up → Anonymous sign-ins.'
              : error.message
          )
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
  const selectedTaskId = selectedTask?.id
  useEffect(() => {
    if (!selectedTaskId) return
    const updated = tasks.find((t) => t.id === selectedTaskId)
    if (updated) setSelectedTask(updated)
    else setSelectedTask(null)
  }, [tasks, selectedTaskId])

  const handleCreateTask = async (title: string, status?: Status) => {
    await createTask(title, { status })
  }

  const handleUpdateTask = (id: string, patch: Partial<Task>) => {
    updateTask(id, patch)
  }

  const handleDeleteTask = (id: string) => {
    deleteTask(id)
  }

  if (authError) return <ErrorScreen message={authError} />
  if (authLoading || (loading && tasks.length === 0)) return <LoadingScreen />
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
