import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, MoveUp, MoveDown, Download, Share, Eye } from 'lucide-react';
import { getHandout, saveHandout, ensureDefaults } from '@/features/handouts/store';
import { exportHandoutPDF } from '@/features/handouts/pdf';
import { useToast } from '@/hooks/use-toast';

const HandoutBuilderPage = () => {
  const { t } = useTranslation('handouts');
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [handout, setHandout] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    ensureDefaults();
    if (slug) {
      const existing = getHandout(slug);
      if (existing) {
        setHandout(existing);
      }
    }
  }, [slug]);

  if (!handout) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Handout hittades inte</p>
            <Button onClick={() => navigate('/handouts')}>
              Tillbaka till handouts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addSection = () => {
    setHandout({
      ...handout,
      sections: [
        ...handout.sections,
        { title: 'Ny sektion', bullets: [''] }
      ]
    });
  };

  const updateSection = (sectionIndex: number, field: string, value: any) => {
    const updated = { ...handout };
    if (field === 'title') {
      updated.sections[sectionIndex].title = value;
    } else if (field === 'bullets') {
      updated.sections[sectionIndex].bullets = value;
    }
    setHandout(updated);
  };

  const addBullet = (sectionIndex: number) => {
    const updated = { ...handout };
    updated.sections[sectionIndex].bullets.push('');
    setHandout(updated);
  };

  const updateBullet = (sectionIndex: number, bulletIndex: number, value: string) => {
    const updated = { ...handout };
    updated.sections[sectionIndex].bullets[bulletIndex] = value;
    setHandout(updated);
  };

  const removeBullet = (sectionIndex: number, bulletIndex: number) => {
    const updated = { ...handout };
    updated.sections[sectionIndex].bullets.splice(bulletIndex, 1);
    setHandout(updated);
  };

  const removeSection = (sectionIndex: number) => {
    const updated = { ...handout };
    updated.sections.splice(sectionIndex, 1);
    setHandout(updated);
  };

  const moveSection = (sectionIndex: number, direction: 'up' | 'down') => {
    const updated = { ...handout };
    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    
    if (newIndex >= 0 && newIndex < updated.sections.length) {
      [updated.sections[sectionIndex], updated.sections[newIndex]] = 
      [updated.sections[newIndex], updated.sections[sectionIndex]];
      setHandout(updated);
    }
  };

  const handleSave = () => {
    const saved = saveHandout(handout);
    setHandout(saved);
    toast({
      title: 'Sparat',
      description: t('addedJournal')
    });
  };

  const handleExportPDF = () => {
    exportHandoutPDF(handout);
  };

  const handleShare = () => {
    if (handout.shareToken) {
      const url = `${window.location.origin}/handouts/share/${handout.shareToken}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Länk kopierad",
        description: "Delbar länk har kopierats till urklipp"
      });
    }
  };

  if (isPreview) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <Button variant="outline" onClick={() => setIsPreview(false)}>
              Tillbaka till redigering
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {t('exportPdf')}
              </Button>
              <Button onClick={handleShare} variant="outline">
                <Share className="w-4 h-4 mr-2" />
                {t('shareLink')}
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-8 border rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-center">{handout.title}</h1>
            
            {handout.sections.map((section: any, sectionIndex: number) => (
              <div key={sectionIndex} className="mb-6">
                <h2 className="text-lg font-semibold mb-3 border-b pb-1">
                  {section.title}
                </h2>
                <div className="space-y-2">
                  {section.bullets.map((bullet: string, bulletIndex: number) => (
                    <div key={bulletIndex} className="flex items-start gap-2">
                      <div className="w-4 h-4 border border-gray-400 rounded-sm mt-1 flex-shrink-0" />
                      <span className="text-sm">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {handout.notes && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-medium mb-2">{t('notes')}:</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {handout.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{handout.title}</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsPreview(true)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              {t('preview')}
            </Button>
            <Button onClick={handleSave}>
              Spara
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {handout.sections.map((section: any, sectionIndex: number) => (
            <Card key={sectionIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                    className="text-lg font-medium border-none p-0 h-auto"
                    placeholder="Sektionsrubrik"
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSection(sectionIndex, 'up')}
                      disabled={sectionIndex === 0}
                    >
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveSection(sectionIndex, 'down')}
                      disabled={sectionIndex === handout.sections.length - 1}
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.bullets.map((bullet: string, bulletIndex: number) => (
                  <div key={bulletIndex} className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    <Input
                      value={bullet}
                      onChange={(e) => updateBullet(sectionIndex, bulletIndex, e.target.value)}
                      placeholder="Punkt..."
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeBullet(sectionIndex, bulletIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addBullet(sectionIndex)}
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till punkt
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addSection} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till sektion
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>{t('notes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={handout.notes || ''}
                onChange={(e) => setHandout({ ...handout, notes: e.target.value })}
                placeholder="Lägg till egna anteckningar..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HandoutBuilderPage;