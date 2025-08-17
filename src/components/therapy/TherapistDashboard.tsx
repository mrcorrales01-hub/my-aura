import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  Clock,
  Brain,
  Heart,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import PatientSummary from './PatientSummary';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface Patient {
  patient_id: string;
  patient_name: string;
  appointment_count: number;
  last_session: string;
  avg_mood: number;
  total_conversations: number;
}

interface Appointment {
  id: string;
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  therapist_notes?: string;
}

const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    upcomingAppointments: 0,
    averageRating: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    if (user) {
      fetchTherapistData();
    }
  }, [user]);

  const fetchTherapistData = async () => {
    try {
      setLoading(true);

      // Get patients summary
      const { data: patientsData, error: patientsError } = await supabase
        .rpc('get_therapist_patients_summary', { therapist_user_id: user!.id });

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive"
        });
        return;
      }

      setPatients(patientsData || []);

      // Get appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .in('therapist_id', 
          await supabase
            .from('therapists')
            .select('id')
            .eq('user_id', user!.id)
            .then(res => res.data?.map(t => t.id) || [])
        )
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      } else {
        setAppointments(appointmentsData || []);
      }

      // Calculate stats
      const totalPatients = patientsData?.length || 0;
      const upcomingAppointments = appointmentsData?.filter(a => 
        a.status === 'scheduled' && new Date(a.scheduled_at) > new Date()
      ).length || 0;

      setStats({
        totalPatients,
        upcomingAppointments,
        averageRating: 4.8, // Would calculate from reviews
        monthlyRevenue: 5200 // Would calculate from completed appointments
      });

    } catch (error) {
      console.error('Error fetching therapist data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-yellow-600';
    if (mood >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUrgencyLevel = (patient: Patient) => {
    if (patient.avg_mood < 4) return 'high';
    if (patient.avg_mood < 6) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Therapist Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Monitor patient progress and manage your practice
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Active patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">Patient reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Patient Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patients.map((patient) => (
                    <div
                      key={patient.patient_id}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{patient.patient_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{patient.appointment_count} sessions</span>
                          <span className={getMoodColor(patient.avg_mood)}>
                            Avg mood: {patient.avg_mood.toFixed(1)}/10
                          </span>
                          <span>{patient.total_conversations} AI chats</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getUrgencyColor(getUrgencyLevel(patient))}>
                          {getUrgencyLevel(patient)} priority
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {patients.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No patients assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedPatient ? (
                <PatientSummary patient={selectedPatient} />
              ) : (
                <Card className="lg:col-span-1">
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a patient to view AI-generated summary</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-semibold">
                        {new Date(appointment.scheduled_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.scheduled_at).toLocaleTimeString()} • 
                        {appointment.duration_minutes} minutes • {appointment.session_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{appointment.status}</Badge>
                      <Button size="sm">Join Session</Button>
                    </div>
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Patient Mood Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patients.slice(0, 5).map((patient) => (
                      <div key={patient.patient_id} className="flex items-center justify-between">
                        <span className="text-sm">{patient.patient_name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                patient.avg_mood >= 7 ? 'bg-green-500' : 
                                patient.avg_mood >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(patient.avg_mood / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{patient.avg_mood.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    AI Interaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {patients.reduce((sum, p) => sum + p.total_conversations, 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total AI conversations this month</p>      
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {patients.length > 0 ? 
                          (patients.reduce((sum, p) => sum + p.total_conversations, 0) / patients.length).toFixed(1) 
                          : '0'
                        }
                      </div>
                      <p className="text-sm text-muted-foreground">Average per patient</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TherapistDashboard;