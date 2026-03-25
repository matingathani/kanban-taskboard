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

  return { teamMembers, loading, error }
}
