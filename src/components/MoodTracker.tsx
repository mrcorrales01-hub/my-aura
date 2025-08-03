import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Heart, Zap, Cloud } from "lucide-react";

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const moods = [
    { id: 'amazing', label: 'Fantastisk', icon: Zap, color: 'coral', description: 'Jag känner mig energisk och lycklig!' },
    { id: 'good', label: 'Bra', icon: Smile, color: 'wellness-primary', description: 'En bra dag med positiva känslor' },
    { id: 'neutral', label: 'Okej', icon: Meh, color: 'calm', description: 'Känner mig ganska neutral idag' },
    { id: 'low', label: 'Låg', icon: Cloud, color: 'lavender', description: 'Lite nedstämd, men det är okej' },
    { id: 'difficult', label: 'Svår', icon: Frown, color: 'muted-foreground', description: 'En utmanande dag, behöver extra omsorg' }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Hur mår du <span className="bg-gradient-primary bg-clip-text text-transparent">idag?</span>
          </h2>
          <p className="text-xl text-foreground/70">
            Ta en stund att checka in med dig själv. Dina känslor är viktiga.
          </p>
        </div>

        <Card className="p-8 bg-card/90 backdrop-blur-sm shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {moods.map((mood) => {
              const IconComponent = mood.icon;
              const isSelected = selectedMood === mood.id;
              
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    isSelected 
                      ? 'border-wellness-primary bg-wellness-primary/10 shadow-wellness' 
                      : 'border-border hover:border-wellness-primary/50 hover:bg-wellness-primary/5'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-wellness-primary' : 'bg-muted'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      isSelected ? 'text-white' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <p className={`font-medium ${
                    isSelected ? 'text-wellness-primary' : 'text-foreground'
                  }`}>
                    {mood.label}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <div className="text-center bg-wellness-primary/5 rounded-xl p-6 mb-6 animate-in slide-in-from-bottom-4">
              <p className="text-foreground/80 mb-4">
                {moods.find(m => m.id === selectedMood)?.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-wellness-primary">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">Vi är här för dig</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="wellness" 
              size="lg" 
              disabled={!selectedMood}
              className="disabled:opacity-50"
            >
              Spara min känsla
            </Button>
            <Button variant="outline" size="lg">
              Se min historik
            </Button>
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-foreground/60">
            💡 <strong>Tips:</strong> Att checka in dagligen hjälper dig att förstå dina känslomönster bättre
          </p>
        </div>
      </div>
    </section>
  );
};

export default MoodTracker;