import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface FamilyAccount {
  id: string;
  family_name: string;
  account_type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  settings: any;
}

interface FamilySession {
  id: string;
  family_account_id: string;
  session_type: string;
  participants: any;
  issue_description?: string;
  ai_suggestions: any;
  exercises_completed: any;
  mood_scores: any;
  created_at: string;
  completed_at?: string;
  notes?: string;
}

interface FamilyMember {
  id: string;
  full_name: string;
  age_group: string;
  relationship_type: string;
  family_account_id: string;
}

export const useFamilyMode = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [familyAccount, setFamilyAccount] = useState<FamilyAccount | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familySessions, setFamilySessions] = useState<FamilySession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFamilyData();
    }
  }, [user]);

  const fetchFamilyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check if user has a family account or is part of one
      const { data: profile } = await supabase
        .from('profiles')
        .select('family_account_id')
        .eq('id', user.id)
        .single();

      if (profile?.family_account_id) {
        await fetchFamilyAccount(profile.family_account_id);
      } else {
        // Check if user created a family account
        const { data: ownedAccount } = await supabase
          .from('family_accounts')
          .select('*')
          .eq('created_by', user.id)
          .single();

        if (ownedAccount) {
          setFamilyAccount(ownedAccount);
          await fetchFamilyMembers(ownedAccount.id);
          await fetchFamilySessions(ownedAccount.id);
        }
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyAccount = async (accountId: string) => {
    const { data, error } = await supabase
      .from('family_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) throw error;
    setFamilyAccount(data);
    
    await fetchFamilyMembers(accountId);
    await fetchFamilySessions(accountId);
  };

  const fetchFamilyMembers = async (accountId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, age_group, relationship_type, family_account_id')
      .eq('family_account_id', accountId);

    if (error) throw error;
    setFamilyMembers(data || []);
  };

  const fetchFamilySessions = async (accountId: string) => {
    const { data, error } = await supabase
      .from('family_sessions')
      .select('*')
      .eq('family_account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setFamilySessions(data || []);
  };

  const createFamilyAccount = async (familyName: string, accountType: 'family' | 'couple') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('family_accounts')
        .insert({
          family_name: familyName,
          account_type: accountType,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update user's profile to link to family account
      await supabase
        .from('profiles')
        .update({ 
          family_account_id: data.id,
          relationship_type: accountType === 'couple' ? 'partner' : 'parent'
        })
        .eq('id', user.id);

      setFamilyAccount(data);
      await fetchFamilyData();

      toast({
        title: "Family Account Created",
        description: `${familyName} ${accountType} account is ready!`,
      });

      return data;
    } catch (error) {
      console.error('Error creating family account:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create family account. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const addFamilyMember = async (memberId: string, relationshipType: string) => {
    if (!familyAccount) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          family_account_id: familyAccount.id,
          relationship_type: relationshipType
        })
        .eq('id', memberId);

      if (error) throw error;

      await fetchFamilyMembers(familyAccount.id);

      toast({
        title: "Member Added",
        description: "Family member has been added successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: "Addition Failed",
        description: "Failed to add family member. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const startFamilySession = async (
    sessionType: 'couple' | 'family' | 'parent_child',
    participants: string[],
    issueDescription?: string
  ) => {
    if (!familyAccount) return null;

    try {
      const { data, error } = await supabase.functions.invoke('family-ai-coach', {
        body: {
          familyAccountId: familyAccount.id,
          sessionType,
          participants,
          issueDescription,
          action: 'create_session_plan'
        }
      });

      if (error) throw error;

      await fetchFamilySessions(familyAccount.id);
      return data.session;
    } catch (error) {
      console.error('Error starting family session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start family session. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getAISuggestions = async (
    sessionType: 'couple' | 'family' | 'parent_child',
    participants: string[],
    issueDescription: string
  ) => {
    if (!familyAccount) return null;

    try {
      const { data, error } = await supabase.functions.invoke('family-ai-coach', {
        body: {
          familyAccountId: familyAccount.id,
          sessionType,
          participants,
          issueDescription,
          action: 'suggest_exercises'
        }
      });

      if (error) throw error;
      return data.aiResponse;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return null;
    }
  };

  const completeFamilySession = async (sessionId: string, notes?: string, moodScores?: Record<string, number>) => {
    try {
      const { error } = await supabase
        .from('family_sessions')
        .update({
          completed_at: new Date().toISOString(),
          notes,
          mood_scores: moodScores || {}
        })
        .eq('id', sessionId);

      if (error) throw error;

      await fetchFamilySessions(familyAccount!.id);

      toast({
        title: "Session Complete",
        description: "Family session has been completed and saved.",
      });
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Completion Error",
        description: "Failed to complete session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hasFamilyAccount = (): boolean => {
    return familyAccount !== null;
  };

  const isCreator = (): boolean => {
    return familyAccount?.created_by === user?.id;
  };

  return {
    familyAccount,
    familyMembers,
    familySessions,
    loading,
    hasFamilyAccount,
    isCreator,
    createFamilyAccount,
    addFamilyMember,
    startFamilySession,
    getAISuggestions,
    completeFamilySession,
    fetchFamilyData
  };
};