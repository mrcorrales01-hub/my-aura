import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

export const MoodQuickCheck = () => {
  const { t } = useTranslation(['home', 'common'])
  const { toast } = useToast()

  const handleRate = async (score: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: t('common:error', 'Error'),
          description: 'Please sign in first',
          variant: 'destructive'
        })
        return
      }

      await supabase.from('moods').insert({
        user_id: session.user.id,
        score: score,
        created_at: new Date().toISOString()
      })

      toast({
        title: t('home:saved', 'Sparat!'),
        description: `Mood ${score}/10 saved`,
      })
    } catch (error) {
      console.error('Save mood error:', error)
      toast({
        title: t('common:error', 'Error'),
        description: t('home:errorSave', 'Could not save'),
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t('home:quickCheckin', 'Quick check-in')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">How are you feeling right now? (1-10)</p>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <motion.div key={num} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRate(num)}
                className="w-full"
              >
                {num}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}