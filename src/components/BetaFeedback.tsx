import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  MessageSquare,
  Star,
  Send,
  Bug,
  Lightbulb,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Target,
  Zap,
  Users,
  TrendingUp
} from 'lucide-react';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general' | 'improvement';
  category: string;
  title: string;
  description: string;
  rating: number;
  email?: string;
  priority: 'low' | 'medium' | 'high';
  device_info: string;
  user_journey: string;
}

const BetaFeedback: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    type: 'general',
    category: '',
    title: '',
    description: '',
    rating: 4,
    email: user?.email || '',
    priority: 'medium',
    device_info: navigator.userAgent,
    user_journey: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const feedbackTypes = [
    {
      id: 'bug',
      label: 'Bug Report',
      description: 'Report issues or problems',
      icon: Bug,
      color: 'destructive'
    },
    {
      id: 'feature',
      label: 'Feature Request',
      description: 'Suggest new features',
      icon: Lightbulb,
      color: 'default'
    },
    {
      id: 'improvement',
      label: 'Improvement',
      description: 'Suggest enhancements',
      icon: TrendingUp,
      color: 'secondary'
    },
    {
      id: 'general',
      label: 'General Feedback',
      description: 'Share your thoughts',
      icon: Heart,
      color: 'outline'
    }
  ];

  const categories = {
    bug: ['UI/UX Issue', 'Performance', 'Login/Auth', 'Data Sync', 'Crash', 'Other'],
    feature: ['AI Coach', 'Mood Tracking', 'Community', 'Therapy Tools', 'Analytics', 'Mobile App', 'Integration'],
    improvement: ['User Experience', 'Performance', 'Accessibility', 'Design', 'Navigation', 'Content'],
    general: ['Overall Experience', 'Onboarding', 'Content Quality', 'Pricing', 'Support', 'Other']
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackData.title.trim() || !feedbackData.description.trim()) return;

    try {
      setSubmitting(true);

      // In production, this would call a dedicated feedback edge function
      const feedbackEntry = {
        user_id: user?.id,
        feedback_type: feedbackData.type,
        category: feedbackData.category,
        title: feedbackData.title,
        description: feedbackData.description,
        rating: feedbackData.rating,
        priority: feedbackData.priority,
        device_info: feedbackData.device_info,
        user_journey: feedbackData.user_journey,
        email: feedbackData.email,
        status: 'new',
        created_at: new Date().toISOString(),
        metadata: {
          user_agent: navigator.userAgent,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          referrer: document.referrer
        }
      };

      // Simulate API call (in production, use proper feedback endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Beta Feedback Submitted:', feedbackEntry);

      setShowThankYou(true);
      
      // Reset form
      setFeedbackData({
        type: 'general',
        category: '',
        title: '',
        description: '',
        rating: 4,
        email: user?.email || '',
        priority: 'medium',
        device_info: navigator.userAgent,
        user_journey: ''
      });

      toast({
        title: "Feedback Submitted! 🎉",
        description: "Thank you for helping us improve My Aura. We'll review your feedback soon.",
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ThumbsUp className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Thank You for Your Feedback! 🌟</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your input is invaluable in making My Aura the best mental health platform possible. 
              We review all feedback and will follow up if needed.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setShowThankYou(false)} variant="outline">
                Submit More Feedback
              </Button>
              <Button onClick={() => window.history.back()}>
                Continue Using App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <MessageSquare className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold">Beta Feedback</h1>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            BETA
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Help us shape the future of My Aura! Your feedback during our beta phase is crucial 
          for building the best mental health platform possible.
        </p>
      </div>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
          <CardDescription>
            All feedback is valuable - from bug reports to feature ideas to general thoughts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type Selection */}
            <div className="space-y-3">
              <Label>What type of feedback are you sharing?</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      type="button"
                      variant={feedbackData.type === type.id ? "default" : "outline"}
                      className="flex flex-col gap-2 h-20"
                      onClick={() => setFeedbackData(prev => ({ 
                        ...prev, 
                        type: type.id as FeedbackData['type'],
                        category: '' 
                      }))}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={feedbackData.category} 
                onValueChange={(value) => setFeedbackData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories[feedbackData.type].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback"
                value={feedbackData.title}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide detailed information about your feedback. For bugs, include steps to reproduce. For features, describe the use case."
                value={feedbackData.description}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                required
              />
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label>Overall Experience Rating</Label>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                      className="transition-colors"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= feedbackData.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {feedbackData.rating}/5 stars
                </span>
              </div>
            </div>

            {/* Priority (for bugs and improvements) */}
            {(feedbackData.type === 'bug' || feedbackData.type === 'improvement') && (
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select 
                  value={feedbackData.priority} 
                  onValueChange={(value) => setFeedbackData(prev => ({ 
                    ...prev, 
                    priority: value as FeedbackData['priority'] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor issue or nice-to-have</SelectItem>
                    <SelectItem value="medium">Medium - Noticeable impact</SelectItem>
                    <SelectItem value="high">High - Significant impact or blocker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* User Journey */}
            <div className="space-y-2">
              <Label htmlFor="user-journey">What were you trying to do?</Label>
              <Textarea
                id="user-journey"
                placeholder="Describe what you were doing when you encountered this issue or had this idea"
                value={feedbackData.user_journey}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, user_journey: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={feedbackData.email}
                onChange={(e) => setFeedbackData(prev => ({ ...prev, email: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Leave your email if you'd like us to follow up on your feedback
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={submitting || !feedbackData.title.trim() || !feedbackData.description.trim()}
                className="min-w-32"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Beta Information */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">You're part of our Beta Community! 🚀</h3>
              <p className="text-sm text-muted-foreground">
                As a beta tester, your feedback directly shapes My Aura's development. We actively review 
                all feedback and implement the most requested features. Thank you for being an early supporter!
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Beta Tester
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Early Access
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Product Shaper
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BetaFeedback;