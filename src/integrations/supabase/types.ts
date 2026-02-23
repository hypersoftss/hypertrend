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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      allowed_domains: {
        Row: {
          api_key_id: string
          created_at: string | null
          domain: string
          id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          domain: string
          id?: string
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          domain?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowed_domains_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_ips: {
        Row: {
          api_key_id: string
          created_at: string | null
          id: string
          ip_address: string
        }
        Insert: {
          api_key_id: string
          created_at?: string | null
          id?: string
          ip_address: string
        }
        Update: {
          api_key_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowed_ips_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key: string
          calls_today: number | null
          calls_total: number | null
          created_at: string | null
          daily_limit: number | null
          expires_at: string | null
          id: string
          key_name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          calls_today?: number | null
          calls_total?: number | null
          created_at?: string | null
          daily_limit?: number | null
          expires_at?: string | null
          id?: string
          key_name: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          calls_today?: number | null
          calls_total?: number | null
          created_at?: string | null
          daily_limit?: number | null
          expires_at?: string | null
          id?: string
          key_name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          domain: string | null
          duration: string | null
          endpoint: string
          error_message: string | null
          game_type: string | null
          id: string
          ip_address: string | null
          response_time_ms: number | null
          status: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          domain?: string | null
          duration?: string | null
          endpoint: string
          error_message?: string | null
          game_type?: string | null
          id?: string
          ip_address?: string | null
          response_time_ms?: number | null
          status?: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          domain?: string | null
          duration?: string | null
          endpoint?: string
          error_message?: string | null
          game_type?: string | null
          id?: string
          ip_address?: string | null
          response_time_ms?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_orders: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string | null
          id: string
          package_id: string | null
          price_inr: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
          utr_number: string | null
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string | null
          id?: string
          package_id?: string | null
          price_inr: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          utr_number?: string | null
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          package_id?: string | null
          price_inr?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          utr_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coin_orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "coin_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_packages: {
        Row: {
          coins: number
          created_at: string | null
          id: string
          is_active: boolean
          name: string
          price_inr: number
          updated_at: string | null
        }
        Insert: {
          coins: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_inr: number
          updated_at?: string | null
        }
        Update: {
          coins?: number
          created_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_inr?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          admin_id: string | null
          amount: number
          api_key_id: string | null
          balance_after: number
          created_at: string | null
          id: string
          package_id: string | null
          reason: string
          type: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          api_key_id?: string | null
          balance_after?: number
          created_at?: string | null
          id?: string
          package_id?: string | null
          reason: string
          type: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          api_key_id?: string | null
          balance_after?: number
          created_at?: string | null
          id?: string
          package_id?: string | null
          reason?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "coin_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          coin_balance: number
          coin_cost_per_key: number
          created_at: string | null
          email: string | null
          id: string
          telegram_id: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          coin_balance?: number
          coin_cost_per_key?: number
          created_at?: string | null
          email?: string | null
          id?: string
          telegram_id?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          coin_balance?: number
          coin_cost_per_key?: number
          created_at?: string | null
          email?: string | null
          id?: string
          telegram_id?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      telegram_logs: {
        Row: {
          chat_id: string
          created_at: string | null
          error_message: string | null
          id: string
          message: string | null
          message_type: string
          status: string
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          message_type: string
          status?: string
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          message_type?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "reseller"
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
      app_role: ["admin", "user", "reseller"],
    },
  },
} as const
