import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDiagnosisCompass, type Assessment } from '@/hooks/useDiagnosisCompass';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Brain,
  Heart,
  Info
} from 'lucide-react';

export default function DiagnosisCompass() {
  const { 
    assessments, 
    loading, 
    assessmentTypes, 
    submitAssessment, 
    getLatestAssessment,
    getAssessmentTrend 
  } = useDiagnosisCompass();

  const [activeAssessment, setActiveAssessment] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [currentResponse, setCurrentResponse] = useState<number | null>(null);

  const startAssessment = (type: string) => {
    setActiveAssessment(type);
    setCurrentQuestion(0);
    setResponses([]);
    setCurrentResponse(null);
  };

  const handleResponse = (value: number) => {
    setCurrentResponse(value);
  };

  const nextQuestion = () => {
    if (currentResponse === null) return;

    const newResponses = [...responses, currentResponse];
    setResponses(newResponses);
    setCurrentResponse(null);

    const assessment = assessmentTypes[activeAssessment as keyof typeof assessmentTypes];
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Complete assessment
      completeAssessment(newResponses);
    }
  };

  const completeAssessment = async (finalResponses: number[]) => {
    if (!activeAssessment) return;

    await submitAssessment(activeAssessment, finalResponses);
    setActiveAssessment(null);
    setCurrentQuestion(0);
    setResponses([]);
    setCurrentResponse(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minimal': return 'text-green-600';
      case 'mild': return 'text-yellow-600';
      case 'moderate': return 'text-orange-600';
      case 'moderately severe': return 'text-red-600';
      case 'severe': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'worsening': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>Diagnosis Compass</span>
          </CardTitle>
          <CardDescription>
            Self-assessment tools to help understand your mental health. Results provide guidance, not diagnosis.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Active Assessment */}
      {activeAssessment && (
        <Card>
          <CardHeader>
            <CardTitle>
              {assessmentTypes[activeAssessment as keyof typeof assessmentTypes].name}
            </CardTitle>
            <CardDescription>
              Question {currentQuestion + 1} of {assessmentTypes[activeAssessment as keyof typeof assessmentTypes].questions.length}
            </CardDescription>
            <Progress 
              value={(currentQuestion / assessmentTypes[activeAssessment as keyof typeof assessmentTypes].questions.length) * 100} 
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Over the last 2 weeks, how often have you been bothered by:
              </h3>
              <p className="text-xl">
                {assessmentTypes[activeAssessment as keyof typeof assessmentTypes].questions[currentQuestion]}
              </p>
            </div>

            <RadioGroup value={currentResponse?.toString()} onValueChange={(value) => handleResponse(parseInt(value))}>
              {Object.entries(assessmentTypes[activeAssessment as keyof typeof assessmentTypes].scoring).map(([score, label]) => (
                <div key={score} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={score} id={score} />
                  <Label htmlFor={score} className="cursor-pointer flex-1">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setActiveAssessment(null)}
                disabled={currentQuestion === 0}
              >
                Cancel
              </Button>
              <Button 
                onClick={nextQuestion}
                disabled={currentResponse === null}
                className="flex-1"
              >
                {currentQuestion < assessmentTypes[activeAssessment as keyof typeof assessmentTypes].questions.length - 1 
                  ? 'Next Question' 
                  : 'Complete Assessment'
                }
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Options & Results */}
      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">Available Assessments</TabsTrigger>
          <TabsTrigger value="results">Your Results</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(assessmentTypes).map(([key, assessment]) => {
              const latest = getLatestAssessment(key);
              const trend = getAssessmentTrend(key);
              
              return (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{assessment.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {assessment.description}
                        </CardDescription>
                      </div>
                      {latest && (
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(trend)}
                          <Badge variant="outline">
                            Score: {latest.score}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {latest ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last taken:</span>
                          <span className="text-sm">
                            {new Date(latest.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Severity:</span>
                          <span className={`text-sm font-medium ${getSeverityColor(latest.severity_level || '')}`}>
                            {latest.severity_level}
                          </span>
                        </div>
                        <Button 
                          onClick={() => startAssessment(key)}
                          variant="outline" 
                          size="sm"
                          className="w-full"
                        >
                          Retake Assessment
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => startAssessment(key)}
                        className="w-full"
                      >
                        Take Assessment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {assessments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No assessments yet</h3>
                <p className="text-muted-foreground">
                  Take your first assessment to see results and track your progress over time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assessments.slice(0, 5).map(assessment => (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {assessmentTypes[assessment.assessment_type].name}
                        </CardTitle>
                        <CardDescription>
                          Completed on {new Date(assessment.completed_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{assessment.score}</div>
                        <div className={`text-sm ${getSeverityColor(assessment.severity_level || '')}`}>
                          {assessment.severity_level}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {assessment.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Important Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> These assessments are screening tools only and do not replace professional diagnosis. 
          If you're experiencing severe symptoms or thoughts of self-harm, please contact a mental health professional 
          or crisis hotline immediately.
        </AlertDescription>
      </Alert>
    </div>
  );
}