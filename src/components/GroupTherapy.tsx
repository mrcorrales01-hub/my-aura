import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useGroupTherapy } from '@/hooks/useGroupTherapy';
import { useI18n } from '@/hooks/useI18n';
import { 
  Users, 
  Clock, 
  MessageCircle, 
  Shield, 
  Calendar,
  User,
  Plus,
  Play,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';

const GroupTherapy: React.FC = () => {
  const { t } = useI18n();
  const {
    sessions,
    joinedSessions,
    currentSession,
    participants,
    loading,
    sessionTopics,
    createSession,
    joinSession,
    leaveSession,
    fetchSessionParticipants,
    startSession,
    setCurrentSession,
    getSessionsByTopic,
    getActiveJoinedSessions
  } = useGroupTherapy();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [joinDisplayName, setJoinDisplayName] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState<'support_group' | 'therapy_group' | 'peer_circle'>('support_group');

  const handleCreateSession = async () => {
    if (!sessionName || selectedTopics.length === 0) return;

    await createSession(
      sessionName,
      selectedSessionType,
      selectedTopics,
      maxParticipants
    );

    setShowCreateDialog(false);
    setSessionName('');
    setSelectedTopics([]);
    setMaxParticipants(8);
  };

  const handleJoinSession = async (sessionId: string) => {
    await joinSession(sessionId, joinDisplayName || undefined);
    setJoinDisplayName('');
  };

  const handleViewSession = async (session: any) => {
    setCurrentSession(session);
    await fetchSessionParticipants(session.id);
  };

  const availableSessions = sessions.filter(session => 
    session.current_participants < session.max_participants
  );

  const activeJoinedSessions = getActiveJoinedSessions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          {t('groupTherapy.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('groupTherapy.subtitle')}
        </p>
      </div>

      {/* Active Joined Sessions */}
      {activeJoinedSessions.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <MessageCircle className="w-5 h-5" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {activeJoinedSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{session.session_name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.current_participants}/{session.max_participants}
                      </span>
                      <Badge variant="outline" className="gap-1">
                        <Shield className="w-3 h-3" />
                        {t('groupTherapy.anonymous')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewSession(session)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Join Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => leaveSession(session.id)}
                      className="gap-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Session View */}
      {currentSession && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {currentSession.session_name}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentSession(null)}
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </CardTitle>
            <div className="flex gap-2">
              {currentSession.topic_focus.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {sessionTopics.find(t => t.id === topic)?.label || topic}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Participants */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Participants ({participants.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{participant.display_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area Placeholder */}
            <div className="border rounded-lg p-6 bg-muted/30">
              <div className="text-center space-y-2">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                <h4 className="font-medium">Group Chat</h4>
                <p className="text-sm text-muted-foreground">
                  Anonymous, supportive conversation space
                </p>
                <Button className="mt-4">
                  Open Chat Interface
                </Button>
              </div>
            </div>

            {/* Session Rules */}
            {currentSession.session_data?.rules && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Session Guidelines</h4>
                <div className="grid gap-2">
                  {currentSession.session_data.rules.map((rule: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Sessions */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Available Support Groups</h2>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t('groupTherapy.createGroup')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Support Group</DialogTitle>
                <DialogDescription>
                  Set up a new anonymous support group session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g., Anxiety Support Circle"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Type</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'support_group', label: 'Support Group', desc: 'Peer support and sharing' },
                      { id: 'therapy_group', label: 'Therapy Group', desc: 'Guided therapeutic discussion' },
                      { id: 'peer_circle', label: 'Peer Circle', desc: 'Informal peer connection' }
                    ].map((type) => (
                      <div
                        key={type.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedSessionType === type.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedSessionType(type.id as any)}
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Focus Topics</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {sessionTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic.id}
                          checked={selectedTopics.includes(topic.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTopics([...selectedTopics, topic.id]);
                            } else {
                              setSelectedTopics(selectedTopics.filter(t => t !== topic.id));
                            }
                          }}
                        />
                        <Label htmlFor={topic.id} className="text-sm">
                          {topic.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-participants">Max Participants</Label>
                  <Input
                    id="max-participants"
                    type="number"
                    min="3"
                    max="12"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  />
                </div>

                <Button
                  onClick={handleCreateSession}
                  disabled={!sessionName || selectedTopics.length === 0}
                  className="w-full"
                >
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Session Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{session.session_name}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {session.current_participants}/{session.max_participants}
                  </span>
                  <Badge variant="outline" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Anonymous
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {session.topic_focus.slice(0, 2).map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {sessionTopics.find(t => t.id === topic)?.label || topic}
                    </Badge>
                  ))}
                  {session.topic_focus.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{session.topic_focus.length - 2} more
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Display name (optional)"
                      value={joinDisplayName}
                      onChange={(e) => setJoinDisplayName(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => handleJoinSession(session.id)}
                    className="w-full gap-2"
                    disabled={session.current_participants >= session.max_participants}
                  >
                    <Play className="w-4 h-4" />
                    {t('groupTherapy.joinGroup')}
                  </Button>
                </div>

                {session.scheduled_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Scheduled: {new Date(session.scheduled_at).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {availableSessions.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Sessions</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create a support group session
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create First Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupTherapy;