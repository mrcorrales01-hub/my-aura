import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface TherapistProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  license_number: string;
  license_state: string;
  specializations: string[];
  languages: string[];
  hourly_rate: number;
  bio?: string;
  is_verified: boolean;
  is_active: boolean;
}

export const useTherapistAuth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [therapistProfile, setTherapistProfile] = useState<TherapistProfile | null>(null);
  const [isTherapist, setIsTherapist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkTherapistStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkTherapistStatus = async () => {
    try {
      setLoading(true);

      const { data: therapist, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking therapist status:', error);
        toast({
          title: "Error",
          description: "Failed to verify therapist status",
          variant: "destructive"
        });
        return;
      }

      if (therapist) {
        setTherapistProfile(therapist);
        setIsTherapist(true);
      } else {
        setTherapistProfile(null);
        setIsTherapist(false);
      }

    } catch (error) {
      console.error('Error checking therapist status:', error);
      toast({
        title: "Error",
        description: "Failed to verify therapist status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTherapistProfile = async (profileData: {
    full_name: string;
    email: string;
    phone?: string;
    license_number: string;
    license_state: string;
    specializations: string[];
    languages: string[];
    hourly_rate: number;
    bio?: string;
    education?: string;
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a therapist profile",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('therapists')
        .insert({
          user_id: user.id,
          ...profileData,
          is_verified: false, // Will be verified by admin
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating therapist profile:', error);
        toast({
          title: "Error",
          description: "Failed to create therapist profile",
          variant: "destructive"
        });
        return false;
      }

      setTherapistProfile(data);
      setIsTherapist(true);

      toast({
        title: "Profile Created",
        description: "Your therapist profile has been submitted for verification",
      });

      return true;
    } catch (error) {
      console.error('Error creating therapist profile:', error);
      toast({
        title: "Error",
        description: "Failed to create therapist profile",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateTherapistProfile = async (updates: Partial<TherapistProfile>) => {
    if (!therapistProfile) return false;

    try {
      const { data, error } = await supabase
        .from('therapists')
        .update(updates)
        .eq('id', therapistProfile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating therapist profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return false;
      }

      setTherapistProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your therapist profile has been updated",
      });

      return true;
    } catch (error) {
      console.error('Error updating therapist profile:', error);
      return false;
    }
  };

  return {
    therapistProfile,
    isTherapist,
    loading,
    checkTherapistStatus,
    createTherapistProfile,
    updateTherapistProfile
  };
};