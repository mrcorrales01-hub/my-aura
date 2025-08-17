import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePredictiveAI } from '@/hooks/usePredictiveAI';
import { Brain, Target, Activity, TrendingUp, Check, X, Sparkles } from 'lucide-react';

const PredictiveAIPanel: React.FC = () => {
  const {
    predictions,
    loading,
    generating,
    generatePredictions,
    updatePredictionStatus,
    getHighConfidencePredictions
  } = usePredictiveAI();

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'therapy_step':
        return <Target className="w-4 h-4" />;
      case 'exercise':
        return <Activity className="w-4 h-4" />;
      case 'mood_forecast':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const highConfidencePredictions = getHighConfidencePredictions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Predictions & Recommendations
            </CardTitle>
            <CardDescription>
              Personalized therapy insights based on your progress and patterns
            </CardDescription>
          </div>
          <Button
            onClick={() => generatePredictions()}
            disabled={generating}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {generating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No predictions available yet.</p>
              <p className="text-sm">Generate insights to see personalized recommendations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {highConfidencePredictions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    High-Confidence Recommendations
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {highConfidencePredictions.map((prediction) => (
                      <Card key={prediction.id} className="border-yellow-200 bg-yellow-50/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
                              {getPredictionIcon(prediction.prediction_type)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="capitalize">
                                  {prediction.prediction_type.replace('_', ' ')}
                                </Badge>
                                <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence_score)}`}>
                                  {Math.round(prediction.confidence_score * 100)}% confidence
                                </span>
                              </div>
                              <p className="text-sm">{prediction.content}</p>
                              <Progress value={prediction.confidence_score * 100} className="h-2" />
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  onClick={() => updatePredictionStatus(prediction.id, 'accepted')}
                                  className="flex-1"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePredictionStatus(prediction.id, 'dismissed')}
                                  className="flex-1"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {predictions.filter(p => p.confidence_score < 0.8).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">All Recommendations</h3>
                  <div className="space-y-3">
                    {predictions.filter(p => p.confidence_score < 0.8).map((prediction) => (
                      <Card key={prediction.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
                              {getPredictionIcon(prediction.prediction_type)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize">
                                  {prediction.prediction_type.replace('_', ' ')}
                                </Badge>
                                <span className={`text-sm font-medium ${getConfidenceColor(prediction.confidence_score)}`}>
                                  {Math.round(prediction.confidence_score * 100)}% confidence
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{prediction.content}</p>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updatePredictionStatus(prediction.id, 'accepted')}
                                  className="flex-1"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updatePredictionStatus(prediction.id, 'dismissed')}
                                  className="flex-1"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveAIPanel;