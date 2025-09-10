import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface BreathingPacerProps {
  className?: string
}

export const BreathingPacer = ({ className }: BreathingPacerProps) => {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [seconds, setSeconds] = useState(0)
  
  // 4-7-8 breathing pattern (customizable)
  const pattern = { inhale: 4, hold: 7, exhale: 8 }
  const totalCycle = pattern.inhale + pattern.hold + pattern.exhale

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setSeconds(prev => {
        const newSeconds = (prev + 1) % totalCycle
        
        if (newSeconds < pattern.inhale) {
          setPhase('inhale')
        } else if (newSeconds < pattern.inhale + pattern.hold) {
          setPhase('hold')
        } else {
          setPhase('exhale')
        }
        
        return newSeconds
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, totalCycle, pattern.inhale, pattern.hold])

  const getPhaseProgress = () => {
    if (phase === 'inhale') {
      return seconds / pattern.inhale
    } else if (phase === 'hold') {
      return (seconds - pattern.inhale) / pattern.hold
    } else {
      return (seconds - pattern.inhale - pattern.hold) / pattern.exhale
    }
  }

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In'
      case 'hold': return 'Hold'
      case 'exhale': return 'Breathe Out'
    }
  }

  const getPhaseCount = () => {
    if (phase === 'inhale') {
      return Math.ceil((1 - getPhaseProgress()) * pattern.inhale)
    } else if (phase === 'hold') {
      return Math.ceil((1 - getPhaseProgress()) * pattern.hold)
    } else {
      return Math.ceil((1 - getPhaseProgress()) * pattern.exhale)
    }
  }

  const reset = () => {
    setIsActive(false)
    setSeconds(0)
    setPhase('inhale')
  }

  const scale = isActive ? 0.7 + (getPhaseProgress() * 0.6) : 0.7

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Breathing Exercise</CardTitle>
        <p className="text-sm text-muted-foreground">4-7-8 breathing pattern</p>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {/* Breathing Circle */}
        <div className="relative w-48 h-48 mx-auto">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/20 bg-primary/5"
            animate={{ 
              scale: scale,
              borderColor: phase === 'inhale' ? 'hsl(var(--primary))' : 
                          phase === 'hold' ? 'hsl(var(--secondary))' : 
                          'hsl(var(--destructive))'
            }}
            transition={{ 
              duration: isActive ? 0.8 : 0.3,
              ease: "easeInOut"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-semibold">{getPhaseText()}</div>
              {isActive && (
                <div className="text-3xl font-bold text-primary">
                  {getPhaseCount()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setIsActive(!isActive)}
            variant={isActive ? "secondary" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Phase indicator */}
        {isActive && (
          <div className="text-sm text-muted-foreground">
            Phase: {phase} • Cycle progress: {Math.round((seconds / totalCycle) * 100)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}