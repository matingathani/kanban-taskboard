import { useState, useEffect } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { useComments } from '@/hooks/useComments'
import { formatRelativeTime } from '@/lib/utils'

interface Props {
  taskId: string
  userId: string
}

export function CommentList({ taskId, userId }: Props) {
  const { comments, loading, fetchComments, createComment } = useComments(taskId, userId)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    setSubmitting(true)
    await createComment(trimmed)
    setContent('')
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <MessageSquare size={14} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Comments</h3>
        {comments.length > 0 && (
          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-2">
              <div className="w-6 h-6 bg-slate-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-700">You</span>
                  <span className="text-xs text-slate-400">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-1">
        <div className="flex gap-2 items-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as unknown as React.FormEvent)
              }
            }}
            placeholder="Write a comment..."
            rows={2}
            className="flex-1 resize-none text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">Enter to submit · Shift+Enter for newline</p>
      </form>
    </div>
  )
}
