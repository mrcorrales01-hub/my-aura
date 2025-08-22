export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          badge_icon: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_secret: boolean | null
          name: string
          points: number | null
          requirements: Json
        }
        Insert: {
          badge_color?: string | null
          badge_icon?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean | null
          name: string
          points?: number | null
          requirements?: Json
        }
        Update: {
          badge_color?: string | null
          badge_icon?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean | null
          name?: string
          points?: number | null
          requirements?: Json
        }
        Relationships: []
      }
      ai_avatars: {
        Row: {
          appearance_data: Json
          avatar_type: string
          created_at: string
          id: string
          name: string
          personality_traits: Json
          updated_at: string
          voice_settings: Json | null
        }
        Insert: {
          appearance_data?: Json
          avatar_type: string
          created_at?: string
          id?: string
          name: string
          personality_traits?: Json
          updated_at?: string
          voice_settings?: Json | null
        }
        Update: {
          appearance_data?: Json
          avatar_type?: string
          created_at?: string
          id?: string
          name?: string
          personality_traits?: Json
          updated_at?: string
          voice_settings?: Json | null
        }
        Relationships: []
      }
      ai_lifestyle_plans: {
        Row: {
          ai_recommendations: Json | null
          created_at: string
          focus_areas: string[]
          id: string
          is_active: boolean | null
          plan_data: Json
          plan_type: string
          progress_data: Json | null
          updated_at: string
          user_id: string
          wearable_sync_data: Json | null
        }
        Insert: {
          ai_recommendations?: Json | null
          created_at?: string
          focus_areas?: string[]
          id?: string
          is_active?: boolean | null
          plan_data?: Json
          plan_type: string
          progress_data?: Json | null
          updated_at?: string
          user_id: string
          wearable_sync_data?: Json | null
        }
        Update: {
          ai_recommendations?: Json | null
          created_at?: string
          focus_areas?: string[]
          id?: string
          is_active?: boolean | null
          plan_data?: Json
          plan_type?: string
          progress_data?: Json | null
          updated_at?: string
          user_id?: string
          wearable_sync_data?: Json | null
        }
        Relationships: []
      }
      ai_predictions: {
        Row: {
          based_on_data: Json | null
          confidence_score: number | null
          content: string
          created_at: string
          expires_at: string | null
          id: string
          prediction_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          based_on_data?: Json | null
          confidence_score?: number | null
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          prediction_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          based_on_data?: Json | null
          confidence_score?: number | null
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          prediction_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_role_sessions: {
        Row: {
          completed_at: string | null
          conversation_history: Json | null
          duration_minutes: number | null
          effectiveness_rating: number | null
          id: string
          mood_after: string | null
          mood_before: string | null
          role_type: string
          session_data: Json
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_history?: Json | null
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          role_type: string
          session_data?: Json
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_history?: Json | null
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          role_type?: string
          session_data?: Json
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          client_id: string
          client_rating: number | null
          created_at: string
          duration_minutes: number | null
          id: string
          scheduled_at: string
          session_notes: string | null
          session_type: string | null
          session_url: string | null
          status: string | null
          therapist_id: string
          therapist_notes: string | null
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_rating?: number | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          scheduled_at: string
          session_notes?: string | null
          session_type?: string | null
          session_url?: string | null
          status?: string | null
          therapist_id: string
          therapist_notes?: string | null
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_rating?: number | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          scheduled_at?: string
          session_notes?: string | null
          session_type?: string | null
          session_url?: string | null
          status?: string | null
          therapist_id?: string
          therapist_notes?: string | null
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      biofeedback_sessions: {
        Row: {
          ai_feedback: Json | null
          biometric_source: string | null
          created_at: string
          effectiveness_score: number | null
          ended_at: string | null
          id: string
          real_time_data: Json
          session_duration: number | null
          session_type: string
          started_at: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          biometric_source?: string | null
          created_at?: string
          effectiveness_score?: number | null
          ended_at?: string | null
          id?: string
          real_time_data?: Json
          session_duration?: number | null
          session_type: string
          started_at?: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          biometric_source?: string | null
          created_at?: string
          effectiveness_score?: number | null
          ended_at?: string | null
          id?: string
          real_time_data?: Json
          session_duration?: number | null
          session_type?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      biometric_analysis: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          consent_given: boolean
          created_at: string
          emotion_data: Json | null
          id: string
          session_id: string | null
          stress_indicators: Json | null
          user_id: string
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          consent_given?: boolean
          created_at?: string
          emotion_data?: Json | null
          id?: string
          session_id?: string | null
          stress_indicators?: Json | null
          user_id: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          consent_given?: boolean
          created_at?: string
          emotion_data?: Json | null
          id?: string
          session_id?: string | null
          stress_indicators?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      child_activities: {
        Row: {
          activity_data: Json
          activity_type: string
          completed_at: string | null
          completion_status: string | null
          created_at: string
          feedback: string | null
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          activity_data?: Json
          activity_type: string
          completed_at?: string | null
          completion_status?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          activity_data?: Json
          activity_type?: string
          completed_at?: string | null
          completion_status?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          display_name: string | null
          id: string
          is_anonymous: boolean
          like_count: number
          moderation_flags: Json | null
          moderation_status: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          like_count?: number
          moderation_flags?: Json | null
          moderation_status?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          like_count?: number
          moderation_flags?: Json | null
          moderation_status?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          group_type: string
          id: string
          invite_code: string | null
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          group_type?: string
          id?: string
          invite_code?: string | null
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          group_type?: string
          id?: string
          invite_code?: string | null
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comment_count: number
          content: string
          created_at: string
          display_name: string | null
          group_id: string | null
          id: string
          is_anonymous: boolean
          like_count: number
          moderation_flags: Json | null
          moderation_status: string
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_count?: number
          content: string
          created_at?: string
          display_name?: string | null
          group_id?: string | null
          id?: string
          is_anonymous?: boolean
          like_count?: number
          moderation_flags?: Json | null
          moderation_status?: string
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_count?: number
          content?: string
          created_at?: string
          display_name?: string | null
          group_id?: string | null
          id?: string
          is_anonymous?: boolean
          like_count?: number
          moderation_flags?: Json | null
          moderation_status?: string
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          ai_tone: string | null
          context: string | null
          created_at: string
          id: string
          language_preference: string | null
          message: string
          response: string
          user_id: string
        }
        Insert: {
          ai_tone?: string | null
          context?: string | null
          created_at?: string
          id?: string
          language_preference?: string | null
          message: string
          response: string
          user_id: string
        }
        Update: {
          ai_tone?: string | null
          context?: string | null
          created_at?: string
          id?: string
          language_preference?: string | null
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      crisis_ai_sessions: {
        Row: {
          ai_responses: Json | null
          created_at: string
          crisis_level: string
          escalation_triggered: boolean | null
          follow_up_scheduled: boolean | null
          geo_location: string | null
          human_handoff_at: string | null
          id: string
          resolved_at: string | null
          session_type: string
          user_id: string | null
          user_messages: Json | null
        }
        Insert: {
          ai_responses?: Json | null
          created_at?: string
          crisis_level: string
          escalation_triggered?: boolean | null
          follow_up_scheduled?: boolean | null
          geo_location?: string | null
          human_handoff_at?: string | null
          id?: string
          resolved_at?: string | null
          session_type: string
          user_id?: string | null
          user_messages?: Json | null
        }
        Update: {
          ai_responses?: Json | null
          created_at?: string
          crisis_level?: string
          escalation_triggered?: boolean | null
          follow_up_scheduled?: boolean | null
          geo_location?: string | null
          human_handoff_at?: string | null
          id?: string
          resolved_at?: string | null
          session_type?: string
          user_id?: string | null
          user_messages?: Json | null
        }
        Relationships: []
      }
      crisis_interactions: {
        Row: {
          action_taken: string
          created_at: string
          crisis_level: string
          id: string
          notes: string | null
          resolved_at: string | null
          user_id: string
        }
        Insert: {
          action_taken: string
          created_at?: string
          crisis_level: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          user_id: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          crisis_level?: string
          id?: string
          notes?: string | null
          resolved_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_quests: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          points: number | null
          quest_date: string
          quest_type: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number | null
          quest_date?: string
          quest_type: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number | null
          quest_date?: string
          quest_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      early_warning_alerts: {
        Row: {
          ai_reasoning: string | null
          alert_type: string
          confidence_score: number
          contributing_factors: Json
          created_at: string
          id: string
          recommended_actions: Json | null
          severity_level: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_reasoning?: string | null
          alert_type: string
          confidence_score: number
          contributing_factors?: Json
          created_at?: string
          id?: string
          recommended_actions?: Json | null
          severity_level: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_reasoning?: string | null
          alert_type?: string
          confidence_score?: number
          contributing_factors?: Json
          created_at?: string
          id?: string
          recommended_actions?: Json | null
          severity_level?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_accounts: {
        Row: {
          account_type: string
          created_at: string
          created_by: string
          family_name: string
          id: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          created_by: string
          family_name: string
          id?: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          created_by?: string
          family_name?: string
          id?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      family_sessions: {
        Row: {
          ai_suggestions: Json | null
          completed_at: string | null
          created_at: string
          exercises_completed: Json | null
          family_account_id: string
          id: string
          issue_description: string | null
          mood_scores: Json | null
          notes: string | null
          participants: Json
          session_type: string
        }
        Insert: {
          ai_suggestions?: Json | null
          completed_at?: string | null
          created_at?: string
          exercises_completed?: Json | null
          family_account_id: string
          id?: string
          issue_description?: string | null
          mood_scores?: Json | null
          notes?: string | null
          participants?: Json
          session_type: string
        }
        Update: {
          ai_suggestions?: Json | null
          completed_at?: string | null
          created_at?: string
          exercises_completed?: Json | null
          family_account_id?: string
          id?: string
          issue_description?: string | null
          mood_scores?: Json | null
          notes?: string | null
          participants?: Json
          session_type?: string
        }
        Relationships: []
      }
      family_supporter_insights: {
        Row: {
          ai_generated: boolean | null
          content: string
          created_at: string
          family_account_id: string
          id: string
          insight_type: string
          priority_level: string | null
          status: string | null
          supported_user_id: string
          supporter_user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          content: string
          created_at?: string
          family_account_id: string
          id?: string
          insight_type: string
          priority_level?: string | null
          status?: string | null
          supported_user_id: string
          supporter_user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: string
          created_at?: string
          family_account_id?: string
          id?: string
          insight_type?: string
          priority_level?: string | null
          status?: string | null
          supported_user_id?: string
          supporter_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_supporter_insights_family_account_id_fkey"
            columns: ["family_account_id"]
            isOneToOne: false
            referencedRelation: "family_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      family_supporter_sessions: {
        Row: {
          ai_guidance: Json | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          family_account_id: string
          id: string
          session_notes: string | null
          session_type: string
          supported_user_id: string
          supporter_user_id: string
        }
        Insert: {
          ai_guidance?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          family_account_id: string
          id?: string
          session_notes?: string | null
          session_type: string
          supported_user_id: string
          supporter_user_id: string
        }
        Update: {
          ai_guidance?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          family_account_id?: string
          id?: string
          session_notes?: string | null
          session_type?: string
          supported_user_id?: string
          supporter_user_id?: string
        }
        Relationships: []
      }
      financial_wellness: {
        Row: {
          ai_recommendations: Json | null
          budget_data: Json | null
          created_at: string
          debt_reduction_plan: Json | null
          financial_goals: Json | null
          id: string
          progress_tracking: Json | null
          stress_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          budget_data?: Json | null
          created_at?: string
          debt_reduction_plan?: Json | null
          financial_goals?: Json | null
          id?: string
          progress_tracking?: Json | null
          stress_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          budget_data?: Json | null
          created_at?: string
          debt_reduction_plan?: Json | null
          financial_goals?: Json | null
          id?: string
          progress_tracking?: Json | null
          stress_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_therapy_participants: {
        Row: {
          display_name: string | null
          id: string
          is_muted: boolean | null
          joined_at: string | null
          left_at: string | null
          participation_score: number | null
          reported_issues: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          participation_score?: number | null
          reported_issues?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          id?: string
          is_muted?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          participation_score?: number | null
          reported_issues?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_therapy_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "group_therapy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_therapy_sessions: {
        Row: {
          ai_moderation_log: Json | null
          created_at: string
          current_participants: number | null
          ended_at: string | null
          facilitator_id: string | null
          facilitator_type: string | null
          id: string
          is_anonymous: boolean | null
          max_participants: number | null
          scheduled_at: string | null
          session_data: Json | null
          session_name: string
          session_type: string
          started_at: string | null
          topic_focus: string[] | null
        }
        Insert: {
          ai_moderation_log?: Json | null
          created_at?: string
          current_participants?: number | null
          ended_at?: string | null
          facilitator_id?: string | null
          facilitator_type?: string | null
          id?: string
          is_anonymous?: boolean | null
          max_participants?: number | null
          scheduled_at?: string | null
          session_data?: Json | null
          session_name: string
          session_type: string
          started_at?: string | null
          topic_focus?: string[] | null
        }
        Update: {
          ai_moderation_log?: Json | null
          created_at?: string
          current_participants?: number | null
          ended_at?: string | null
          facilitator_id?: string | null
          facilitator_type?: string | null
          id?: string
          is_anonymous?: boolean | null
          max_participants?: number | null
          scheduled_at?: string | null
          session_data?: Json | null
          session_name?: string
          session_type?: string
          started_at?: string | null
          topic_focus?: string[] | null
        }
        Relationships: []
      }
      group_vr_participants: {
        Row: {
          avatar_id: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          participation_data: Json | null
          session_id: string
          user_id: string
        }
        Insert: {
          avatar_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          participation_data?: Json | null
          session_id: string
          user_id: string
        }
        Update: {
          avatar_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          participation_data?: Json | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_vr_participants_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "ai_avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_vr_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "group_vr_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_vr_sessions: {
        Row: {
          created_at: string
          current_participants: number | null
          ended_at: string | null
          facilitator_id: string | null
          facilitator_type: string | null
          id: string
          max_participants: number | null
          scheduled_at: string | null
          session_data: Json | null
          session_name: string
          started_at: string | null
          world_id: string | null
        }
        Insert: {
          created_at?: string
          current_participants?: number | null
          ended_at?: string | null
          facilitator_id?: string | null
          facilitator_type?: string | null
          id?: string
          max_participants?: number | null
          scheduled_at?: string | null
          session_data?: Json | null
          session_name: string
          started_at?: string | null
          world_id?: string | null
        }
        Update: {
          created_at?: string
          current_participants?: number | null
          ended_at?: string | null
          facilitator_id?: string | null
          facilitator_type?: string | null
          id?: string
          max_participants?: number | null
          scheduled_at?: string | null
          session_data?: Json | null
          session_name?: string
          started_at?: string | null
          world_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_vr_sessions_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "vr_therapy_worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_health_coins: {
        Row: {
          amount: number
          coin_type: string
          created_at: string
          description: string | null
          id: string
          source_activity: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          coin_type: string
          created_at?: string
          description?: string | null
          id?: string
          source_activity: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          coin_type?: string
          created_at?: string
          description?: string | null
          id?: string
          source_activity?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mental_health_timeline: {
        Row: {
          activity_level: number | null
          ai_insights: Json | null
          created_at: string
          id: string
          mood_average: number | null
          overall_score: number
          sleep_quality: number | null
          stress_level: number | null
          timeline_date: string
          updated_at: string
          user_id: string
          wearable_contributions: Json | null
        }
        Insert: {
          activity_level?: number | null
          ai_insights?: Json | null
          created_at?: string
          id?: string
          mood_average?: number | null
          overall_score: number
          sleep_quality?: number | null
          stress_level?: number | null
          timeline_date: string
          updated_at?: string
          user_id: string
          wearable_contributions?: Json | null
        }
        Update: {
          activity_level?: number | null
          ai_insights?: Json | null
          created_at?: string
          id?: string
          mood_average?: number | null
          overall_score?: number
          sleep_quality?: number | null
          stress_level?: number | null
          timeline_date?: string
          updated_at?: string
          user_id?: string
          wearable_contributions?: Json | null
        }
        Relationships: []
      }
      micro_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          effectiveness_rating: number | null
          id: string
          instructions: Json | null
          reward_coins: number | null
          title: string
          user_id: string
        }
        Insert: {
          challenge_date?: string
          challenge_type: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          effectiveness_rating?: number | null
          id?: string
          instructions?: Json | null
          reward_coins?: number | null
          title: string
          user_id: string
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          effectiveness_rating?: number | null
          id?: string
          instructions?: Json | null
          reward_coins?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      mobile_purchases: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          id: string
          platform: string
          product_id: string
          purchase_token: string
          receipt_data: Json
          user_id: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          platform: string
          product_id: string
          purchase_token: string
          receipt_data?: Json
          user_id?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          platform?: string
          product_id?: string
          purchase_token?: string
          receipt_data?: Json
          user_id?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood_id: string
          mood_value: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_id: string
          mood_value: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_id?: string
          mood_value?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      music_playlists: {
        Row: {
          ai_generated_criteria: Json | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          track_ids: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated_criteria?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          track_ids?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated_criteria?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          track_ids?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          ai_match_criteria: Json | null
          artist: string | null
          category: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          duration_seconds: number
          file_url: string
          gamification_achievements: string[] | null
          gamification_unlock_level: number | null
          id: string
          mood_tags: string[] | null
          multilingual_metadata: Json | null
          pay_per_play_cost: number | null
          premium_only: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_match_criteria?: Json | null
          artist?: string | null
          category: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds: number
          file_url: string
          gamification_achievements?: string[] | null
          gamification_unlock_level?: number | null
          id?: string
          mood_tags?: string[] | null
          multilingual_metadata?: Json | null
          pay_per_play_cost?: number | null
          premium_only?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_match_criteria?: Json | null
          artist?: string | null
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number
          file_url?: string
          gamification_achievements?: string[] | null
          gamification_unlock_level?: number | null
          id?: string
          mood_tags?: string[] | null
          multilingual_metadata?: Json | null
          pay_per_play_cost?: number | null
          premium_only?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pay_per_play_transactions: {
        Row: {
          amount_cents: number
          completed_at: string | null
          content_id: string
          content_type: string
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          payment_status: string
          stripe_payment_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          completed_at?: string | null
          content_id: string
          content_type: string
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_analytics: {
        Row: {
          active_subscribers: number
          apple_transactions: number
          churned_subscribers: number
          created_at: string
          date: string
          google_transactions: number
          id: string
          new_subscribers: number
          pay_per_play_revenue_cents: number
          refund_amount_cents: number
          stripe_transactions: number
          subscription_revenue_cents: number
          total_revenue_cents: number
        }
        Insert: {
          active_subscribers?: number
          apple_transactions?: number
          churned_subscribers?: number
          created_at?: string
          date?: string
          google_transactions?: number
          id?: string
          new_subscribers?: number
          pay_per_play_revenue_cents?: number
          refund_amount_cents?: number
          stripe_transactions?: number
          subscription_revenue_cents?: number
          total_revenue_cents?: number
        }
        Update: {
          active_subscribers?: number
          apple_transactions?: number
          churned_subscribers?: number
          created_at?: string
          date?: string
          google_transactions?: number
          id?: string
          new_subscribers?: number
          pay_per_play_revenue_cents?: number
          refund_amount_cents?: number
          stripe_transactions?: number
          subscription_revenue_cents?: number
          total_revenue_cents?: number
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          email_sent: boolean | null
          id: string
          receipt_data: Json
          receipt_number: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          transaction_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          email_sent?: boolean | null
          id?: string
          receipt_data?: Json
          receipt_number: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          email_sent?: boolean | null
          id?: string
          receipt_data?: Json
          receipt_number?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          avatar_url: string | null
          bio: string | null
          birth_year: number | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          family_account_id: string | null
          full_name: string | null
          id: string
          language_preference: string | null
          phone: string | null
          relationship_type: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_account_id?: string | null
          full_name?: string | null
          id: string
          language_preference?: string | null
          phone?: string | null
          relationship_type?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_year?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_account_id?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          phone?: string | null
          relationship_type?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      relationship_coaching: {
        Row: {
          ai_feedback: Json | null
          completed_at: string | null
          created_at: string
          effectiveness_rating: number | null
          id: string
          improvement_areas: string[] | null
          practice_partner_id: string | null
          relationship_type: string
          roleplay_data: Json | null
          scenario_type: string
          user_id: string
        }
        Insert: {
          ai_feedback?: Json | null
          completed_at?: string | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          improvement_areas?: string[] | null
          practice_partner_id?: string | null
          relationship_type: string
          roleplay_data?: Json | null
          scenario_type: string
          user_id: string
        }
        Update: {
          ai_feedback?: Json | null
          completed_at?: string | null
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          improvement_areas?: string[] | null
          practice_partner_id?: string | null
          relationship_type?: string
          roleplay_data?: Json | null
          scenario_type?: string
          user_id?: string
        }
        Relationships: []
      }
      research_contributions: {
        Row: {
          anonymized_data: Json
          consent_given: boolean
          contributed_at: string
          contribution_type: string
          id: string
          research_study_id: string | null
          user_id: string
        }
        Insert: {
          anonymized_data: Json
          consent_given?: boolean
          contributed_at?: string
          contribution_type: string
          id?: string
          research_study_id?: string | null
          user_id: string
        }
        Update: {
          anonymized_data?: Json
          consent_given?: boolean
          contributed_at?: string
          contribution_type?: string
          id?: string
          research_study_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roleplay_sessions: {
        Row: {
          completed_at: string | null
          confidence_rating: number | null
          created_at: string
          duration_minutes: number | null
          feedback_data: Json | null
          id: string
          scenario_title: string
          scenario_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confidence_rating?: number | null
          created_at?: string
          duration_minutes?: number | null
          feedback_data?: Json | null
          id?: string
          scenario_title: string
          scenario_type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confidence_rating?: number | null
          created_at?: string
          duration_minutes?: number | null
          feedback_data?: Json | null
          id?: string
          scenario_title?: string
          scenario_type?: string
          user_id?: string
        }
        Relationships: []
      }
      safety_networks: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          crisis_notifications: boolean | null
          emergency_contact: boolean | null
          id: string
          relationship: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          crisis_notifications?: boolean | null
          emergency_contact?: boolean | null
          id?: string
          relationship?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          crisis_notifications?: boolean | null
          emergency_contact?: boolean | null
          id?: string
          relationship?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      self_assessments: {
        Row: {
          ai_interpretation: string | null
          assessment_type: string
          completed_at: string
          id: string
          next_suggested_date: string | null
          questions_answers: Json
          recommendations: Json | null
          severity_level: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          ai_interpretation?: string | null
          assessment_type: string
          completed_at?: string
          id?: string
          next_suggested_date?: string | null
          questions_answers?: Json
          recommendations?: Json | null
          severity_level?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          ai_interpretation?: string | null
          assessment_type?: string
          completed_at?: string
          id?: string
          next_suggested_date?: string | null
          questions_answers?: Json
          recommendations?: Json | null
          severity_level?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      therapist_reviews: {
        Row: {
          appointment_id: string
          client_id: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          rating: number
          review_text: string | null
          therapist_id: string
        }
        Insert: {
          appointment_id: string
          client_id: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          rating: number
          review_text?: string | null
          therapist_id: string
        }
        Update: {
          appointment_id?: string
          client_id?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          rating?: number
          review_text?: string | null
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_reviews_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          availability: Json | null
          bio: string | null
          created_at: string
          education: string | null
          email: string
          full_name: string
          hourly_rate: number
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[]
          license_number: string
          license_state: string
          phone: string | null
          profile_image_url: string | null
          specializations: string[]
          timezone: string
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          created_at?: string
          education?: string | null
          email: string
          full_name: string
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[]
          license_number: string
          license_state: string
          phone?: string | null
          profile_image_url?: string | null
          specializations?: string[]
          timezone?: string
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          created_at?: string
          education?: string | null
          email?: string
          full_name?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[]
          license_number?: string
          license_state?: string
          phone?: string | null
          profile_image_url?: string | null
          specializations?: string[]
          timezone?: string
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      translation_history: {
        Row: {
          context: string | null
          created_at: string
          id: string
          original_text: string
          source_language: string
          target_language: string
          translated_text: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          original_text: string
          source_language: string
          target_language: string
          translated_text: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          original_text?: string
          source_language?: string
          target_language?: string
          translated_text?: string
          user_id?: string
        }
        Relationships: []
      }
      ultra_personalizations: {
        Row: {
          auri_personality: Json
          created_at: string
          id: string
          interaction_style: Json | null
          mood_adaptations: Json | null
          updated_at: string
          user_id: string
          visual_preferences: Json | null
          voice_preferences: Json | null
        }
        Insert: {
          auri_personality?: Json
          created_at?: string
          id?: string
          interaction_style?: Json | null
          mood_adaptations?: Json | null
          updated_at?: string
          user_id: string
          visual_preferences?: Json | null
          voice_preferences?: Json | null
        }
        Update: {
          auri_personality?: Json
          created_at?: string
          id?: string
          interaction_style?: Json | null
          mood_adaptations?: Json | null
          updated_at?: string
          user_id?: string
          visual_preferences?: Json | null
          voice_preferences?: Json | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          created_at: string
          current_level: number | null
          description: string | null
          id: string
          metadata: Json | null
          points_earned: number | null
          streak_count: number | null
          total_xp: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          created_at?: string
          current_level?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          streak_count?: number | null
          total_xp?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          created_at?: string
          current_level?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          streak_count?: number | null
          total_xp?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          current_progress: number | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          target_value: number
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_value: number
          title: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_music_sessions: {
        Row: {
          completed: boolean | null
          duration_played: number
          id: string
          mood_after: string | null
          mood_before: string | null
          payment_amount: number | null
          payment_required: boolean | null
          played_at: string
          session_context: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          duration_played?: number
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          payment_amount?: number | null
          payment_required?: boolean | null
          played_at?: string
          session_context?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          duration_played?: number
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          payment_amount?: number | null
          payment_required?: boolean | null
          played_at?: string
          session_context?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_music_sessions_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "music_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          ai_tone: string | null
          auri_enabled: boolean | null
          auri_tone: string | null
          created_at: string
          id: string
          intention: string | null
          language_preference: string | null
          onboarding_completed: boolean | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_tone?: string | null
          auri_enabled?: boolean | null
          auri_tone?: string | null
          created_at?: string
          id?: string
          intention?: string | null
          language_preference?: string | null
          onboarding_completed?: boolean | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_tone?: string | null
          auri_enabled?: boolean | null
          auri_tone?: string | null
          created_at?: string
          id?: string
          intention?: string | null
          language_preference?: string | null
          onboarding_completed?: boolean | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_video_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          difficulty_rating: number | null
          duration_watched: number
          effectiveness_rating: number | null
          id: string
          mood_after: string | null
          mood_before: string | null
          session_notes: string | null
          started_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          difficulty_rating?: number | null
          duration_watched?: number
          effectiveness_rating?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          session_notes?: string | null
          started_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          difficulty_rating?: number | null
          duration_watched?: number
          effectiveness_rating?: number | null
          id?: string
          mood_after?: string | null
          mood_before?: string | null
          session_notes?: string | null
          started_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_video_sessions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_vr_sessions: {
        Row: {
          avatar_id: string | null
          biometric_data: Json | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          effectiveness_rating: number | null
          id: string
          session_notes: string | null
          session_type: string
          started_at: string
          user_id: string
          world_id: string | null
        }
        Insert: {
          avatar_id?: string | null
          biometric_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          session_notes?: string | null
          session_type: string
          started_at?: string
          user_id: string
          world_id?: string | null
        }
        Update: {
          avatar_id?: string | null
          biometric_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          id?: string
          session_notes?: string | null
          session_type?: string
          started_at?: string
          user_id?: string
          world_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_vr_sessions_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "ai_avatars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_vr_sessions_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "vr_therapy_worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      video_exercises: {
        Row: {
          ai_match_criteria: Json | null
          category: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_seconds: number
          gamification_achievements: string[] | null
          gamification_unlock_level: number | null
          id: string
          instructor: string | null
          multilingual_captions: Json | null
          multilingual_metadata: Json | null
          premium_only: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          ai_match_criteria?: Json | null
          category: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds: number
          gamification_achievements?: string[] | null
          gamification_unlock_level?: number | null
          id?: string
          instructor?: string | null
          multilingual_captions?: Json | null
          multilingual_metadata?: Json | null
          premium_only?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          ai_match_criteria?: Json | null
          category?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_seconds?: number
          gamification_achievements?: string[] | null
          gamification_unlock_level?: number | null
          id?: string
          instructor?: string | null
          multilingual_captions?: Json | null
          multilingual_metadata?: Json | null
          premium_only?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      vr_ar_sessions: {
        Row: {
          biometric_data: Json | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          effectiveness_rating: number | null
          environment_type: string
          exercise_type: string | null
          id: string
          session_notes: string | null
          session_type: string
          user_id: string
        }
        Insert: {
          biometric_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          environment_type: string
          exercise_type?: string | null
          id?: string
          session_notes?: string | null
          session_type: string
          user_id: string
        }
        Update: {
          biometric_data?: Json | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          effectiveness_rating?: number | null
          environment_type?: string
          exercise_type?: string | null
          id?: string
          session_notes?: string | null
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
      vr_therapy_worlds: {
        Row: {
          created_at: string
          description: string | null
          environment_type: string
          id: string
          name: string
          updated_at: string
          world_data: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          environment_type: string
          id?: string
          name: string
          updated_at?: string
          world_data?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          environment_type?: string
          id?: string
          name?: string
          updated_at?: string
          world_data?: Json
        }
        Relationships: []
      }
      wearable_data: {
        Row: {
          created_at: string
          data_type: string
          device_type: string
          id: string
          metadata: Json | null
          recorded_at: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          data_type: string
          device_type: string
          id?: string
          metadata?: Json | null
          recorded_at: string
          unit: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          data_type?: string
          device_type?: string
          id?: string
          metadata?: Json | null
          recorded_at?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: {
          p_achievement_name: string
          p_points?: number
          p_user_id: string
        }
        Returns: boolean
      }
      cleanup_old_conversations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_therapist_patients_summary: {
        Args: { therapist_user_id: string }
        Returns: {
          appointment_count: number
          avg_mood: number
          last_session: string
          patient_id: string
          patient_name: string
          total_conversations: number
        }[]
      }
      log_ai_interaction: {
        Args: {
          p_ai_tone?: string
          p_context?: string
          p_language?: string
          p_message: string
          p_response: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
