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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          code: string
          created_at: string
          description: string
          emoji: string
          kind: string
          name: string
          threshold: number
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          emoji: string
          kind: string
          name: string
          threshold?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          emoji?: string
          kind?: string
          name?: string
          threshold?: number
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          circle_slug: string
          joined_at: string
          user_id: string
        }
        Insert: {
          circle_slug: string
          joined_at?: string
          user_id: string
        }
        Update: {
          circle_slug?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_slug_fkey"
            columns: ["circle_slug"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["slug"]
          },
        ]
      }
      circles: {
        Row: {
          created_at: string
          description: string
          emoji: string
          journey: string
          name: string
          slug: string
          subcategory: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          emoji: string
          journey: string
          name: string
          slug: string
          subcategory?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          emoji?: string
          journey?: string
          name?: string
          slug?: string
          subcategory?: string | null
        }
        Relationships: []
      }
      encouragements: {
        Row: {
          created_at: string
          giver_id: string
          id: string
          kind: Database["public"]["Enums"]["encouragement_kind"]
          post_id: string
        }
        Insert: {
          created_at?: string
          giver_id: string
          id?: string
          kind: Database["public"]["Enums"]["encouragement_kind"]
          post_id: string
        }
        Update: {
          created_at?: string
          giver_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["encouragement_kind"]
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encouragements_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_checkins: {
        Row: {
          created_at: string
          day: string
          id: string
          mood: Database["public"]["Enums"]["mood_kind"]
          user_id: string
        }
        Insert: {
          created_at?: string
          day?: string
          id?: string
          mood: Database["public"]["Enums"]["mood_kind"]
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          mood?: Database["public"]["Enums"]["mood_kind"]
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          community: string | null
          created_at: string
          goal: string
          id: string
          is_anonymous: boolean
          struggle: string
          win: string
        }
        Insert: {
          author_id: string
          community?: string | null
          created_at?: string
          goal: string
          id?: string
          is_anonymous?: boolean
          struggle: string
          win: string
        }
        Update: {
          author_id?: string
          community?: string | null
          created_at?: string
          goal?: string
          id?: string
          is_anonymous?: boolean
          struggle?: string
          win?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          exams: string[]
          id: string
          journey: string | null
          onboarded: boolean
          subcategories: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          exams?: string[]
          id: string
          journey?: string | null
          onboarded?: boolean
          subcategories?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          exams?: string[]
          id?: string
          journey?: string | null
          onboarded?: boolean
          subcategories?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_code: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_code: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_code?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_circle_feed: {
        Args: { _slug: string }
        Returns: {
          author_id: string
          created_at: string
          goal: string
          id: string
          is_anonymous: boolean
          struggle: string
          win: string
        }[]
      }
      get_community_counts: {
        Args: never
        Returns: {
          community: string
          count: number
        }[]
      }
      get_encouragement_stats: {
        Args: { _user_id: string }
        Returns: {
          given_this_week: number
          given_total: number
        }[]
      }
      get_mood_history: {
        Args: { _days?: number; _user_id: string }
        Returns: {
          day: string
          mood: string
        }[]
      }
      get_posts_feed: {
        Args: { _community?: string }
        Returns: {
          author_id: string
          community: string
          created_at: string
          goal: string
          id: string
          is_anonymous: boolean
          struggle: string
          win: string
        }[]
      }
      get_posts_redacted: {
        Args: { _ids: string[] }
        Returns: {
          author_id: string
          id: string
          is_anonymous: boolean
          win: string
        }[]
      }
    }
    Enums: {
      encouragement_kind: "understand" | "keep_going" | "not_alone" | "proud"
      mood_kind:
        | "great"
        | "good"
        | "okay"
        | "struggling"
        | "exhausted"
        | "peaceful"
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
      encouragement_kind: ["understand", "keep_going", "not_alone", "proud"],
      mood_kind: [
        "great",
        "good",
        "okay",
        "struggling",
        "exhausted",
        "peaceful",
      ],
    },
  },
} as const
