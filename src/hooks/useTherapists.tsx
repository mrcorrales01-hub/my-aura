import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { logSecurityEvent } from '@/utils/security';

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

export interface TherapistMarketplaceData {
  anonymous_id: string;
  display_name: string;
  professional_title: string;
  specializations: string[];
  languages: string[];
  hourly_rate: number;
  years_experience: number;
  bio_preview: string;
  timezone: string;
  average_rating: number;
  review_count: number;
  is_available: boolean;
}

export const useTherapists = () => {
  const [therapists, setTherapists] = useState<TherapistMarketplaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTherapists = async () => {
    try {
      // Use the ultra-secure anonymous marketplace function
      const { data, error } = await supabase.rpc('get_anonymous_therapist_marketplace');
      
      if (error) throw error;
      
      setTherapists(data || []);
      
      // Enhanced security logging
      if (data && data.length > 0) {
        await supabase.rpc('log_therapist_data_access', {
          p_access_type: 'marketplace_view',
          p_therapist_count: data.length,
          p_context: 'anonymous_marketplace'
        });
      }
    } catch (error) {
      console.error('Error fetching therapists:', error);
      
      // Log security event for failed access
      await logSecurityEvent('therapist_marketplace_access_failed', 'medium', {
        error: error.message,
        timestamp: new Date().toISOString()
      }, 50);
      
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
      // Use secure anonymous marketplace function for search
      const { data, error } = await supabase.rpc('get_anonymous_therapist_marketplace');
      
      if (error) throw error;

      let filteredData = data || [];

      if (filters.maxRate) {
        filteredData = filteredData.filter(therapist => therapist.hourly_rate <= filters.maxRate);
      }

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

      setTherapists(filteredData.sort((a, b) => a.hourly_rate - b.hourly_rate));
      
      // Log filtered search
      await supabase.rpc('log_therapist_data_access', {
        p_access_type: 'marketplace_search',
        p_therapist_count: filteredData.length,
        p_context: 'anonymous_search'
      });
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