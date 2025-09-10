import { useParams, useNavigate } from 'react-router-dom'
import { SCENARIOS } from '@/features/auri/roleplays/scenarios'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { motion } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { streamAuriResponse } from '@/features/auri/getAuriResponse'
import { Brain, Star } from 'lucide-react'

export default function RoleplayRun() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation(['roleplay'])
  const { toast } = useToast()
  const scenario = SCENARIOS.find(x => x.id === id)
  const [step, setStep] = React.useState(0)
  const [startTime] = React.useState(Date.now())
  const [coachResponse, setCoachResponse] = React.useState('')
  const [isCoachLoading, setIsCoachLoading] = React.useState(false)
  const [rating, setRating] = React.useState([5])
  
  const handleCoachAssist = async () => {
    if (!scenario) return
    setIsCoachLoading(true)
    setCoachResponse('')
    
    const context = `Roleplay scenario: ${getLocalizedText(scenario.title)}. Current step: ${getLocalizedText(currentStep.goal)}`
    
    try {
      await streamAuriResponse({
        messages: [{ role: 'user', content: `Help me with this roleplay step: ${context}` }],
        lang: i18n.language
      }, (token) => {
        setCoachResponse(prev => prev + token)
      })
    } catch (error) {
      console.error('Coach assist error:', error)
      toast({ title: 'Coach assist failed', variant: 'destructive' })
    } finally {
      setIsCoachLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!scenario) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('roleplay_sessions').insert({
          user_id: session.user.id,
          scenario_type: scenario.id,
          scenario_title: getLocalizedText(scenario.title),
          duration_minutes: Math.round((Date.now() - startTime) / 1000 / 60),
          confidence_rating: rating[0],
          feedback_data: { completed_steps: step + 1, total_steps: scenario.steps.length }
        })
      }
      
      toast({ title: t('sessionSaved', 'Session saved!') })
    } catch (error) {
      console.error('Save session error:', error)
    }
    
    navigate('/roleplay')
  }

  if (!scenario) {
    return (
      <div className="p-4">
        <p>Scenario not found</p>
        <Button onClick={() => navigate('/roleplay')}>Back to scenarios</Button>
      </div>
    )
  }
  
  const currentStep = scenario.steps[step]
  const getLocalizedText = (obj: Record<string, string>) => obj[i18n.language] || obj.en || ''
  
  return (
    <motion.div 
      className="space-y-4 p-4 pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-semibold">{getLocalizedText(scenario.title)}</h1>
      
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              {t('hint', 'Tips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{getLocalizedText(currentStep.goal)}</div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          onClick={handleCoachAssist}
          disabled={isCoachLoading}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isCoachLoading ? t('coaching', 'Coaching...') : t('coachAssist', 'Coach Assist')}
        </Button>
      </div>

      {coachResponse && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {t('coachResponse', 'Coach Response')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm">{coachResponse}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            {t('prev', 'Tillbaka')}
          </Button>
        )}
        {step < scenario.steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            {t('next', 'Nästa')}
          </Button>
        ) : (
          <div className="space-y-4 w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('rateExperience', 'Rate your experience')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Slider
                    value={rating}
                    onValueChange={setRating}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-muted-foreground">
                    {rating[0]}/10
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleFinish} className="w-full">
              {t('finish', 'Avsluta')}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}