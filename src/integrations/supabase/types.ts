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
      admin_activity_log: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
        }
        Relationships: []
      }
      admin_metrics_snapshots: {
        Row: {
          arr: number | null
          churn_count: number | null
          created_at: string
          elite_count: number | null
          free_count: number | null
          id: string
          investor_count: number | null
          mrr: number | null
          new_signups_today: number | null
          snapshot_date: string
          total_revenue: number | null
          total_users: number | null
        }
        Insert: {
          arr?: number | null
          churn_count?: number | null
          created_at?: string
          elite_count?: number | null
          free_count?: number | null
          id?: string
          investor_count?: number | null
          mrr?: number | null
          new_signups_today?: number | null
          snapshot_date: string
          total_revenue?: number | null
          total_users?: number | null
        }
        Update: {
          arr?: number | null
          churn_count?: number | null
          created_at?: string
          elite_count?: number | null
          free_count?: number | null
          id?: string
          investor_count?: number | null
          mrr?: number | null
          new_signups_today?: number | null
          snapshot_date?: string
          total_revenue?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          areas_covered: string[] | null
          avatar_url: string | null
          bio: string | null
          brokerage_id: string | null
          created_at: string
          email: string | null
          featured_listings_remaining: number | null
          full_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          max_listings: number | null
          phone: string | null
          priority_ranking: number | null
          rera_brn: string | null
          show_direct_contact: boolean | null
          specializations: string[] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_expires_at: string | null
          subscription_status: string | null
          subscription_tier: Database["public"]["Enums"]["agent_tier"] | null
          total_listings: number | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          areas_covered?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          brokerage_id?: string | null
          created_at?: string
          email?: string | null
          featured_listings_remaining?: number | null
          full_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          max_listings?: number | null
          phone?: string | null
          priority_ranking?: number | null
          rera_brn?: string | null
          show_direct_contact?: boolean | null
          specializations?: string[] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: Database["public"]["Enums"]["agent_tier"] | null
          total_listings?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          areas_covered?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          brokerage_id?: string | null
          created_at?: string
          email?: string | null
          featured_listings_remaining?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          max_listings?: number | null
          phone?: string | null
          priority_ranking?: number | null
          rera_brn?: string | null
          show_direct_contact?: boolean | null
          specializations?: string[] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string | null
          subscription_tier?: Database["public"]["Enums"]["agent_tier"] | null
          total_listings?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_response_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          function_name: string
          hit_count: number
          id: string
          input_hash: string | null
          response: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at: string
          function_name: string
          hit_count?: number
          id?: string
          input_hash?: string | null
          response: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          function_name?: string
          hit_count?: number
          id?: string
          input_hash?: string | null
          response?: string
        }
        Relationships: []
      }
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
      airbnb_market_data: {
        Row: {
          active_listings_count: number | null
          area_name: string
          avg_annual_revenue: number | null
          avg_daily_rate: number | null
          avg_occupancy: number | null
          bedrooms: number
          created_at: string
          data_date: string
          id: string
          low_daily_rate: number | null
          low_occupancy: number | null
          peak_daily_rate: number | null
          peak_occupancy: number | null
          property_type: string
          revenue_percentile_25: number | null
          revenue_percentile_75: number | null
          updated_at: string
        }
        Insert: {
          active_listings_count?: number | null
          area_name: string
          avg_annual_revenue?: number | null
          avg_daily_rate?: number | null
          avg_occupancy?: number | null
          bedrooms?: number
          created_at?: string
          data_date?: string
          id?: string
          low_daily_rate?: number | null
          low_occupancy?: number | null
          peak_daily_rate?: number | null
          peak_occupancy?: number | null
          property_type?: string
          revenue_percentile_25?: number | null
          revenue_percentile_75?: number | null
          updated_at?: string
        }
        Update: {
          active_listings_count?: number | null
          area_name?: string
          avg_annual_revenue?: number | null
          avg_daily_rate?: number | null
          avg_occupancy?: number | null
          bedrooms?: number
          created_at?: string
          data_date?: string
          id?: string
          low_daily_rate?: number | null
          low_occupancy?: number | null
          peak_daily_rate?: number | null
          peak_occupancy?: number | null
          property_type?: string
          revenue_percentile_25?: number | null
          revenue_percentile_75?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      area_market_stats: {
        Row: {
          apartment_avg_price: number | null
          apartment_count: number | null
          area_name: string
          avg_price_sqft: number | null
          avg_price_sqm: number | null
          created_at: string
          id: string
          max_price_sqm: number | null
          median_price_sqm: number | null
          min_price_sqm: number | null
          mom_price_change: number | null
          offplan_avg_price: number | null
          offplan_count: number | null
          period_end: string
          period_start: string
          period_type: string
          qoq_price_change: number | null
          ready_avg_price: number | null
          ready_count: number | null
          total_sales_value: number | null
          total_transactions: number | null
          townhouse_avg_price: number | null
          townhouse_count: number | null
          updated_at: string
          villa_avg_price: number | null
          villa_count: number | null
          yoy_price_change: number | null
        }
        Insert: {
          apartment_avg_price?: number | null
          apartment_count?: number | null
          area_name: string
          avg_price_sqft?: number | null
          avg_price_sqm?: number | null
          created_at?: string
          id?: string
          max_price_sqm?: number | null
          median_price_sqm?: number | null
          min_price_sqm?: number | null
          mom_price_change?: number | null
          offplan_avg_price?: number | null
          offplan_count?: number | null
          period_end: string
          period_start: string
          period_type: string
          qoq_price_change?: number | null
          ready_avg_price?: number | null
          ready_count?: number | null
          total_sales_value?: number | null
          total_transactions?: number | null
          townhouse_avg_price?: number | null
          townhouse_count?: number | null
          updated_at?: string
          villa_avg_price?: number | null
          villa_count?: number | null
          yoy_price_change?: number | null
        }
        Update: {
          apartment_avg_price?: number | null
          apartment_count?: number | null
          area_name?: string
          avg_price_sqft?: number | null
          avg_price_sqm?: number | null
          created_at?: string
          id?: string
          max_price_sqm?: number | null
          median_price_sqm?: number | null
          min_price_sqm?: number | null
          mom_price_change?: number | null
          offplan_avg_price?: number | null
          offplan_count?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          qoq_price_change?: number | null
          ready_avg_price?: number | null
          ready_count?: number | null
          total_sales_value?: number | null
          total_transactions?: number | null
          townhouse_avg_price?: number | null
          townhouse_count?: number | null
          updated_at?: string
          villa_avg_price?: number | null
          villa_count?: number | null
          yoy_price_change?: number | null
        }
        Relationships: []
      }
      areas: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      brokerages: {
        Row: {
          address: string | null
          city: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          rera_orn: string | null
          total_agents: number | null
          total_listings: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          rera_orn?: string | null
          total_agents?: number | null
          total_listings?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          rera_orn?: string | null
          total_agents?: number | null
          total_listings?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      buildings: {
        Row: {
          address: string | null
          amenities: Json | null
          community_id: string | null
          created_at: string
          description: string | null
          developer_id: string | null
          has_district_cooling: boolean | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          parking_floors: number | null
          service_charge_per_sqft: number | null
          slug: string
          total_floors: number | null
          total_units: number | null
          updated_at: string
          year_built: number | null
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          community_id?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          has_district_cooling?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          parking_floors?: number | null
          service_charge_per_sqft?: number | null
          slug: string
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string
          year_built?: number | null
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          community_id?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          has_district_cooling?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          parking_floors?: number | null
          service_charge_per_sqft?: number | null
          slug?: string
          total_floors?: number | null
          total_units?: number | null
          updated_at?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buildings_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          area_id: string | null
          avg_price_per_sqft: number | null
          avg_rental_yield: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          slug: string
          total_properties: number | null
          transit_score: number | null
          updated_at: string
          walkability_score: number | null
        }
        Insert: {
          area_id?: string | null
          avg_price_per_sqft?: number | null
          avg_rental_yield?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          slug: string
          total_properties?: number | null
          transit_score?: number | null
          updated_at?: string
          walkability_score?: number | null
        }
        Update: {
          area_id?: string | null
          avg_price_per_sqft?: number | null
          avg_rental_yield?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          slug?: string
          total_properties?: number | null
          transit_score?: number | null
          updated_at?: string
          walkability_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
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
      developers: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          established_year: number | null
          headquarters: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          slug: string
          total_projects: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          established_year?: number | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          total_projects?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          established_year?: number | null
          headquarters?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          total_projects?: number | null
          updated_at?: string
          website?: string | null
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
      feature_definitions: {
        Row: {
          category: string
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
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
      market_transactions: {
        Row: {
          actual_worth: number | null
          area_name: string
          building_name: string | null
          created_at: string
          developer_name: string | null
          has_parking: boolean | null
          id: string
          instance_date: string
          meter_sale_price: number | null
          nearest_mall: string | null
          nearest_metro: string | null
          procedure_area_sqft: number | null
          procedure_area_sqm: number | null
          project_name: string | null
          property_sub_type: string | null
          property_type: string | null
          property_usage: string | null
          raw_data: Json | null
          reg_type: string | null
          rooms: string | null
          sqft_sale_price: number | null
          trans_group: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          actual_worth?: number | null
          area_name: string
          building_name?: string | null
          created_at?: string
          developer_name?: string | null
          has_parking?: boolean | null
          id?: string
          instance_date: string
          meter_sale_price?: number | null
          nearest_mall?: string | null
          nearest_metro?: string | null
          procedure_area_sqft?: number | null
          procedure_area_sqm?: number | null
          project_name?: string | null
          property_sub_type?: string | null
          property_type?: string | null
          property_usage?: string | null
          raw_data?: Json | null
          reg_type?: string | null
          rooms?: string | null
          sqft_sale_price?: number | null
          trans_group: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_worth?: number | null
          area_name?: string
          building_name?: string | null
          created_at?: string
          developer_name?: string | null
          has_parking?: boolean | null
          id?: string
          instance_date?: string
          meter_sale_price?: number | null
          nearest_mall?: string | null
          nearest_metro?: string | null
          procedure_area_sqft?: number | null
          procedure_area_sqm?: number | null
          project_name?: string | null
          property_sub_type?: string | null
          property_type?: string | null
          property_usage?: string | null
          raw_data?: Json | null
          reg_type?: string | null
          rooms?: string | null
          sqft_sale_price?: number | null
          trans_group?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketing_campaigns: {
        Row: {
          ad_spend: number | null
          campaign_id: string | null
          campaign_name: string
          clicks: number | null
          conversions: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          notes: string | null
          platform: string
          revenue_attributed: number | null
          updated_at: string
        }
        Insert: {
          ad_spend?: number | null
          campaign_id?: string | null
          campaign_name: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          date: string
          id?: string
          impressions?: number | null
          notes?: string | null
          platform: string
          revenue_attributed?: number | null
          updated_at?: string
        }
        Update: {
          ad_spend?: number | null
          campaign_id?: string | null
          campaign_name?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          notes?: string | null
          platform?: string
          revenue_attributed?: number | null
          updated_at?: string
        }
        Relationships: []
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
          onboarding_completed_at: string | null
          onboarding_step: number | null
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
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
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
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          stripe_customer_id?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          agent_id: string | null
          amenities: Json | null
          bathrooms: number
          bedrooms: number
          brokerage_id: string | null
          building_id: string | null
          community_id: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          developer_id: string | null
          developer_name: string | null
          expires_at: string | null
          floor_number: number | null
          furnishing: string | null
          highlights: Json | null
          id: string
          images: Json | null
          inquiries_count: number | null
          is_featured: boolean
          is_off_plan: boolean
          latitude: number | null
          listing_type: string | null
          location_area: string
          longitude: number | null
          parking_spaces: number | null
          payment_plan_json: Json | null
          price_aed: number
          property_type: string
          published_at: string | null
          rental_frequency: string | null
          rental_yield_estimate: number | null
          rera_permit_expiry: string | null
          rera_permit_number: string | null
          service_charge_per_sqft: number | null
          size_sqft: number
          slug: string
          status: string
          title: string
          total_floors: number | null
          updated_at: string
          video_url: string | null
          view_type: string | null
          views_count: number | null
          virtual_tour_url: string | null
          year_built: number | null
        }
        Insert: {
          agent_id?: string | null
          amenities?: Json | null
          bathrooms?: number
          bedrooms?: number
          brokerage_id?: string | null
          building_id?: string | null
          community_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          developer_name?: string | null
          expires_at?: string | null
          floor_number?: number | null
          furnishing?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          inquiries_count?: number | null
          is_featured?: boolean
          is_off_plan?: boolean
          latitude?: number | null
          listing_type?: string | null
          location_area: string
          longitude?: number | null
          parking_spaces?: number | null
          payment_plan_json?: Json | null
          price_aed: number
          property_type?: string
          published_at?: string | null
          rental_frequency?: string | null
          rental_yield_estimate?: number | null
          rera_permit_expiry?: string | null
          rera_permit_number?: string | null
          service_charge_per_sqft?: number | null
          size_sqft: number
          slug: string
          status?: string
          title: string
          total_floors?: number | null
          updated_at?: string
          video_url?: string | null
          view_type?: string | null
          views_count?: number | null
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Update: {
          agent_id?: string | null
          amenities?: Json | null
          bathrooms?: number
          bedrooms?: number
          brokerage_id?: string | null
          building_id?: string | null
          community_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer_id?: string | null
          developer_name?: string | null
          expires_at?: string | null
          floor_number?: number | null
          furnishing?: string | null
          highlights?: Json | null
          id?: string
          images?: Json | null
          inquiries_count?: number | null
          is_featured?: boolean
          is_off_plan?: boolean
          latitude?: number | null
          listing_type?: string | null
          location_area?: string
          longitude?: number | null
          parking_spaces?: number | null
          payment_plan_json?: Json | null
          price_aed?: number
          property_type?: string
          published_at?: string | null
          rental_frequency?: string | null
          rental_yield_estimate?: number | null
          rera_permit_expiry?: string | null
          rera_permit_number?: string | null
          service_charge_per_sqft?: number | null
          size_sqft?: number
          slug?: string
          status?: string
          title?: string
          total_floors?: number | null
          updated_at?: string
          video_url?: string | null
          view_type?: string | null
          views_count?: number | null
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      property_features: {
        Row: {
          feature_id: string
          id: string
          property_id: string
        }
        Insert: {
          feature_id: string
          id?: string
          property_id: string
        }
        Update: {
          feature_id?: string
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_features_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_floor_plans: {
        Row: {
          created_at: string
          floor_number: number | null
          id: string
          order_index: number | null
          property_id: string
          storage_path: string | null
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          floor_number?: number | null
          id?: string
          order_index?: number | null
          property_id: string
          storage_path?: string | null
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          floor_number?: number | null
          id?: string
          order_index?: number | null
          property_id?: string
          storage_path?: string | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_floor_plans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          height: number | null
          id: string
          is_primary: boolean | null
          order_index: number | null
          property_id: string
          storage_path: string | null
          url: string
          width: number | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean | null
          order_index?: number | null
          property_id: string
          storage_path?: string | null
          url: string
          width?: number | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean | null
          order_index?: number | null
          property_id?: string
          storage_path?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_inquiries: {
        Row: {
          agent_id: string | null
          created_at: string
          email: string
          id: string
          inquiry_type: string | null
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          property_id: string
          source: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string | null
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          property_id: string
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string | null
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          property_id?: string
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inquiries_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          created_at: string
          id: string
          property_id: string
          session_id: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      get_directory_members: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          budget_range: string
          country: string
          created_at: string
          full_name: string
          id: string
          investment_goal: string
          looking_for: string
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          timeline: string
        }[]
      }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          budget_range: string
          country: string
          created_at: string
          full_name: string
          id: string
          investment_goal: string
          linkedin_url: string
          looking_for: string
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          timeline: string
        }[]
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
      agent_tier: "basic" | "preferred" | "premium"
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
      agent_tier: ["basic", "preferred", "premium"],
      app_role: ["admin", "moderator", "user"],
      channel_visibility: ["all_members", "elite_only"],
      membership_status: ["active", "canceled", "trial", "expired"],
      membership_tier: ["free", "investor", "elite"],
    },
  },
} as const
