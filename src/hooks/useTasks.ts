import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task, Status, Priority } from '@/lib/types'

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })
        .abortSignal(controller.signal)
      clearTimeout(timeout)
      if (error) {
        setError(error.message)
      } else {
        setTasks(data as Task[])
      }
    } catch {
      setError('Failed to load tasks. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    fetchTasks()

    // Realtime subscription
    const channel = supabase
      .channel(`tasks-channel-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchTasks])

  const createTask = useCallback(
    async (
      title: string,
      opts?: { description?: string; priority?: Priority; due_date?: string; status?: Status; assignee_id?: string | null }
    ) => {
      if (!userId) return null
      const targetStatus = opts?.status ?? 'todo'
      const maxPosition = tasks.filter((t) => t.status === targetStatus).length
      const newTask = {
        title,
        description: opts?.description ?? null,
        status: targetStatus,
        priority: opts?.priority ?? 'normal',
        due_date: opts?.due_date ?? null,
        assignee_id: opts?.assignee_id ?? null,
        position: maxPosition,
        user_id: userId,
      }
      // Optimistic update
      const tempId = crypto.randomUUID()
      const optimistic: Task = {
        ...newTask,
        id: tempId,
        created_at: new Date().toISOString(),
      }
      setTasks((prev) => [...prev, optimistic])

      const { data, error } = await supabase.from('tasks').insert(newTask).select().single()
      if (error) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId))
        setError(error.message)
        return null
      }
      setTasks((prev) => prev.map((t) => (t.id === tempId ? (data as Task) : t)))
      return data as Task
    },
    [userId, tasks]
  )

  const updateTask = useCallback(
    async (id: string, patch: Partial<Task>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
      const { error } = await supabase.from('tasks').update(patch).eq('id', id)
      if (error) {
        setError(error.message)
        await fetchTasks() // Revert on error
      }
    },
    [fetchTasks]
  )

  const deleteTask = useCallback(
    async (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id))
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) {
        setError(error.message)
        await fetchTasks()
      }
    },
    [fetchTasks]
  )

  return { tasks, loading, error, createTask, updateTask, deleteTask, setError }
}
