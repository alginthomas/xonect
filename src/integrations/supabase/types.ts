export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: {
          click_rate: number
          created_at: string
          id: string
          lead_ids: string[] | null
          name: string
          open_rate: number
          reply_rate: number
          sent_count: number
          status: Database["public"]["Enums"]["campaign_status"]
          template_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          click_rate?: number
          created_at?: string
          id?: string
          lead_ids?: string[] | null
          name: string
          open_rate?: number
          reply_rate?: number
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          click_rate?: number
          created_at?: string
          id?: string
          lead_ids?: string[] | null
          name?: string
          open_rate?: number
          reply_rate?: number
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          criteria: Json | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_rate_limits: {
        Row: {
          created_at: string | null
          email_count: number | null
          id: string
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          email_count?: number | null
          id?: string
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          email_count?: number | null
          id?: string
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          last_used: string | null
          name: string
          subject: string
          updated_at: string
          user_id: string | null
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          last_used?: string | null
          name: string
          subject: string
          updated_at?: string
          user_id?: string | null
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          last_used?: string | null
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          category_id: string | null
          created_at: string
          failed_imports: number | null
          id: string
          metadata: Json | null
          name: string
          source_file: string | null
          successful_imports: number | null
          total_leads: number | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          failed_imports?: number | null
          id?: string
          metadata?: Json | null
          name: string
          source_file?: string | null
          successful_imports?: number | null
          total_leads?: number | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          failed_imports?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          source_file?: string | null
          successful_imports?: number | null
          total_leads?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_lists: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          is_smart: boolean | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_smart?: boolean | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_smart?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          category_id: string | null
          company: string
          company_size: Database["public"]["Enums"]["company_size_category"]
          completeness_score: number
          created_at: string
          department: string | null
          email: string
          emails_sent: number
          facebook_url: string | null
          first_name: string
          id: string
          import_batch_id: string | null
          industry: string | null
          last_contact_date: string | null
          last_name: string
          linkedin: string | null
          location: string | null
          organization_founded: number | null
          organization_website: string | null
          personal_email: string | null
          phone: string | null
          photo_url: string | null
          remarks: string | null
          seniority: Database["public"]["Enums"]["seniority_level"]
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          title: string
          twitter_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          company: string
          company_size?: Database["public"]["Enums"]["company_size_category"]
          completeness_score?: number
          created_at?: string
          department?: string | null
          email: string
          emails_sent?: number
          facebook_url?: string | null
          first_name: string
          id?: string
          import_batch_id?: string | null
          industry?: string | null
          last_contact_date?: string | null
          last_name: string
          linkedin?: string | null
          location?: string | null
          organization_founded?: number | null
          organization_website?: string | null
          personal_email?: string | null
          phone?: string | null
          photo_url?: string | null
          remarks?: string | null
          seniority?: Database["public"]["Enums"]["seniority_level"]
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          title: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          company?: string
          company_size?: Database["public"]["Enums"]["company_size_category"]
          completeness_score?: number
          created_at?: string
          department?: string | null
          email?: string
          emails_sent?: number
          facebook_url?: string | null
          first_name?: string
          id?: string
          import_batch_id?: string | null
          industry?: string | null
          last_contact_date?: string | null
          last_name?: string
          linkedin?: string | null
          location?: string | null
          organization_founded?: number | null
          organization_website?: string | null
          personal_email?: string | null
          phone?: string | null
          photo_url?: string | null
          remarks?: string | null
          seniority?: Database["public"]["Enums"]["seniority_level"]
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          title?: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_duplicate_leads: {
        Args: { lead_ids: string[] }
        Returns: number
      }
    }
    Enums: {
      campaign_status: "Draft" | "Active" | "Paused" | "Completed"
      company_size_category:
        | "Small (1-50)"
        | "Medium (51-200)"
        | "Large (201-1000)"
        | "Enterprise (1000+)"
      lead_status:
        | "New"
        | "Contacted"
        | "Opened"
        | "Clicked"
        | "Replied"
        | "Qualified"
        | "Unqualified"
        | "Call Back"
        | "Unresponsive"
        | "Not Interested"
        | "Interested"
      seniority_level:
        | "Junior"
        | "Mid-level"
        | "Senior"
        | "Executive"
        | "C-level"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      campaign_status: ["Draft", "Active", "Paused", "Completed"],
      company_size_category: [
        "Small (1-50)",
        "Medium (51-200)",
        "Large (201-1000)",
        "Enterprise (1000+)",
      ],
      lead_status: [
        "New",
        "Contacted",
        "Opened",
        "Clicked",
        "Replied",
        "Qualified",
        "Unqualified",
        "Call Back",
        "Unresponsive",
        "Not Interested",
        "Interested",
      ],
      seniority_level: [
        "Junior",
        "Mid-level",
        "Senior",
        "Executive",
        "C-level",
      ],
    },
  },
} as const
