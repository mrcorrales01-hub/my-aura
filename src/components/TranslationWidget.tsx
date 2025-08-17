import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Volume2, 
  History,
  Globe
} from 'lucide-react';

interface TranslationWidgetProps {
  context?: 'chat' | 'video' | 'session_notes';
  onTranslation?: (translation: any) => void;
}

const TranslationWidget: React.FC<TranslationWidgetProps> = ({ 
  context = 'chat', 
  onTranslation 
}) => {
  const {
    loading,
    history,
    translateText,
    getSupportedLanguages,
    getLanguageName,
    isRTL
  } = useTranslation();

  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [currentTranslation, setCurrentTranslation] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);

  const supportedLanguages = getSupportedLanguages();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    const result = await translateText(inputText, targetLanguage, sourceLanguage, context);
    if (result) {
      setCurrentTranslation(result);
      onTranslation?.(result);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const speakText = (text: string, languageCode: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      speechSynthesis.speak(utterance);
    }
  };

  const contextLabels = {
    chat: 'Chat Translation',
    video: 'Video Call Translation',
    session_notes: 'Session Notes Translation'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-6 h-6 text-primary" />
            {contextLabels[context]}
          </CardTitle>
          <CardDescription>
            Real-time translation supporting {Object.keys(supportedLanguages).length} languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Detect language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {Object.entries(supportedLanguages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwapLanguages}
                disabled={sourceLanguage === 'auto'}
                className="rounded-full w-10 h-10"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(supportedLanguages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Translation Input/Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Original Text
                {sourceLanguage !== 'auto' && (
                  <Badge variant="outline" className="ml-2">
                    {getLanguageName(sourceLanguage)}
                  </Badge>
                )}
              </label>
              <div className="relative">
                <Textarea
                  placeholder="Enter text to translate..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`min-h-[120px] ${isRTL(sourceLanguage) ? 'text-right' : ''}`}
                  dir={isRTL(sourceLanguage) ? 'rtl' : 'ltr'}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {inputText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(inputText, sourceLanguage === 'auto' ? 'en' : sourceLanguage)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Translation
                <Badge variant="outline" className="ml-2">
                  {getLanguageName(targetLanguage)}
                </Badge>
              </label>
              <div className="relative">
                <Textarea
                  placeholder="Translation will appear here..."
                  value={currentTranslation?.translatedText || ''}
                  readOnly
                  className={`min-h-[120px] bg-muted/50 ${isRTL(targetLanguage) ? 'text-right' : ''}`}
                  dir={isRTL(targetLanguage) ? 'rtl' : 'ltr'}
                />
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {currentTranslation?.translatedText && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(currentTranslation.translatedText)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(currentTranslation.translatedText, targetLanguage)}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleTranslate} 
              disabled={!inputText.trim() || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Translating...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </div>

          {/* Detection Info */}
          {currentTranslation && sourceLanguage === 'auto' && (
            <div className="text-sm text-muted-foreground">
              Detected language: {getLanguageName(currentTranslation.sourceLanguage)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Translation History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Translations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No translation history yet
              </p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((translation, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getLanguageName(translation.sourceLanguage)}
                        </Badge>
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {getLanguageName(translation.targetLanguage)}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {translation.context}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className={isRTL(translation.sourceLanguage) ? 'text-right' : ''}>
                        <p className="font-medium">Original:</p>
                        <p className="text-muted-foreground">
                          {translation.originalText.length > 100 
                            ? translation.originalText.substring(0, 100) + '...'
                            : translation.originalText
                          }
                        </p>
                      </div>
                      <div className={isRTL(translation.targetLanguage) ? 'text-right' : ''}>
                        <p className="font-medium">Translation:</p>
                        <p className="text-muted-foreground">
                          {translation.translatedText.length > 100 
                            ? translation.translatedText.substring(0, 100) + '...'
                            : translation.translatedText
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranslationWidget;