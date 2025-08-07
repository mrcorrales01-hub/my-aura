import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Appointment {
  id: string;
  client_id: string;
  therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  session_url?: string;
  session_notes?: string;
  client_rating?: number;
  therapist_notes?: string;
  total_cost?: number;
  created_at: string;
  updated_at: string;
  therapist?: {
    full_name: string;
    profile_image_url?: string;
  };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          therapist:therapists!therapist_id (
            full_name,
            profile_image_url
          )
        `)
        .eq('client_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive"
        });
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (
    therapistId: string,
    scheduledAt: Date,
    sessionType: 'video' | 'audio' | 'chat' = 'video',
    durationMinutes: number = 50
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book an appointment",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Get therapist rate
      const { data: therapist, error: therapistError } = await supabase
        .from('therapists')
        .select('hourly_rate')
        .eq('id', therapistId)
        .single();

      if (therapistError || !therapist) {
        toast({
          title: "Error",
          description: "Failed to get therapist information",
          variant: "destructive"
        });
        return false;
      }

      const totalCost = (therapist.hourly_rate * durationMinutes) / 60;

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          therapist_id: therapistId,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: durationMinutes,
          session_type: sessionType,
          total_cost: totalCost,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        console.error('Error booking appointment:', error);
        toast({
          title: "Error",
          description: "Failed to book appointment",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Appointment booked successfully!",
      });

      fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: Appointment['status'],
    notes?: string
  ) => {
    try {
      const updateData: any = { status };
      if (notes) updateData.session_notes = notes;

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment:', error);
        toast({
          title: "Error",
          description: "Failed to update appointment",
          variant: "destructive"
        });
        return false;
      }

      fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return false;
    }
  };

  const rateTherapist = async (
    appointmentId: string,
    therapistId: string,
    rating: number,
    reviewText?: string
  ) => {
    if (!user) return false;

    try {
      // Update appointment with rating
      await supabase
        .from('appointments')
        .update({ client_rating: rating })
        .eq('id', appointmentId);

      // Create review
      await supabase
        .from('therapist_reviews')
        .insert({
          client_id: user.id,
          therapist_id: therapistId,
          appointment_id: appointmentId,
          rating,
          review_text: reviewText,
          is_anonymous: false
        });

      toast({
        title: "Success",
        description: "Thank you for your review!",
      });

      fetchAppointments();
      return true;
    } catch (error) {
      console.error('Error rating therapist:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  return {
    appointments,
    loading,
    fetchAppointments,
    bookAppointment,
    updateAppointmentStatus,
    rateTherapist
  };
};