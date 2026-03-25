import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { TeamMember } from '@/lib/types'

export function useTeamMembers(userId: string | null) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamMembers = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setTeamMembers((data as TeamMember[]) ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  const createTeamMember = useCallback(
    async (name: string, email?: string) => {
      if (!userId) return
      const { data, error } = await supabase
        .from('team_members')
        .insert({ name, email: email || null, user_id: userId })
        .select()
        .single()
      if (error) {
        setError(error.message)
      } else {
        setTeamMembers((prev) => [...prev, data as TeamMember].sort((a, b) => a.name.localeCompare(b.name)))
      }
    },
    [userId]
  )

  const deleteTeamMember = useCallback(async (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id))
    const { error } = await supabase.from('team_members').delete().eq('id', id)
    if (error) {
      setError(error.message)
      fetchTeamMembers()
    }
  }, [fetchTeamMembers])

  return { teamMembers, loading, error, createTeamMember, deleteTeamMember }
}
