import React, { useState } from 'react';
import { CommunityGroup, useCommunity } from '@/hooks/useCommunity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Hash, Globe } from 'lucide-react';

interface GroupSelectorProps {
  groups: CommunityGroup[];
  selectedGroupId: string | null;
  onGroupChange: (groupId: string | null) => void;
  showCreateGroup?: boolean;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedGroupId,
  onGroupChange,
  showCreateGroup = false
}) => {
  const { createGroup, joinGroup } = useCommunity();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  // Create group form state
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState('private');
  const [isCreating, setIsCreating] = useState(false);
  
  // Join group form state
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsCreating(true);
    try {
      const success = await createGroup(groupName.trim(), groupDescription.trim(), groupType);
      if (success) {
        setGroupName('');
        setGroupDescription('');
        setGroupType('private');
        setShowCreateDialog(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    try {
      const success = await joinGroup(inviteCode.trim());
      if (success) {
        setInviteCode('');
        setShowJoinDialog(false);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const userGroups = groups.filter(g => g.is_member);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={selectedGroupId || 'public'}
            onValueChange={(value) => onGroupChange(value === 'public' ? null : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public Community
                </div>
              </SelectItem>
              {userGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {group.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedGroupId && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Private Group
            </Badge>
          )}
        </div>

        {showCreateGroup && (
          <div className="flex gap-2">
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Join Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Private Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      placeholder="Enter 8-character invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      maxLength={8}
                      className="font-mono"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Get the invite code from a group member or admin
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowJoinDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!inviteCode.trim() || isJoining}
                    >
                      {isJoining ? 'Joining...' : 'Join Group'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., 'Family Support', 'College Students'..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description (Optional)</Label>
                    <Textarea
                      id="groupDescription"
                      placeholder="Describe the purpose and focus of this group..."
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Group Type</Label>
                    <Select value={groupType} onValueChange={setGroupType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="space-y-1">
                            <div className="font-medium">Private</div>
                            <div className="text-sm text-muted-foreground">
                              Invite-only, intimate setting for close connections
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-1">
                    <p className="font-medium">Group Guidelines:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Maximum 50 members per group</li>
                      <li>• You'll receive a unique invite code to share</li>
                      <li>• As the creator, you'll be the group admin</li>
                      <li>• All posts are still subject to AI moderation</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!groupName.trim() || isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Group'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {userGroups.length > 0 && !selectedGroupId && (
        <div className="text-sm text-muted-foreground">
          💡 You're a member of {userGroups.length} group{userGroups.length !== 1 ? 's' : ''}. 
          Select one above to see group-specific posts.
        </div>
      )}
    </div>
  );
};