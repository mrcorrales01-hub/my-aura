import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { X, Phone, Wind, Hand } from 'lucide-react'

export default function PanicPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('panic')
  const [breathCycle, setBreathCycle] = useState('in')
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setBreathCycle(prev => {
        if (prev === 'in') return 'hold1'
        if (prev === 'hold1') return 'out'
        if (prev === 'out') return 'hold2'
        setCycleCount(c => c + 1)
        // Vibrate on cycle complete if supported
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200])
        }
        return 'in'
      })
    }, 4000) // 4-4-4-4 breathing

    return () => clearInterval(timer)
  }, [])

  const getBreathText = () => {
    switch (breathCycle) {
      case 'in': return 'Andas in (4s)'
      case 'hold1': return 'Håll (4s)'
      case 'out': return 'Andas ut (4s)'
      case 'hold2': return 'Håll (4s)'
      default: return 'Andas'
    }
  }

  const getBreathColor = () => {
    switch (breathCycle) {
      case 'in': return 'bg-blue-500'
      case 'hold1': return 'bg-yellow-500'
      case 'out': return 'bg-green-500'
      case 'hold2': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4 pb-24">
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="lg"
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 h-12 w-12 rounded-full"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>

      {/* Breathing Ring */}
      <div className="relative mb-12">
        <div className={`w-48 h-48 rounded-full ${getBreathColor()} transition-all duration-1000 flex items-center justify-center animate-pulse`}>
          <Wind className="h-16 w-16 text-white" />
        </div>
        <p className="text-center mt-4 text-xl font-medium">{getBreathText()}</p>
        <p className="text-center text-sm text-muted-foreground">Cykler: {cycleCount}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/cards?focus=ground')}
          className="h-16 flex-col gap-2"
        >
          <Hand className="h-6 w-6" />
          <span>{t('ground')}</span>
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={() => window.open('tel:112')}
          className="h-16 flex-col gap-2"
        >
          <Phone className="h-6 w-6" />
          <span>{t('call')} 112</span>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/crisis/help')}
          className="h-16 col-span-2"
        >
          {t('openResources')}
        </Button>
      </div>
    </div>
  )
}