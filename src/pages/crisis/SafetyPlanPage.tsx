import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Save, 
  Download, 
  Share2, 
  BookOpen,
  Calendar
} from 'lucide-react';
import { SafetyPlan, SafetyContact } from '@/features/crisis/types';
import { getPlan, savePlan, addToJournal } from '@/features/crisis/store';
import { addGoalToSmartPlan } from '@/features/plan/smartPlan';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getDisplayName } from '@/lib/profileName';

export default function SafetyPlanPage() {
  const { t } = useTranslation('crisis');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plan, setPlan] = useState<SafetyPlan>(() => {
    const existing = getPlan();
    return existing || {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lang: 'sv',
      name: getDisplayName(user?.user_metadata),
      signals: [],
      coping: [],
      people: [],
      places: [],
      reasons: [],
      removeMeans: [],
      professionals: [],
      checkinEveryMin: 60,
      remindersOn: false
    };
  });

  const [newInputs, setNewInputs] = useState<Record<string, string>>({
    signal: '',
    coping: '',
    place: '',
    reason: '',
    means: '',
    personName: '',
    personPhone: '',
    personEmail: '',
    profName: '',
    profPhone: '',
    profEmail: ''
  });

  // Setup reminder system
  useEffect(() => {
    if (plan.remindersOn && plan.checkinEveryMin > 0) {
      const interval = setInterval(() => {
        // Show check-in prompt
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('My Aura – check-in', {
            body: t('checkInPrompt'),
            icon: '/favicon.ico'
          });
        } else {
          toast({ 
            title: 'Check-in påminnelse',
            description: t('checkInPrompt')
          });
        }
      }, plan.checkinEveryMin * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [plan.remindersOn, plan.checkinEveryMin, t, toast]);

  const handleSave = () => {
    const savedPlan = savePlan(plan);
    setPlan(savedPlan);
    toast({ title: t('planSaved') });
  };

  const handleExportPdf = () => {
    import('@/features/crisis/pdf').then(({ createSafetyPlanPdf }) => {
      createSafetyPlanPdf(plan);
      toast({ title: 'PDF exporterad' });
    });
  };

  const handleCopyShareLink = async () => {
    if (plan.shareToken) {
      const url = `${window.location.origin}/crisis/share/${plan.shareToken}`;
      await navigator.clipboard.writeText(url);
      toast({ title: t('copySuccess') });
    }
  };

  const handleAddToJournal = async () => {
    await addToJournal(plan);
    toast({ title: t('addedJournal') });
  };

  const handleAddToWeeklyPlan = () => {
    // Add 2-3 actions based on plan content
    const actions = [];
    if (plan.removeMeans.length > 0) {
      actions.push('Ta bort tillgång till medel (säkerhetsplan)');
    }
    if (plan.coping.length > 0) {
      actions.push(`Öva ${plan.coping[0]} dagligen`);
    }
    if (plan.people.length > 0) {
      actions.push('Kontakta en trygg person varje dag');
    }
    
    actions.forEach(action => addGoalToSmartPlan(action));
    toast({ title: t('addedPlan') });
  };

  const addToSection = (section: keyof SafetyPlan, inputKey: string, value?: any) => {
    if (section === 'people' || section === 'professionals') {
      const newContact: SafetyContact = {
        name: newInputs.personName || newInputs.profName,
        phone: newInputs.personPhone || newInputs.profPhone,
        email: newInputs.personEmail || newInputs.profEmail
      };
      
      if (newContact.name) {
        setPlan(prev => ({
          ...prev,
          [section]: [...(prev[section] as SafetyContact[]), newContact]
        }));
        
        // Clear inputs
        const prefix = section === 'people' ? 'person' : 'prof';
        setNewInputs(prev => ({
          ...prev,
          [`${prefix}Name`]: '',
          [`${prefix}Phone`]: '',
          [`${prefix}Email`]: ''
        }));
      }
    } else if (Array.isArray(plan[section])) {
      const inputValue = newInputs[inputKey];
      if (inputValue.trim()) {
        setPlan(prev => ({
          ...prev,
          [section]: [...(prev[section] as string[]), inputValue.trim()]
        }));
        setNewInputs(prev => ({ ...prev, [inputKey]: '' }));
      }
    }
  };

  const removeFromSection = (section: keyof SafetyPlan, index: number) => {
    setPlan(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== index)
    }));
  };

  const renderStringSection = (
    sectionKey: keyof SafetyPlan,
    inputKey: string,
    titleKey: string,
    addKey: string,
    placeholder: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {(plan[sectionKey] as string[]).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm flex-1">{item}</span>
              <Button
                onClick={() => removeFromSection(sectionKey, index)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={newInputs[inputKey]}
            onChange={(e) => setNewInputs(prev => ({ ...prev, [inputKey]: e.target.value }))}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button
            onClick={() => addToSection(sectionKey, inputKey)}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactSection = (
    sectionKey: 'people' | 'professionals',
    titleKey: string,
    namePrefix: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t(titleKey)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {(plan[sectionKey] as SafetyContact[]).map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
              <div className="flex-1">
                <div className="font-medium text-sm">{contact.name}</div>
                {contact.phone && (
                  <div className="text-xs text-muted-foreground">
                    Tel: {contact.phone}
                  </div>
                )}
                {contact.email && (
                  <div className="text-xs text-muted-foreground">
                    Email: {contact.email}
                  </div>
                )}
              </div>
              <Button
                onClick={() => removeFromSection(sectionKey, index)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 border-t pt-3">
          <Input
            value={newInputs[`${namePrefix}Name`]}
            onChange={(e) => setNewInputs(prev => ({ ...prev, [`${namePrefix}Name`]: e.target.value }))}
            placeholder={t('name')}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={newInputs[`${namePrefix}Phone`]}
              onChange={(e) => setNewInputs(prev => ({ ...prev, [`${namePrefix}Phone`]: e.target.value }))}
              placeholder={t('phone')}
              type="tel"
            />
            <Input
              value={newInputs[`${namePrefix}Email`]}
              onChange={(e) => setNewInputs(prev => ({ ...prev, [`${namePrefix}Email`]: e.target.value }))}
              placeholder={t('email')}
              type="email"
            />
          </div>
          <Button
            onClick={() => addToSection(sectionKey, `${namePrefix}Name`)}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {sectionKey === 'people' ? t('addPerson') : t('addProfessional')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/crisis')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{t('planTitle')}</h1>
          </div>

          {/* Name */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>{t('name')}</Label>
                <Input
                  value={plan.name}
                  onChange={(e) => setPlan(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mitt namn"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {renderStringSection('signals', 'signal', 'signals', 'addSignal', 'T.ex. isolation, sömnlöshet, hopplöshet...')}
          
          {renderStringSection('coping', 'coping', 'coping', 'addCoping', 'T.ex. djupandning, musik, promenad...')}
          
          {renderContactSection('people', 'people', 'person')}
          
          {renderStringSection('places', 'place', 'places', 'addPlace', 'T.ex. bibliotek, park, kafé...')}
          
          {renderStringSection('reasons', 'reason', 'reasons', 'addReason', 'T.ex. familj, husdjur, framtidsplaner...')}
          
          {renderStringSection('removeMeans', 'means', 'removeMeans', 'addMeans', 'T.ex. mediciner, verktyg, alkohol...')}
          
          {renderContactSection('professionals', 'professionals', 'prof')}

          {/* Check-in Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('checkins')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t('enableReminders')}</Label>
                <Switch
                  checked={plan.remindersOn}
                  onCheckedChange={(checked) => setPlan(prev => ({ ...prev, remindersOn: checked }))}
                />
              </div>
              
              {plan.remindersOn && (
                <div className="space-y-2">
                  <Label>{t('every')} {plan.checkinEveryMin} {t('minutes')}</Label>
                  <Input
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={plan.checkinEveryMin}
                    onChange={(e) => setPlan(prev => ({ 
                      ...prev, 
                      checkinEveryMin: parseInt(e.target.value) || 60 
                    }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleExportPdf} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t('exportPdf')}
              </Button>
              
              <Button onClick={handleCopyShareLink} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                {t('shareLink')}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleAddToJournal} variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('addToJournal')}
              </Button>
              
              <Button onClick={handleAddToWeeklyPlan} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                {t('addToPlan')}
              </Button>
            </div>
          </div>

          {/* Share Notice */}
          {plan.shareToken && (
            <div className="p-3 bg-muted rounded text-xs text-muted-foreground">
              {t('shareNotice')}
            </div>
          )}

          {/* Consent */}
          <div className="p-3 bg-muted rounded">
            <p className="text-xs text-muted-foreground">
              {t('consent')}
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}