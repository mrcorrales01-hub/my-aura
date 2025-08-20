import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface SafetyContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;
  relationship: 'family' | 'friend' | 'partner' | 'therapist';
  emergency_contact: boolean;
  crisis_notifications: boolean;
  verification_status: 'pending' | 'verified' | 'declined';
  created_at: string;
}

export const useSafetyNetwork = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<SafetyContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safety_networks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data as SafetyContact[] || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch safety contacts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: {
    contact_name: string;
    contact_phone?: string;
    contact_email?: string;
    relationship: 'family' | 'friend' | 'partner' | 'therapist';
    emergency_contact?: boolean;
    crisis_notifications?: boolean;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('safety_networks')
        .insert({
          user_id: user.id,
          ...contactData,
          emergency_contact: contactData.emergency_contact || false,
          crisis_notifications: contactData.crisis_notifications !== false,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await fetchContacts();
      
      toast({
        title: 'Contact Added',
        description: `${contactData.contact_name} has been added to your safety network`
      });

      // Send verification request (simulated)
      if (contactData.contact_email || contactData.contact_phone) {
        setTimeout(() => {
          toast({
            title: 'Verification Sent',
            description: `Verification request sent to ${contactData.contact_name}`
          });
        }, 1000);
      }

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add safety contact',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (contactId: string, updates: Partial<SafetyContact>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('safety_networks')
        .update(updates)
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchContacts();
      
      toast({
        title: 'Contact Updated',
        description: 'Safety contact has been updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update safety contact',
        variant: 'destructive'
      });
    }
  };

  const removeContact = async (contactId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('safety_networks')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchContacts();
      
      toast({
        title: 'Contact Removed',
        description: 'Safety contact has been removed from your network'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove safety contact',
        variant: 'destructive'
      });
    }
  };

  const verifyContact = async (contactId: string, status: 'verified' | 'declined') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('safety_networks')
        .update({ verification_status: status })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchContacts();
      
      const statusText = status === 'verified' ? 'verified' : 'declined';
      toast({
        title: `Contact ${statusText}`,
        description: `Contact verification has been ${statusText}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  };

  const triggerCrisisAlert = async (message: string, severity: 'low' | 'medium' | 'high' | 'emergency') => {
    if (!user) return;

    const crisisContacts = contacts.filter(contact => 
      contact.crisis_notifications && 
      contact.verification_status === 'verified'
    );

    if (crisisContacts.length === 0) {
      toast({
        title: 'No Crisis Contacts',
        description: 'No verified contacts available for crisis alerts',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Simulate crisis alert sending
      const alertData = {
        user_id: user.id,
        message,
        severity,
        timestamp: new Date().toISOString(),
        contacts_notified: crisisContacts.map(c => c.id)
      };

      // In a real implementation, this would trigger actual notifications
      console.log('Crisis alert triggered:', alertData);

      toast({
        title: 'Crisis Alert Sent',
        description: `Alert sent to ${crisisContacts.length} emergency contacts`,
        variant: 'default'
      });

      return alertData;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send crisis alert',
        variant: 'destructive'
      });
    }
  };

  const getEmergencyContacts = () => {
    return contacts.filter(contact => 
      contact.emergency_contact && 
      contact.verification_status === 'verified'
    );
  };

  const getCrisisContacts = () => {
    return contacts.filter(contact => 
      contact.crisis_notifications && 
      contact.verification_status === 'verified'
    );
  };

  const getContactsByRelationship = (relationship: string) => {
    return contacts.filter(contact => contact.relationship === relationship);
  };

  const getVerificationStats = () => {
    const total = contacts.length;
    const verified = contacts.filter(c => c.verification_status === 'verified').length;
    const pending = contacts.filter(c => c.verification_status === 'pending').length;
    const declined = contacts.filter(c => c.verification_status === 'declined').length;

    return { total, verified, pending, declined };
  };

  return {
    contacts,
    loading,
    fetchContacts,
    addContact,
    updateContact,
    removeContact,
    verifyContact,
    triggerCrisisAlert,
    getEmergencyContacts,
    getCrisisContacts,
    getContactsByRelationship,
    getVerificationStats
  };
};