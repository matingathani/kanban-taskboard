import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Comment } from '@/lib/types'

export function useComments(taskId: string | null, userId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const fetchComments = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    setComments((data as Comment[]) ?? [])
    setLoading(false)
  }, [taskId])

  const createComment = useCallback(
    async (content: string) => {
      if (!taskId || !userId) return
      const newComment = { task_id: taskId, content, user_id: userId }
      const tempId = crypto.randomUUID()
      const optimistic: Comment = {
        ...newComment,
        id: tempId,
        created_at: new Date().toISOString(),
      }
      setComments((prev) => [...prev, optimistic])
      const { data, error } = await supabase.from('comments').insert(newComment).select().single()
      if (error) {
        setComments((prev) => prev.filter((c) => c.id !== tempId))
      } else {
        setComments((prev) => prev.map((c) => (c.id === tempId ? (data as Comment) : c)))
      }
    },
    [taskId, userId]
  )

  return { comments, loading, fetchComments, createComment }
}
