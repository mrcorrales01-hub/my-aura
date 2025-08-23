import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Star,
  Video,
  MessageSquare,
  Clock,
  DollarSign,
  Languages,
  Award,
  Calendar as CalendarIcon,
  Filter,
  Search,
  MapPin,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';

interface Therapist {
  id: string;
  full_name: string;
  email: string;
  hourly_rate: number;
  years_experience: number;
  is_verified: boolean;
  specializations: string[];
  languages: string[];
  timezone: string;
  bio: string;
  profile_image_url: string;
  education: string;
  license_number: string;
  license_state: string;
  rating?: number;
  reviews_count?: number;
}

interface BookingData {
  therapist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: 'video' | 'chat';
  session_notes?: string;
}

const TherapistMarketplace = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video');
  const [sessionNotes, setSessionNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const { t } = useGlobalLanguage();
  const { user } = useAuth();
  const { subscribed, createCheckoutSession } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [therapists, searchTerm, selectedSpecialization, selectedLanguage, priceRange]);

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('therapists')
        .select(`
          *,
          therapist_reviews (
            rating
          )
        `)
        .eq('is_active', true)
        .eq('is_verified', true);

      if (error) throw error;

      const therapistsWithRatings = data?.map(therapist => {
        const reviews = therapist.therapist_reviews || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0;
        
        return {
          ...therapist,
          rating: avgRating,
          reviews_count: reviews.length
        };
      }) || [];

      setTherapists(therapistsWithRatings);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      toast({
        title: "Error",
        description: "Failed to load therapists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = therapists;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(t => 
        t.specializations.includes(selectedSpecialization)
      );
    }

    if (selectedLanguage) {
      filtered = filtered.filter(t => 
        t.languages.includes(selectedLanguage)
      );
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(t => {
        if (max) {
          return t.hourly_rate >= min && t.hourly_rate <= max;
        }
        return t.hourly_rate >= min;
      });
    }

    setFilteredTherapists(filtered);
  };

  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTherapist || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);

    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const bookingData: BookingData = {
        therapist_id: selectedTherapist.id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 50,
        session_type: sessionType,
        session_notes: sessionNotes || undefined
      };

      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          ...bookingData,
          total_cost: selectedTherapist.hourly_rate,
          status: 'scheduled'
        });

      if (error) throw error;

      // If user is not subscribed, redirect to payment
      if (!subscribed) {
        toast({
          title: "Payment Required",
          description: "Redirecting to payment for your therapy session...",
        });
        
        await createCheckoutSession({
          planType: 'premium_monthly',
          paymentMethods: ['card', 'paypal'],
          countryCode: 'US'
        });
      } else {
        toast({
          title: "Session Booked!",
          description: `Your session with ${selectedTherapist.full_name} has been scheduled.`,
        });
      }

      setBookingDialogOpen(false);
      setSelectedTherapist(null);
      setSelectedDate(new Date());
      setSelectedTime('');
      setSessionNotes('');

    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const allSpecializations = [...new Set(therapists.flatMap(t => t.specializations))];
  const allLanguages = [...new Set(therapists.flatMap(t => t.languages))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Licensed Therapist Marketplace</h1>
          <p className="text-xl text-muted-foreground">
            Connect with verified therapists worldwide for secure video sessions
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name or specialization"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Specialization</Label>
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All specializations</SelectItem>
                    {allSpecializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All languages</SelectItem>
                    {allLanguages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Price Range</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any price</SelectItem>
                    <SelectItem value="0-50">$0 - $50</SelectItem>
                    <SelectItem value="51-100">$51 - $100</SelectItem>
                    <SelectItem value="101-150">$101 - $150</SelectItem>
                    <SelectItem value="151">$151+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Therapists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={therapist.profile_image_url} />
                    <AvatarFallback>{therapist.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <CardTitle className="text-lg">{therapist.full_name}</CardTitle>
                      {therapist.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(therapist.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({therapist.reviews_count || 0})
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {therapist.years_experience} years
                    </div>
                    <div className="flex items-center text-sm font-semibold text-primary">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ${therapist.hourly_rate}/session
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {therapist.specializations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{therapist.specializations.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Languages className="w-4 h-4 mr-2" />
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {therapist.languages.slice(0, 3).map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {therapist.bio}
                </p>

                <div className="flex space-x-2">
                  <Dialog 
                    open={bookingDialogOpen && selectedTherapist?.id === therapist.id} 
                    onOpenChange={(open) => {
                      setBookingDialogOpen(open);
                      if (open) {
                        setSelectedTherapist(therapist);
                      } else {
                        setSelectedTherapist(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="flex-1">
                        <Video className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Book Session with {therapist.full_name}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Session Type</Label>
                            <Select value={sessionType} onValueChange={(value: 'video' | 'chat') => setSessionType(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">
                                  <div className="flex items-center">
                                    <Video className="w-4 h-4 mr-2" />
                                    Video Call
                                  </div>
                                </SelectItem>
                                <SelectItem value="chat">
                                  <div className="flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Text Chat
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Duration</Label>
                            <Select defaultValue="50">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50">50 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  disabled={(date) => date < new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div>
                            <Label>Time</Label>
                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map(time => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Session Notes (Optional)</Label>
                          <Textarea
                            placeholder="Any specific topics or concerns you'd like to discuss..."
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                          />
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Cost:</span>
                            <span className="text-xl font-bold text-primary">
                              ${therapist.hourly_rate}
                            </span>
                          </div>
                          {!subscribed && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Premium members get 20% discount on therapy sessions
                            </p>
                          )}
                        </div>

                        <Button 
                          onClick={handleBookSession} 
                          disabled={bookingLoading || !selectedDate || !selectedTime}
                          className="w-full"
                        >
                          {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No therapists found matching your criteria.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialization('');
                setSelectedLanguage('');
                setPriceRange('');
              }}
              variant="outline" 
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistMarketplace;