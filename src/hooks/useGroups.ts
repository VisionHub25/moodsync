import { useState, useEffect, useCallback } from 'react';
import { supabase, Group, GroupMember } from '../lib/supabase';

interface GroupWithMembers extends Group {
  memberCount: number;
  todayVibe: number | null;
}

interface UseGroupsReturn {
  groups: GroupWithMembers[];
  isLoading: boolean;
  error: string | null;
  createGroup: (name: string) => Promise<Group | null>;
  joinGroup: (inviteCode: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return;
      }

      // Get user's groups with member count
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            id,
            name,
            invite_code,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setGroups([]);
        return;
      }

      // Get member counts and today's vibe for each group
      const groupsWithData: GroupWithMembers[] = await Promise.all(
        memberships.map(async (m: any) => {
          const group = m.groups as Group;
          
          // Get member count
          const { count: memberCount } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          // Get today's vibe (aggregated score)
          const today = new Date().toISOString().split('T')[0];
          const { data: vibeData } = await supabase.rpc('get_group_vibe', {
            p_group_id: group.id,
            p_date: today,
          });

          return {
            ...group,
            memberCount: memberCount || 0,
            todayVibe: vibeData?.[0]?.avg_score ?? null,
          };
        })
      );

      setGroups(groupsWithData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = useCallback(async (name: string): Promise<Group | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return null;
      }

      // Generate invite code
      const { data: inviteCode } = await supabase.rpc('generate_invite_code');

      // Create group
      const { data: newGroup, error: createError } = await supabase
        .from('groups')
        .insert({
          name,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as admin
      await supabase.from('group_members').insert({
        group_id: newGroup.id,
        user_id: user.id,
        role: 'admin',
      });

      await fetchGroups();
      return newGroup;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen');
      return null;
    }
  }, [fetchGroups]);

  const joinGroup = useCallback(async (inviteCode: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return false;
      }

      // Find group by invite code
      const { data: group, error: findError } = await supabase
        .from('groups')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (findError || !group) {
        setError('Gruppe nicht gefunden');
        return false;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        setError('Du bist bereits Mitglied');
        return false;
      }

      // Join group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member',
        });

      if (joinError) throw joinError;

      await fetchGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Beitreten');
      return false;
    }
  }, [fetchGroups]);

  const leaveGroup = useCallback(async (groupId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Nicht eingeloggt');
        return false;
      }

      const { error: leaveError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (leaveError) throw leaveError;

      await fetchGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Verlassen');
      return false;
    }
  }, [fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    refresh: fetchGroups,
  };
}
