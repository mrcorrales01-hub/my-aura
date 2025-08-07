import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Therapist {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  license_number: string;
  license_state: string;
  specializations: string[];
  languages: string[];
  timezone: string;
  hourly_rate: number;
  bio?: string;
  profile_image_url?: string;
  years_experience: number;
  education?: string;
  is_verified: boolean;
  is_active: boolean;
  availability: any;
  created_at: string;
  updated_at: string;
}

export const useTherapists = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching therapists:', error);
        toast({
          title: "Error",
          description: "Failed to load therapists",
          variant: "destructive"
        });
        return;
      }

      setTherapists(data || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast({
        title: "Error",
        description: "Failed to load therapists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchTherapists = async (filters: {
    specializations?: string[];
    languages?: string[];
    maxRate?: number;
  }) => {
    try {
      let query = supabase
        .from('therapists')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true);

      if (filters.maxRate) {
        query = query.lte('hourly_rate', filters.maxRate);
      }

      const { data, error } = await query.order('hourly_rate', { ascending: true });

      if (error) {
        console.error('Error searching therapists:', error);
        return;
      }

      let filteredData = data || [];

      if (filters.specializations?.length) {
        filteredData = filteredData.filter(therapist =>
          therapist.specializations.some(spec =>
            filters.specializations!.includes(spec)
          )
        );
      }

      if (filters.languages?.length) {
        filteredData = filteredData.filter(therapist =>
          therapist.languages.some(lang =>
            filters.languages!.includes(lang)
          )
        );
      }

      setTherapists(filteredData);
    } catch (error) {
      console.error('Error searching therapists:', error);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  return {
    therapists,
    loading,
    fetchTherapists,
    searchTherapists
  };
};