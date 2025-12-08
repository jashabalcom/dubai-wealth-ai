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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_strategies: {
        Row: {
          ai_response: string | null
          created_at: string
          id: string
          parameters: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          id?: string
          parameters?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          id?: string
          parameters?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_channels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
          visibility: Database["public"]["Enums"]["channel_visibility"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
          visibility?: Database["public"]["Enums"]["channel_visibility"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
          visibility?: Database["public"]["Enums"]["channel_visibility"]
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
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
      community_events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number
          event_date: string
          event_type: string
          id: string
          is_published: boolean
          max_attendees: number | null
          meeting_id: string | null
          meeting_platform: string
          meeting_url: string | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["channel_visibility"]
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number
          event_date: string
          event_type?: string
          id?: string
          is_published?: boolean
          max_attendees?: number | null
          meeting_id?: string | null
          meeting_platform?: string
          meeting_url?: string | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["channel_visibility"]
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number
          event_date?: string
          event_type?: string
          id?: string
          is_published?: boolean
          max_attendees?: number | null
          meeting_id?: string | null
          meeting_platform?: string
          meeting_url?: string | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["channel_visibility"]
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          channel_id: string
          comments_count: number
          content: string
          created_at: string
          id: string
          images: Json | null
          likes_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          images?: Json | null
          likes_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          images?: Json | null
          likes_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_featured: boolean
          is_published: boolean
          level: string
          order_index: number | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          level?: string
          order_index?: number | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          level?: string
          order_index?: number | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      golden_visa_submissions: {
        Row: {
          additional_notes: string | null
          ai_recommendations: Json | null
          ai_summary: string | null
          created_at: string
          current_residence: string
          email: string
          family_size: number
          full_name: string
          id: string
          investment_budget: string
          investment_type: string
          nationality: string
          timeline: string
          user_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          ai_recommendations?: Json | null
          ai_summary?: string | null
          created_at?: string
          current_residence: string
          email: string
          family_size?: number
          full_name: string
          id?: string
          investment_budget: string
          investment_type: string
          nationality: string
          timeline: string
          user_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          ai_recommendations?: Json | null
          ai_summary?: string | null
          created_at?: string
          current_residence?: string
          email?: string
          family_size?: number
          full_name?: string
          id?: string
          investment_budget?: string
          investment_type?: string
          nationality?: string
          timeline?: string
          user_id?: string | null
        }
        Relationships: []
      }
      group_chat_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free_preview: boolean
          order_index: number
          resources: Json | null
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean
          order_index?: number
          resources?: Json | null
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free_preview?: boolean
          order_index?: number
          resources?: Json | null
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_properties: {
        Row: {
          created_at: string
          current_value: number
          id: string
          location_area: string
          monthly_expenses: number | null
          monthly_rental_income: number | null
          mortgage_balance: number | null
          notes: string | null
          portfolio_id: string
          property_name: string
          property_type: string
          purchase_date: string
          purchase_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_value: number
          id?: string
          location_area: string
          monthly_expenses?: number | null
          monthly_rental_income?: number | null
          mortgage_balance?: number | null
          notes?: string | null
          portfolio_id: string
          property_name: string
          property_type?: string
          purchase_date: string
          purchase_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_value?: number
          id?: string
          location_area?: string
          monthly_expenses?: number | null
          monthly_rental_income?: number | null
          mortgage_balance?: number | null
          notes?: string | null
          portfolio_id?: string
          property_name?: string
          property_type?: string
          purchase_date?: string
          purchase_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_properties_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          budget_range: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          investment_goal: string | null
          is_visible_in_directory: boolean | null
          linkedin_url: string | null
          looking_for: string | null
          membership_renews_at: string | null
          membership_status: Database["public"]["Enums"]["membership_status"]
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          stripe_customer_id: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          budget_range?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          investment_goal?: string | null
          is_visible_in_directory?: boolean | null
          linkedin_url?: string | null
          looking_for?: string | null
          membership_renews_at?: string | null
          membership_status?: Database["public"]["Enums"]["membership_status"]
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          stripe_customer_id?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          budget_range?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          investment_goal?: string | null
          is_visible_in_directory?: boolean | null
          linkedin_url?: string | null
          looking_for?: string | null
          membership_renews_at?: string | null
          membership_status?: Database["public"]["Enums"]["membership_status"]
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          stripe_customer_id?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: Json | null
          bathrooms: number
          bedrooms: number
          completion_date: string | null
          created_at: string
          description: string | null
          developer_name: string | null
          highlights: Json | null
          id: string
          images: Json | null
          is_featured: boolean
          is_off_plan: boolean
          latitude: number | null
          location_area: string
          longitude: number | null
          payment_plan_json: Json | null
          price_aed: number
          property_type: string
          rental_yield_estimate: number | null
          size_sqft: number
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          bathrooms?: number
          bedrooms?: number
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer_name?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          is_featured?: boolean
          is_off_plan?: boolean
          latitude?: number | null
          location_area: string
          longitude?: number | null
          payment_plan_json?: Json | null
          price_aed: number
          property_type?: string
          rental_yield_estimate?: number | null
          size_sqft: number
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          bathrooms?: number
          bedrooms?: number
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer_name?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          is_featured?: boolean
          is_off_plan?: boolean
          latitude?: number | null
          location_area?: string
          longitude?: number | null
          payment_plan_json?: Json | null
          price_aed?: number
          property_type?: string
          rental_yield_estimate?: number | null
          size_sqft?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_properties: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      are_connected: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      can_access_channel: {
        Args: {
          channel_visibility: Database["public"]["Enums"]["channel_visibility"]
          user_tier: Database["public"]["Enums"]["membership_tier"]
        }
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
      app_role: "admin" | "moderator" | "user"
      channel_visibility: "all_members" | "elite_only"
      membership_status: "active" | "canceled" | "trial" | "expired"
      membership_tier: "free" | "investor" | "elite"
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
      app_role: ["admin", "moderator", "user"],
      channel_visibility: ["all_members", "elite_only"],
      membership_status: ["active", "canceled", "trial", "expired"],
      membership_tier: ["free", "investor", "elite"],
    },
  },
} as const
