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
  id: string;
  full_name: string;
  specializations: string[];
  languages: string[];
  hourly_rate: number;
  years_experience: number;
  bio: string;
  timezone: string;
  availability: any;
  average_rating: number;
  review_count: number;
  profile_image_url?: string;
}

export const useTherapists = () => {
  const [therapists, setTherapists] = useState<TherapistMarketplaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTherapists = async () => {
    try {
      // Use the enhanced secure marketplace function
      const { data, error } = await supabase.rpc('get_secure_therapist_marketplace_v2');
      
      if (error) throw error;
      
      setTherapists(data || []);
      
      // Log secure access to therapist data
      if (data && data.length > 0) {
        await logSecurityEvent('therapist_marketplace_accessed', 'low', {
          therapist_count: data.length,
          timestamp: new Date().toISOString()
        }, 20);
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
      // Use secure marketplace function for search as well
      const { data, error } = await supabase.rpc('get_secure_therapist_marketplace_v2');
      
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