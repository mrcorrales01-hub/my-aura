import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFamilyMode } from '@/hooks/useFamilyMode';
import { 
  Users, 
  Heart, 
  Plus, 
  Calendar, 
  MessageCircle, 
  Target,
  Lightbulb,
  Clock,
  CheckCircle
} from 'lucide-react';

const FamilyModePanel: React.FC = () => {
  const {
    familyAccount,
    familyMembers,
    familySessions,
    loading,
    hasFamilyAccount,
    isCreator,
    createFamilyAccount,
    startFamilySession,
    getAISuggestions,
    completeFamilySession
  } = useFamilyMode();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [accountType, setAccountType] = useState<'family' | 'couple'>('family');
  
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [sessionType, setSessionType] = useState<'couple' | 'family' | 'parent_child'>('family');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [issueDescription, setIssueDescription] = useState('');
  const [currentSuggestions, setCurrentSuggestions] = useState<any>(null);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) return;
    
    const result = await createFamilyAccount(familyName, accountType);
    if (result) {
      setShowCreateDialog(false);
      setFamilyName('');
    }
  };

  const handleStartSession = async () => {
    if (!issueDescription.trim() || selectedParticipants.length === 0) return;

    const suggestions = await getAISuggestions(sessionType, selectedParticipants, issueDescription);
    setCurrentSuggestions(suggestions);
    setShowSessionDialog(false);
  };

  const handleCompleteSession = async (sessionId: string) => {
    await completeFamilySession(sessionId, "Session completed successfully");
    setCurrentSuggestions(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasFamilyAccount()) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Heart className="w-8 h-8 text-red-500" />
            Family & Relationship Mode
          </CardTitle>
          <CardDescription className="text-lg">
            Create a shared space for your family or relationship to grow together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-dashed border-primary/30">
              <CardContent className="pt-6 text-center space-y-4">
                <Users className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Family Account</h3>
                <p className="text-muted-foreground">
                  Perfect for families with children, teens, and parents to work together
                </p>
                <ul className="text-sm space-y-1 text-left">
                  <li>• Family therapy sessions</li>
                  <li>• Parent-child activities</li>
                  <li>• Age-appropriate content</li>
                  <li>• Family progress tracking</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-red-300">
              <CardContent className="pt-6 text-center space-y-4">
                <Heart className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-xl font-semibold">Couple Account</h3>
                <p className="text-muted-foreground">
                  Designed for partners to strengthen their relationship together
                </p>
                <ul className="text-sm space-y-1 text-left">
                  <li>• Couples therapy exercises</li>
                  <li>• Communication tools</li>
                  <li>• Relationship goals</li>
                  <li>• Conflict resolution</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">
                <Plus className="w-5 h-5 mr-2" />
                Create Family Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Your Family Account</DialogTitle>
                <DialogDescription>
                  Set up a shared space for your family or relationship
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="familyName">Family/Couple Name</Label>
                  <Input
                    id="familyName"
                    placeholder="The Smith Family"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={accountType} onValueChange={(value: 'family' | 'couple') => setAccountType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family Account</SelectItem>
                      <SelectItem value="couple">Couple Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateFamily} className="w-full">
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Family Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {familyAccount?.account_type === 'couple' ? (
              <Heart className="w-6 h-6 text-red-500" />
            ) : (
              <Users className="w-6 h-6 text-primary" />
            )}
            {familyAccount?.family_name}
          </CardTitle>
          <CardDescription>
            {familyMembers.length} members • {familySessions.length} sessions completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {familyMembers.map((member) => (
              <Badge key={member.id} variant="secondary">
                {member.full_name} ({member.relationship_type})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Family Sessions</h3>
            <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Start New Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Start Family Session</DialogTitle>
                  <DialogDescription>
                    Describe what you'd like to work on together
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family Session</SelectItem>
                        <SelectItem value="couple">Couple Session</SelectItem>
                        <SelectItem value="parent_child">Parent-Child Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Participants</Label>
                    <div className="space-y-2">
                      {familyMembers.map((member) => (
                        <label key={member.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants([...selectedParticipants, member.id]);
                              } else {
                                setSelectedParticipants(selectedParticipants.filter(id => id !== member.id));
                              }
                            }}
                          />
                          <span>{member.full_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="issueDescription">What would you like to work on?</Label>
                    <Textarea
                      id="issueDescription"
                      placeholder="Describe the topic, challenge, or goal you'd like to focus on in this session..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleStartSession} className="w-full">
                    Get AI Suggestions
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {currentSuggestions && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  AI Suggested Exercises
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSuggestions.suggestions?.map((suggestion: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold">{index + 1}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold">{suggestion.title}</h4>
                          <p className="text-muted-foreground">{suggestion.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {suggestion.duration}
                            </Badge>
                            <Badge variant="outline">
                              <Target className="w-3 h-3 mr-1" />
                              {suggestion.type}
                            </Badge>
                          </div>
                          {suggestion.steps && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Steps:</p>
                              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                {suggestion.steps.map((step: string, stepIndex: number) => (
                                  <li key={stepIndex}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button 
                  onClick={() => handleCompleteSession('current')} 
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Session Complete
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Suggestions</CardTitle>
              <CardDescription>
                Personalized exercises and activities for your family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Start a session to get personalized AI suggestions
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
            </CardHeader>
            <CardContent>
              {familySessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No sessions yet. Start your first family session!
                </p>
              ) : (
                <div className="space-y-4">
                  {familySessions.map((session) => (
                    <Card key={session.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold capitalize">
                              {session.session_type.replace('_', ' ')} Session
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {session.issue_description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={session.completed_at ? "default" : "secondary"}>
                            {session.completed_at ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyModePanel;