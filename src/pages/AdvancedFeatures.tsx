import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PredictiveAIPanel from '@/components/PredictiveAIPanel';
import TranslationWidget from '@/components/TranslationWidget';
import ChildTeenMode from '@/components/ChildTeenMode';
import FamilyModePanel from '@/components/FamilyModePanel';
import { useTranslation } from 'react-i18next';
import { Brain, Languages, GamepadIcon, Users, Sparkles, Globe } from 'lucide-react';

const AdvancedFeatures: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">{t('advanced.title')}</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('advanced.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {t('advanced.predictiveAI')}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Languages className="w-3 h-3" />
              22 {t('settings.language')}s
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <GamepadIcon className="w-3 h-3" />
              {t('advanced.childMode')}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {t('advanced.familyMode')}
            </Badge>
          </div>
        </div>

        {/* Advanced Features Tabs */}
        <Tabs defaultValue="multilingual" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="multilingual" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Multilingual AI
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {t('advanced.predictiveAI')}
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('advanced.familyMode')}
            </TabsTrigger>
            <TabsTrigger value="child" className="flex items-center gap-2">
              <GamepadIcon className="w-4 h-4" />
              {t('advanced.childMode')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="multilingual" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Multilingual AI Experience
                </CardTitle>
                <CardDescription>
                  Complete 22-language support with culturally-aware AI coaching, real-time translation, and voice interaction
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <Globe className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Multilingual AI</h3>
                    <p className="text-muted-foreground max-w-md">
                      Advanced multilingual AI features are currently being developed for future releases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  {t('advanced.predictiveAI')} Insights
                </CardTitle>
                <CardDescription>
                  Advanced AI analyzes your patterns to predict and recommend next steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictiveAIPanel />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {t('advanced.familyMode')}
                  </CardTitle>
                  <CardDescription>
                    Tools for couples and families to work together on wellness
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FamilyModePanel />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    Family Translation
                  </CardTitle>
                  <CardDescription>
                    Real-time translation for multicultural families
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TranslationWidget context="session_notes" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="child" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GamepadIcon className="w-5 h-5 text-primary" />
                  {t('advanced.childMode')}
                </CardTitle>
                <CardDescription>
                  Gamified wellness activities designed for young minds with multilingual support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChildTeenMode />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedFeatures;