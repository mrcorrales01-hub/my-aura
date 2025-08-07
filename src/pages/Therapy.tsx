import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, Video, Clock, Star } from 'lucide-react';
import { useTherapists } from '@/hooks/useTherapists';
import { useAppointments } from '@/hooks/useAppointments';
import TherapistCard from '@/components/therapy/TherapistCard';
import AppointmentBooking from '@/components/therapy/AppointmentBooking';
import VideoCall from '@/components/therapy/VideoCall';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const Therapy: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [activeVideoCall, setActiveVideoCall] = useState<any>(null);
  const [filters, setFilters] = useState({
    specialization: '',
    language: '',
    maxRate: ''
  });

  const { therapists, loading: therapistsLoading, searchTherapists } = useTherapists();
  const { appointments, loading: appointmentsLoading } = useAppointments();

  const specializations = [
    'Anxiety', 'Depression', 'PTSD', 'Relationships', 'Family Therapy',
    'Addiction', 'Eating Disorders', 'Grief & Loss', 'Life Transitions',
    'Stress Management', 'Sleep Disorders', 'Anger Management'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian'
  ];

  const handleSearch = () => {
    const searchFilters: any = {};
    
    if (filters.specialization) {
      searchFilters.specializations = [filters.specialization];
    }
    if (filters.language) {
      searchFilters.languages = [filters.language.toLowerCase()];
    }
    if (filters.maxRate) {
      searchFilters.maxRate = Number(filters.maxRate);
    }
    
    searchTherapists(searchFilters);
  };

  const handleBookSession = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    setSelectedTherapist(therapist);
    setShowBooking(true);
  };

  const handleJoinCall = (appointment: any) => {
    setActiveVideoCall(appointment);
  };

  const getUpcomingAppointments = () => {
    return appointments.filter(apt => 
      apt.status === 'scheduled' && 
      new Date(apt.scheduled_at) > new Date()
    ).slice(0, 3);
  };

  const getPastAppointments = () => {
    return appointments.filter(apt => 
      apt.status === 'completed' || 
      new Date(apt.scheduled_at) < new Date()
    );
  };

  if (therapistsLoading) {
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Professional Therapy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with licensed therapists for personalized mental health support
          </p>
        </div>

        <Tabs defaultValue="find-therapist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="find-therapist">Find Therapist</TabsTrigger>
            <TabsTrigger value="appointments">My Sessions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Find Therapist Tab */}
          <TabsContent value="find-therapist" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find Your Perfect Therapist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Input
                      placeholder="Search by name or keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Select value={filters.specialization} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, specialization: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Specializations</SelectItem>
                        {specializations.map(spec => (
                          <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select value={filters.language} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, language: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Languages</SelectItem>
                        {languages.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Button onClick={handleSearch} className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Therapist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map((therapist) => (
                <TherapistCard
                  key={therapist.id}
                  therapist={therapist}
                  onBookSession={handleBookSession}
                />
              ))}
            </div>

            {therapists.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No therapists found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or remove some filters
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="space-y-6">
              {getUpcomingAppointments().map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Session with {appointment.therapist?.full_name}
                      </CardTitle>
                      <Badge variant="default">
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appointment.scheduled_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appointment.scheduled_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.duration_minutes} minutes</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => handleJoinCall(appointment)}>
                        <Video className="h-4 w-4 mr-2" />
                        Join Session
                      </Button>
                      <Button variant="outline">
                        Reschedule
                      </Button>
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {getUpcomingAppointments().length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming sessions</h3>
                    <p className="text-muted-foreground mb-4">
                      Book a session with one of our licensed therapists
                    </p>
                    <Button onClick={() => setShowBooking(true)}>
                      Find a Therapist
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="space-y-4">
              {getPastAppointments().map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {appointment.therapist?.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduled_at).toLocaleDateString()} • 
                          {appointment.duration_minutes} minutes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.client_rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{appointment.client_rating}</span>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline">
                            Rate Session
                          </Button>
                        )}
                        <Badge variant="secondary">
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Booking Modal */}
        <AppointmentBooking
          therapist={selectedTherapist}
          isOpen={showBooking}
          onClose={() => {
            setShowBooking(false);
            setSelectedTherapist(null);
          }}
        />

        {/* Video Call Modal */}
        {activeVideoCall && (
          <VideoCall
            appointmentId={activeVideoCall.id}
            therapistName={activeVideoCall.therapist?.full_name || 'Therapist'}
            isOpen={!!activeVideoCall}
            onClose={() => setActiveVideoCall(null)}
            onEndCall={() => setActiveVideoCall(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Therapy;