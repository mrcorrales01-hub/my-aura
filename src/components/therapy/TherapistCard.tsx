import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Globe, BookOpen } from 'lucide-react';
import { TherapistMarketplaceData } from '@/hooks/useTherapists';

interface TherapistCardProps {
  therapist: TherapistMarketplaceData;
  onBookSession: (therapistId: string) => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onBookSession }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-therapist.jpg" alt={therapist.display_name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(therapist.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{therapist.display_name}</CardTitle>
            <p className="text-xs text-muted-foreground">{therapist.professional_title}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {therapist.average_rating?.toFixed(1) || '4.8'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {therapist.years_experience} years
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              ${therapist.hourly_rate}/hr
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Specializations
          </h4>
          <div className="flex flex-wrap gap-1">
            {therapist.specializations.map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Languages
          </h4>
          <div className="flex flex-wrap gap-1">
            {therapist.languages.map((lang, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {lang.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {therapist.bio_preview && (
          <div>
            <h4 className="font-medium mb-2">About</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {therapist.bio_preview}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Available in {therapist.timezone}</span>
        </div>

        <div className="pt-2">
          <Button 
            className="w-full" 
            onClick={() => onBookSession(therapist.anonymous_id)}
            disabled={!therapist.is_available}
          >
            Book Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistCard;