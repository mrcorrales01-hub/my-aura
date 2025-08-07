import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarIcon, Clock, Video, Phone, MessageSquare } from 'lucide-react';
import { Therapist } from '@/hooks/useTherapists';
import { useAppointments } from '@/hooks/useAppointments';

interface AppointmentBookingProps {
  therapist: Therapist | null;
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  therapist,
  isOpen,
  onClose
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');
  const [duration, setDuration] = useState<number>(50);
  const { bookAppointment } = useAppointments();

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const sessionTypeOptions = [
    { value: 'video', label: 'Video Call', icon: Video },
    { value: 'audio', label: 'Audio Call', icon: Phone },
    { value: 'chat', label: 'Text Chat', icon: MessageSquare }
  ];

  const handleBooking = async () => {
    if (!therapist || !selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const success = await bookAppointment(
      therapist.id,
      appointmentDate,
      sessionType,
      duration
    );

    if (success) {
      onClose();
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  };

  const calculateCost = () => {
    if (!therapist) return 0;
    return (therapist.hourly_rate * duration) / 60;
  };

  if (!therapist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Session with {therapist.full_name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Therapist Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Therapist Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={therapist.profile_image_url} alt={therapist.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {therapist.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{therapist.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {therapist.years_experience} years experience
                  </p>
                  <p className="text-lg font-semibold text-primary mt-1">
                    ${therapist.hourly_rate}/hour
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-1">
                  {therapist.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule Your Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Select Date
                </h4>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Select Time
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="text-xs"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Type */}
              <div>
                <h4 className="font-medium mb-2">Session Type</h4>
                <div className="grid grid-cols-3 gap-2">
                  {sessionTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.value}
                        variant={sessionType === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionType(option.value as any)}
                        className="flex flex-col gap-1 h-auto py-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div>
                <h4 className="font-medium mb-2">Duration</h4>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="50">50 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cost Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <span className="text-lg font-semibold text-primary">
                    ${calculateCost().toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {duration} minutes • {sessionType} session
                </p>
              </div>

              {/* Book Button */}
              <Button
                className="w-full"
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime}
              >
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBooking;