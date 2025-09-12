import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pin, PinOff, ChevronDown, ChevronUp } from 'lucide-react'
import { getAgenda } from '../agenda'

interface AgendaPinProps {
  onInsertText?: (text: string) => void
}

export default function AgendaPin({ onInsertText }: AgendaPinProps) {
  const { t } = useTranslation('auriPlus')
  const [pinned, setPinned] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const agenda = getAgenda()

  if (agenda.length === 0) return null

  const visibleItems = expanded ? agenda.slice(0, 3) : agenda.slice(0, 1)

  return (
    <div className="bg-muted/30 border-b px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{t('agenda')}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPinned(!pinned)}
            className="h-6 w-6 p-0"
          >
            {pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </Button>
        </div>
        {agenda.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-6 w-6 p-0"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>
      
      <div className="space-y-1">
        {visibleItems.map((item) => (
          <Badge
            key={item.id}
            variant="outline"
            className="cursor-pointer hover:bg-secondary/80 text-xs block w-fit"
            onClick={() => onInsertText?.(`Vi fokuserar på: ${item.text}`)}
          >
            {item.text}
          </Badge>
        ))}
      </div>
    </div>
  )
}