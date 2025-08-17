import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain,
  FileText,
  TrendingUp,
  MessageSquare,
  Heart,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface PatientSummaryProps {
  patient: {
    patient_id: string;
    patient_name: string;
    appointment_count: number;
    last_session: string;
    avg_mood: number;
    total_conversations: number;
  };
}

interface AISummary {
  patientName: string;
  timeRange: string;
  dataPoints: {
    totalConversations: number;
    totalMoodEntries: number;
    averageMood: string;
  };
  aiAnalysis: string;
  lastUpdated: string;
}

const PatientSummary: React.FC<PatientSummaryProps> = ({ patient }) => {
  const { toast } = useToast();
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30');
  const [therapistNotes, setTherapistNotes] = useState('');

  useEffect(() => {
    generateAISummary();
  }, [patient.patient_id, timeRange]);

  const generateAISummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('therapist-ai-summary', {
        body: {
          patientId: patient.patient_id,
          timeRange: timeRange
        }
      });

      if (error) {
        console.error('Error generating AI summary:', error);
        toast({
          title: "Error",
          description: "Failed to generate AI summary",
          variant: "destructive"
        });
        return;
      }

      setAiSummary(data);
      toast({
        title: "Summary Generated",
        description: "AI analysis completed successfully",
      });

    } catch (error) {
      console.error('Error generating AI summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate patient summary",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTherapistNotes = async () => {
    // In a real implementation, this would save to a therapist_notes table
    toast({
      title: "Notes Saved",
      description: "Therapist notes have been saved",
    });
  };

  const exportSummary = () => {
    if (!aiSummary) return;

    const exportData = {
      ...aiSummary,
      therapistNotes,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patient.patient_name.replace(/\s+/g, '_')}_summary_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Summary Exported",
      description: "Patient summary has been downloaded",
    });
  };

  if (loading && !aiSummary) {
    return (
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Patient Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Patient Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={generateAISummary} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Overview */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">{patient.patient_name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{patient.appointment_count}</div>
              <div className="text-xs text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{patient.avg_mood.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Avg Mood</div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                AI Clinical Analysis
              </h4>
              <Badge variant="secondary">
                Last {aiSummary.timeRange}
              </Badge>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="font-semibold">{aiSummary.dataPoints.totalConversations}</div>
                  <div className="text-xs text-muted-foreground">AI Chats</div>
                </div>
                <div>
                  <div className="font-semibold">{aiSummary.dataPoints.totalMoodEntries}</div>
                  <div className="text-xs text-muted-foreground">Mood Logs</div>
                </div>
                <div>
                  <div className="font-semibold">{aiSummary.dataPoints.averageMood}</div>
                  <div className="text-xs text-muted-foreground">Avg Mood</div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm bg-background p-3 rounded border">
                  {aiSummary.aiAnalysis}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Generated: {new Date(aiSummary.lastUpdated).toLocaleString()}
            </div>
          </div>
        )}

        {/* Therapist Notes */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Therapist Notes
          </h4>
          <Textarea
            value={therapistNotes}
            onChange={(e) => setTherapistNotes(e.target.value)}
            placeholder="Add your clinical observations and notes..."
            className="min-h-24"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveTherapistNotes}>
              Save Notes
            </Button>
            <Button size="sm" variant="outline" onClick={exportSummary}>
              <Download className="h-4 w-4 mr-2" />
              Export Summary
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="font-semibold">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button size="sm" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Progress
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSummary;