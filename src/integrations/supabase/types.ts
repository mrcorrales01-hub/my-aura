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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          id: string
          phone: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
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
