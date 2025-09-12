import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mic, Volume2, VolumeX, Send } from 'lucide-react'
import { streamAuri } from '@/features/auri/getAuriResponse'
import { speak, canSTT, startSTT } from '@/features/voice/voice'
import { addMemory, getAll as getMemories } from '@/features/memory/userMemory'
import { addAgenda } from '@/features/auri/agenda'
import AuriActionsBar from '@/features/auri/components/AuriActionsBar'
import AgendaPin from '@/features/auri/components/AgendaPin'
import type { AuriPlan } from '@/features/auri/actions'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AuriChatEnhanced() {
  const { t, i18n } = useTranslation(['auriPlus'])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<AuriPlan | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const stopSTTRef = useRef<(() => void) | null>(null)

  // Initialize with welcome message
  useEffect(() => {
    const memories = getMemories()
    let welcomeText = "Hej! Jag är Auri, din AI-coach. Hur mår du idag?"
    
    if (memories.length > 0) {
      welcomeText += `\n\nSenast pratade vi om: ${memories[0].summary}`
    }

    setMessages([{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date().toISOString()
    }])
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    // Import and use Auri gate for usage limits
    try {
      const { useAuriGate } = await import('@/features/subscription/gate')
      const gate = useAuriGate()
      const result = gate.beforeSend()
      if (!result.allowed) return // Show paywall modal, handled by gate
    } catch {}

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      await streamAuri(
        {
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          lang: i18n.language
        },
        (chunk: string) => {
          setMessages(prev => prev.map(m => 
            m.id === assistantMessage.id 
              ? { ...m, content: m.content + chunk }
              : m
          ))
        },
        (plan: AuriPlan) => {
          setCurrentPlan(plan)
          // Add bullets to agenda
          if (plan.bullets.length > 0) {
            addAgenda(plan.bullets)
          }
          // Add memory
          const summary = plan.bullets[0] || plan.question
          if (summary) {
            addMemory(summary, i18n.language)
          }
        }
      )
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (isListening) {
      stopSTTRef.current?.()
      setIsListening(false)
      return
    }

    if (!canSTT()) return

    setIsListening(true)
    const stopFn = startSTT(
      i18n.language,
      (text) => {
        setInput(text)
        setIsListening(false)
      },
      () => setIsListening(false)
    )
    stopSTTRef.current = stopFn
  }

  const handleSpeak = () => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
    if (lastAssistant) {
      speak(lastAssistant.content, i18n.language)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with voice controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold">Auri</h2>
          <p className="text-sm text-muted-foreground">Din AI-coach</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeak}
            disabled={messages.filter(m => m.role === 'assistant').length === 0}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          {canSTT() && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={isListening ? 'bg-red-100' : ''}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Agenda Pin */}
      <AgendaPin onInsertText={(text) => setInput(text)} />

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {isLoading && message.role === 'assistant' && !message.content && (
                  <p className="text-sm italic opacity-70">{t('listening')}</p>
                )}
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Actions Bar */}
      <AuriActionsBar plan={currentPlan} onQuickReply={handleSend} />

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? t('listening') : "Skriv ditt meddelande..."}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading || isListening}
            className="flex-1"
          />
          <Button 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}