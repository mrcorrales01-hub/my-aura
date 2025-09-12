import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Play, Download, Upload, Share, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { listCustom, saveCustom, deleteCustom, type CustomRoleplay } from '@/features/roleplay/customStore'

export default function RoleplayStudioPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('roleplayStudio')
  const { toast } = useToast()
  const [scripts, setScripts] = useState<CustomRoleplay[]>(listCustom())
  const [editing, setEditing] = useState<CustomRoleplay | null>(null)
  const [form, setForm] = useState({ name: '', steps: [''] })

  const handleSave = () => {
    if (!form.name.trim() || form.steps.filter(s => s.trim()).length === 0) {
      toast({ title: 'Fyll i namn och minst ett steg', variant: 'destructive' })
      return
    }

    const saved = saveCustom({
      name: form.name.trim(),
      steps: form.steps.filter(s => s.trim())
    })

    setScripts(listCustom())
    setForm({ name: '', steps: [''] })
    setEditing(null)
    toast({ title: 'Manus sparat!' })
  }

  const handleDelete = (id: string) => {
    deleteCustom(id)
    setScripts(listCustom())
    toast({ title: 'Manus borttaget' })
  }

  const handleExport = (script: CustomRoleplay) => {
    const data = JSON.stringify(script, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roleplay-${script.name.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            const imported = saveCustom({
              name: data.name + ' (importerat)',
              steps: data.steps
            })
            setScripts(listCustom())
            toast({ title: 'Manus importerat!' })
          } catch {
            toast({ title: 'Felaktigt filformat', variant: 'destructive' })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleShare = (script: CustomRoleplay) => {
    const url = `${window.location.origin}/roleplay/share/${script.shareToken}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Länk kopierad!' })
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <div className="flex gap-2">
          <Button onClick={handleImport} variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {t('import')}
          </Button>
          <Button onClick={() => setEditing({} as CustomRoleplay)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('new')}
          </Button>
        </div>
      </div>

      {/* Editor */}
      {editing && (
        <Card className="p-4 space-y-4">
          <Input
            placeholder={t('name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          
          <div className="space-y-2">
            {form.steps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <Textarea
                  placeholder={`Steg ${i + 1}`}
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...form.steps]
                    newSteps[i] = e.target.value
                    setForm({ ...form, steps: newSteps })
                  }}
                  className="min-h-[80px]"
                />
                {form.steps.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSteps = form.steps.filter((_, idx) => idx !== i)
                      setForm({ ...form, steps: newSteps })
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setForm({ ...form, steps: [...form.steps, ''] })}
            >
              {t('addStep')}
            </Button>
            <Button onClick={handleSave}>
              {t('save')}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Avbryt
            </Button>
          </div>
        </Card>
      )}

      {/* Scripts List */}
      {scripts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('empty')}
        </div>
      ) : (
        <div className="grid gap-4">
          {scripts.map((script) => (
            <Card key={script.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{script.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {script.steps.length} steg • {new Date(script.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/roleplay/custom/${script.id}`)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(script)}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(script)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(script.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}