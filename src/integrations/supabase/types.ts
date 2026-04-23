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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      affirmation_views: {
        Row: {
          affirmation_index: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          affirmation_index: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          affirmation_index?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          free_message_limit: number
          id: number
          maintenance_mode: boolean
          premium_monthly_price: number
          updated_at: string
        }
        Insert: {
          free_message_limit?: number
          id?: number
          maintenance_mode?: boolean
          premium_monthly_price?: number
          updated_at?: string
        }
        Update: {
          free_message_limit?: number
          id?: number
          maintenance_mode?: boolean
          premium_monthly_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      broadcast_reads: {
        Row: {
          broadcast_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          broadcast_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          broadcast_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          cta_text: string | null
          cta_url: string | null
          id: string
          reach_estimate: number
          scheduled_for: string | null
          segment: string
          sent_at: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          reach_estimate?: number
          scheduled_for?: string | null
          segment?: string
          sent_at?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          reach_estimate?: number
          scheduled_for?: string | null
          segment?: string
          sent_at?: string | null
          title?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_flagged: boolean
          reviewed_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean
          reviewed_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean
          reviewed_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      course_completions: {
        Row: {
          completed_at: string
          course_id: string
          id: string
          lessons_count: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          course_id: string
          id?: string
          lessons_count?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          course_id?: string
          id?: string
          lessons_count?: number
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          mood: string | null
          note: string | null
          symptoms: string[] | null
          user_id: string
          week_number: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          mood?: string | null
          note?: string | null
          symptoms?: string[] | null
          user_id: string
          week_number?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          mood?: string | null
          note?: string | null
          symptoms?: string[] | null
          user_id?: string
          week_number?: number | null
        }
        Relationships: []
      }
      kick_counts: {
        Row: {
          count: number
          id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          count?: number
          id?: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          count?: number
          id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_reflections: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          reflection_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          reflection_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          reflection_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_logs: {
        Row: {
          id: string
          logged_at: string
          mood: string
          user_id: string
        }
        Insert: {
          id?: string
          logged_at?: string
          mood: string
          user_id: string
        }
        Update: {
          id?: string
          logged_at?: string
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          post_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          post_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_notes: string | null
          amount_paid: number | null
          carrier: string | null
          created_at: string
          id: string
          items: Json
          paid_at: string | null
          promo_code: string | null
          shipped_at: string | null
          shipping_address: string | null
          status: string
          stripe_session_id: string | null
          total: number
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_paid?: number | null
          carrier?: string | null
          created_at?: string
          id?: string
          items?: Json
          paid_at?: string | null
          promo_code?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          status?: string
          stripe_session_id?: string | null
          total?: number
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_paid?: number | null
          carrier?: string | null
          created_at?: string
          id?: string
          items?: Json
          paid_at?: string | null
          promo_code?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          status?: string
          stripe_session_id?: string | null
          total?: number
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string
          category: string
          created_at: string
          display_name: string | null
          flag_reason: string | null
          id: string
          is_featured: boolean
          is_flagged: boolean
          is_pinned: boolean
          likes: number
          title: string
          user_id: string
          week_posted: number | null
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          display_name?: string | null
          flag_reason?: string | null
          id?: string
          is_featured?: boolean
          is_flagged?: boolean
          is_pinned?: boolean
          likes?: number
          title: string
          user_id: string
          week_posted?: number | null
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          display_name?: string | null
          flag_reason?: string | null
          id?: string
          is_featured?: boolean
          is_flagged?: boolean
          is_pinned?: boolean
          likes?: number
          title?: string
          user_id?: string
          week_posted?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          due_date: string | null
          first_name: string | null
          has_provider: boolean | null
          id: string
          is_premium: boolean | null
          onboarding_completed: boolean | null
          pregnancy_number: number | null
          premium_expires_at: string | null
          premium_since: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          first_name?: string | null
          has_provider?: boolean | null
          id?: string
          is_premium?: boolean | null
          onboarding_completed?: boolean | null
          pregnancy_number?: number | null
          premium_expires_at?: string | null
          premium_since?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          first_name?: string | null
          has_provider?: boolean | null
          id?: string
          is_premium?: boolean | null
          onboarding_completed?: boolean | null
          pregnancy_number?: number | null
          premium_expires_at?: string | null
          premium_since?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_value: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_value?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_value?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          completed_at: string
          id: string
          is_correct: boolean | null
          lesson_id: string | null
          score: number | null
          selected_option: string | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          is_correct?: boolean | null
          lesson_id?: string | null
          score?: number | null
          selected_option?: string | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          is_correct?: boolean | null
          lesson_id?: string | null
          score?: number | null
          selected_option?: string | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          id: string
          recipe_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          recipe_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          recipe_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saves: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      streak_state: {
        Row: {
          current_streak: number
          last_checkin_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_checkin_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_checkin_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
