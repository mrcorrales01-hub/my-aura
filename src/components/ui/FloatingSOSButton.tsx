import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function FloatingSOSButton() {
  const navigate = useNavigate()
  const [pressStart, setPressStart] = useState<number | null>(null)
  const [isLongPressing, setIsLongPressing] = useState(false)

  const handlePressStart = () => {
    setPressStart(Date.now())
    setIsLongPressing(true)
  }

  const handlePressEnd = () => {
    if (pressStart && Date.now() - pressStart >= 800) {
      // Long press detected
      navigate('/panic')
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }
    }
    setPressStart(null)
    setIsLongPressing(false)
  }

  useEffect(() => {
    if (!pressStart) return
    
    const timer = setTimeout(() => {
      if (isLongPressing) {
        navigate('/panic')
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200])
        }
        setPressStart(null)
        setIsLongPressing(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [pressStart, isLongPressing, navigate])

  return (
    <Button
      size="icon"
      variant="destructive"
      className={`fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg transition-all ${
        isLongPressing ? 'scale-110 bg-red-600' : ''
      }`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      title="Håll ned för panikläge"
    >
      <AlertTriangle className="h-6 w-6" />
    </Button>
  )
}