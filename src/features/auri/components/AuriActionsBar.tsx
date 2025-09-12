import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import type { AuriPlan } from '../actions'

interface AuriActionsBarProps {
  plan: AuriPlan | null
  onQuickReply?: (text: string) => void
}

export default function AuriActionsBar({ plan, onQuickReply }: AuriActionsBarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('auriPlus')
  const { toast } = useToast()

  if (!plan) return null

  const handleAction = async (action: any) => {
    switch (action.type) {
      case 'nav':
        navigate(action.to)
        break
      case 'start_exercise':
        if (action.id === 'breath_478') navigate('/cards?focus=breath')
        else if (action.id === 'ground_54321') navigate('/cards?focus=ground')
        else navigate('/cards')
        break
      case 'add_plan':
        // Add to localStorage plan
        const plans = JSON.parse(localStorage.getItem('aura.smart.plan') || '[]')
        plans.push({
          id: crypto.randomUUID(),
          title: action.title,
          createdAt: new Date().toISOString(),
          type: 'habit'
        })
        localStorage.setItem('aura.smart.plan', JSON.stringify(plans))
        toast({ title: t('addedPlan') })
        break
      case 'log_journal':
        // Add to localStorage journal
        const entries = JSON.parse(localStorage.getItem('aura.journal.entries') || '[]')
        entries.unshift({
          id: crypto.randomUUID(),
          title: action.title,
          content: action.content,
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('aura.journal.entries', JSON.stringify(entries))
        toast({ title: t('logged') })
        break
      case 'open_roleplay':
        navigate(`/roleplay/${action.id}`)
        break
    }
  }

  return (
    <div className="space-y-3 p-4 border-t bg-muted/5">
      {plan.actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t('actions')}</p>
          <div className="flex flex-wrap gap-2">
            {plan.actions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleAction(action)}
                className="text-xs"
              >
                {'label' in action ? action.label : action.type}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {plan.quickReplies && plan.quickReplies.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {plan.quickReplies.map((reply, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 text-xs"
                onClick={() => onQuickReply?.(reply)}
              >
                {reply}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}