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
      analytics: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string
          metadata: Json | null
          property_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          property_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
          property_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      listing_requests: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      owner_access_audit: {
        Row: {
          action: string
          created_at: string
          id: number
          metadata: Json
          owner_id: string | null
          property_id: string | null
          token_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: number
          metadata?: Json
          owner_id?: string | null
          property_id?: string | null
          token_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: number
          metadata?: Json
          owner_id?: string | null
          property_id?: string | null
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_access_audit_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_access_audit_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_access_audit_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "owner_access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_access_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string | null
          last_used_at: string | null
          owner_id: string
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          last_used_at?: string | null
          owner_id: string
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          last_used_at?: string | null
          owner_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_access_tokens_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_property_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          owner_id: string
          property_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          owner_id: string
          property_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          owner_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_property_assignments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_property_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          area: string
          area_size: number
          bathrooms: number
          bedrooms: number
          card_images: string[] | null
          contact_email: string | null
          contact_location: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          features: string[] | null
          gallery_images: string[] | null
          group_type: string | null
          id: string
          images: string[] | null
          installment_period: string | null
          installment_value: number | null
          installments_available: boolean | null
          is_hidden: boolean
          is_negotiable: boolean | null
          listing_type: string | null
          location: string
          max_guests: number | null
          price: number
          price_weekend: number | null
          pricing_type: string | null
          rent_count: number | null
          slug: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          area: string
          area_size: number
          bathrooms?: number
          bedrooms?: number
          card_images?: string[] | null
          contact_email?: string | null
          contact_location?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: string[] | null
          gallery_images?: string[] | null
          group_type?: string | null
          id?: string
          images?: string[] | null
          installment_period?: string | null
          installment_value?: number | null
          installments_available?: boolean | null
          is_hidden?: boolean
          is_negotiable?: boolean | null
          listing_type?: string | null
          location: string
          max_guests?: number | null
          price: number
          price_weekend?: number | null
          pricing_type?: string | null
          rent_count?: number | null
          slug?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          area?: string
          area_size?: number
          bathrooms?: number
          bedrooms?: number
          card_images?: string[] | null
          contact_email?: string | null
          contact_location?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: string[] | null
          gallery_images?: string[] | null
          group_type?: string | null
          id?: string
          images?: string[] | null
          installment_period?: string | null
          installment_value?: number | null
          installments_available?: boolean | null
          is_hidden?: boolean
          is_negotiable?: boolean | null
          listing_type?: string | null
          location?: string
          max_guests?: number | null
          price?: number
          price_weekend?: number | null
          pricing_type?: string | null
          rent_count?: number | null
          slug?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_owners: {
        Row: {
          created_at: string
          created_by: string | null
          display_name: string
          email: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_name: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          admin_notes: string | null
          booking_group_type: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          customer_email: string | null
          customer_location: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          id: string
          num_guests: number | null
          price_per_night: number | null
          pricing_type: string
          property_id: string
          status: string
          total_price: number | null
          updated_at: string
          whatsapp_notified: boolean | null
          whatsapp_notified_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          booking_group_type?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          customer_email?: string | null
          customer_location?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone: string
          id?: string
          num_guests?: number | null
          price_per_night?: number | null
          pricing_type?: string
          property_id: string
          status?: string
          total_price?: number | null
          updated_at?: string
          whatsapp_notified?: boolean | null
          whatsapp_notified_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          booking_group_type?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          customer_email?: string | null
          customer_location?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          id?: string
          num_guests?: number | null
          price_per_night?: number | null
          pricing_type?: string
          property_id?: string
          status?: string
          total_price?: number | null
          updated_at?: string
          whatsapp_notified?: boolean | null
          whatsapp_notified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      villa_availability: {
        Row: {
          available_from: string
          available_to: string
          created_at: string
          id: string
          notes: string | null
          price_override: number | null
          property_id: string
          updated_at: string
        }
        Insert: {
          available_from: string
          available_to: string
          created_at?: string
          id?: string
          notes?: string | null
          price_override?: number | null
          property_id: string
          updated_at?: string
        }
        Update: {
          available_from?: string
          available_to?: string
          created_at?: string
          id?: string
          notes?: string | null
          price_override?: number | null
          property_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      villa_price_periods: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          price_override: number
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          price_override: number
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          price_override?: number
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "villa_price_periods_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_revoke_owner_token: {
        Args: { p_admin_id: string; p_owner_id: string }
        Returns: boolean
      }
      admin_rotate_owner_token: {
        Args: {
          p_admin_id: string
          p_label?: string
          p_owner_id: string
          p_token_hash: string
        }
        Returns: string
      }
      admin_save_property_owner: {
        Args: {
          p_admin_id: string
          p_display_name: string
          p_email: string
          p_is_active: boolean
          p_owner_id: string
          p_phone: string
          p_property_ids: string[]
        }
        Returns: string
      }
      count_public_page_views: { Args: never; Returns: number }
      count_unique_visitors: { Args: never; Returns: number }
      get_visit_stats: { Args: { p_timezone?: string }; Returns: Json }
      get_booked_ranges: {
        Args: { p_property_ids: string[]; p_from?: string; p_to?: string }
        Returns: {
          check_in: string
          check_out: string
          property_id: string
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      owner_portal_snapshot: { Args: { p_token_hash: string }; Returns: Json }
      owner_replace_availability: {
        Args: { p_periods: Json; p_property_id: string; p_token_hash: string }
        Returns: Json
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
