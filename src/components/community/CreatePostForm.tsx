import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, HelpCircle, MessageSquare, Sparkles, User, X } from 'lucide-react';

interface CreatePostFormProps {
  onSubmit: (content: string, postType: string, isAnonymous: boolean, displayName?: string) => void;
  onCancel: () => void;
  groupContext?: string;
}

export const CreatePostForm: React.FC<CreatePostFormProps> = ({ 
  onSubmit, 
  onCancel, 
  groupContext 
}) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postTypes = [
    { value: 'general', label: 'General', icon: MessageSquare, color: 'default' },
    { value: 'struggle', label: 'Seeking Support', icon: Heart, color: 'destructive' },
    { value: 'win', label: 'Celebrating', icon: Sparkles, color: 'secondary' },
    { value: 'question', label: 'Question', icon: HelpCircle, color: 'outline' },
  ];

  const selectedPostType = postTypes.find(type => type.value === postType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), postType, isAnonymous, displayName.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlaceholderText = () => {
    switch (postType) {
      case 'struggle':
        return "Share what you're going through. This is a safe space for support...";
      case 'win':
        return "Share your victory, breakthrough, or positive moment...";
      case 'question':
        return "Ask the community for advice, resources, or guidance...";
      default:
        return "Share your thoughts, experiences, or connect with the community...";
    }
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Share with {groupContext ? groupContext : 'the Community'}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Post Type</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder={getPlaceholderText()}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none focus:ring-primary"
              required
            />
            <div className="text-sm text-muted-foreground text-right">
              {content.length}/2000
            </div>
          </div>

          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="anonymous">Share anonymously</Label>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            {isAnonymous && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm">
                  Display name (optional)
                </Label>
                <Input
                  id="displayName"
                  placeholder="e.g., 'Hope Seeker', 'Journey Walker'..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to appear as "Anonymous"
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Your post will be reviewed by AI moderation before appearing</p>
              <p>• Posts seeking immediate crisis support will be prioritized</p>
              <p>• Be respectful and supportive of others</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2">
              {selectedPostType && (
                <Badge 
                  variant={selectedPostType.color as any}
                  className="flex items-center gap-1"
                >
                  <selectedPostType.icon className="h-3 w-3" />
                  {selectedPostType.label}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="min-w-[80px]"
              >
                {isSubmitting ? 'Sharing...' : 'Share'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};