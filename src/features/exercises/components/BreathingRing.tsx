import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BreathingRingProps {
  onComplete?: () => void;
  duration?: number; // in seconds
  autoStart?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const phases = ['inhale', 'hold1', 'exhale', 'hold2'] as const;
type Phase = typeof phases[number];

export const BreathingRing: React.FC<BreathingRingProps> = ({
  onComplete,
  duration = 60,
  autoStart = false,
  size = 'md'
}) => {
  const { t } = useTranslation('exercises');
  const [isActive, setIsActive] = useState(autoStart);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const announcementRef = useRef<string>('');

  const phaseDurations = { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
  const ringSize = size === 'sm' ? 120 : size === 'md' ? 160 : 200;
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress based on current phase
  const phaseProgress = phaseTime / phaseDurations[currentPhase];
  const strokeDashoffset = circumference * (1 - phaseProgress);

  // Vibration support (mobile only)
  const vibrate = (duration: number) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setPhaseTime(prev => {
          const nextTime = prev + 0.1;
          const phaseDuration = phaseDurations[currentPhase];
          
          if (nextTime >= phaseDuration) {
            // Phase complete - move to next phase
            const currentIndex = phases.indexOf(currentPhase);
            const nextPhase = phases[(currentIndex + 1) % phases.length];
            setCurrentPhase(nextPhase);
            vibrate(60); // Subtle vibration on phase change
            return 0;
          }
          return nextTime;
        });

        setTotalTime(prev => {
          const newTotal = prev + 0.1;
          if (newTotal >= duration) {
            setIsActive(false);
            onComplete?.();
            return 0;
          }
          return newTotal;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase, duration, onComplete]);

  // Update announcement for screen readers
  useEffect(() => {
    announcementRef.current = t(`breathing.phases.${currentPhase}`);
  }, [currentPhase, t]);

  const handleStart = () => {
    setIsActive(true);
    setTotalTime(0);
    setPhaseTime(0);
    setCurrentPhase('inhale');
  };

  const handlePause = () => {
    setIsActive(!isActive);
  };

  const handleStop = () => {
    setIsActive(false);
    setTotalTime(0);
    setPhaseTime(0);
    setCurrentPhase('inhale');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Breathing Ring SVG */}
        <div className="relative">
          <svg width={ringSize} height={ringSize} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted-foreground/20"
            />
            {/* Progress circle */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                currentPhase === 'inhale' ? 'text-blue-500' :
                currentPhase === 'hold1' ? 'text-purple-500' :
                currentPhase === 'exhale' ? 'text-green-500' :
                'text-orange-500'
              }`}
              style={{
                transform: 'rotate(0deg)',
                transformOrigin: `${ringSize / 2}px ${ringSize / 2}px`,
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-2xl font-bold transition-colors ${
              currentPhase === 'inhale' ? 'text-blue-500' :
              currentPhase === 'hold1' ? 'text-purple-500' :
              currentPhase === 'exhale' ? 'text-green-500' :
              'text-orange-500'
            }`}>
              {Math.ceil(phaseDurations[currentPhase] - phaseTime)}
            </div>
            <div className="text-sm text-muted-foreground">
              {t(`breathing.phases.${currentPhase}`)}
            </div>
          </div>
        </div>

        {/* Screen reader announcement */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {isActive ? announcementRef.current : ''}
        </div>

        {/* Phase indicator */}
        <div className="text-sm text-muted-foreground">
          {t('breathing.progress')}: {formatTime(totalTime)} / {formatTime(duration)}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {!isActive && totalTime === 0 ? (
            <Button onClick={handleStart} size="sm">
              <Play className="w-4 h-4 mr-2" />
              {t('breathing.start')}
            </Button>
          ) : (
            <>
              <Button onClick={handlePause} variant="outline" size="sm">
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button onClick={handleStop} variant="outline" size="sm">
                <Square className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};