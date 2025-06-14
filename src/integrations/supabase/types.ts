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
          organization_id: string | null
          reply_rate: number
          sent_count: number
          status: Database["public"]["Enums"]["campaign_status"]
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          click_rate?: number
          created_at?: string
          id?: string
          lead_ids?: string[] | null
          name: string
          open_rate?: number
          organization_id?: string | null
          reply_rate?: number
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          click_rate?: number
          created_at?: string
          id?: string
          lead_ids?: string[] | null
          name?: string
          open_rate?: number
          organization_id?: string | null
          reply_rate?: number
          sent_count?: number
          status?: Database["public"]["Enums"]["campaign_status"]
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
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
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          criteria?: Json | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          organization_id: string | null
          subject: string
          updated_at: string
          user_id: string
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          last_used?: string | null
          name: string
          organization_id?: string | null
          subject: string
          updated_at?: string
          user_id: string
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          last_used?: string | null
          name?: string
          organization_id?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          category_id: string | null
          created_at: string
          failed_imports: number | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string | null
          source_file: string | null
          successful_imports: number | null
          total_leads: number | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          failed_imports?: number | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          source_file?: string | null
          successful_imports?: number | null
          total_leads?: number | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          failed_imports?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          source_file?: string | null
          successful_imports?: number | null
          total_leads?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_smart?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_smart?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          activity_log: Json | null
          assigned_to: string | null
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
          organization_id: string | null
          organization_website: string | null
          personal_email: string | null
          phone: string | null
          photo_url: string | null
          remarks: string | null
          remarks_history: Json | null
          seniority: Database["public"]["Enums"]["seniority_level"]
          status: Database["public"]["Enums"]["lead_status"]
          tags: string[] | null
          team_id: string | null
          title: string
          twitter_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_log?: Json | null
          assigned_to?: string | null
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
          organization_id?: string | null
          organization_website?: string | null
          personal_email?: string | null
          phone?: string | null
          photo_url?: string | null
          remarks?: string | null
          remarks_history?: Json | null
          seniority?: Database["public"]["Enums"]["seniority_level"]
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          team_id?: string | null
          title: string
          twitter_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_log?: Json | null
          assigned_to?: string | null
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
          organization_id?: string | null
          organization_website?: string | null
          personal_email?: string | null
          phone?: string | null
          photo_url?: string | null
          remarks?: string | null
          remarks_history?: Json | null
          seniority?: Database["public"]["Enums"]["seniority_level"]
          status?: Database["public"]["Enums"]["lead_status"]
          tags?: string[] | null
          team_id?: string | null
          title?: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      mailchimp_campaigns: {
        Row: {
          audience_id: string
          audience_name: string | null
          campaign_name: string
          created_at: string
          id: string
          leads_count: number | null
          mailchimp_campaign_id: string
          sent_at: string | null
          status: string
          subject_line: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_id: string
          audience_name?: string | null
          campaign_name: string
          created_at?: string
          id?: string
          leads_count?: number | null
          mailchimp_campaign_id: string
          sent_at?: string | null
          status?: string
          subject_line: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_id?: string
          audience_name?: string | null
          campaign_name?: string
          created_at?: string
          id?: string
          leads_count?: number | null
          mailchimp_campaign_id?: string
          sent_at?: string | null
          status?: string
          subject_line?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mailchimp_integrations: {
        Row: {
          access_token: string
          account_id: string | null
          account_name: string | null
          created_at: string
          id: string
          is_active: boolean
          refresh_token: string | null
          server_prefix: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          refresh_token?: string | null
          server_prefix: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string | null
          account_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          refresh_token?: string | null
          server_prefix?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mailchimp_lead_syncs: {
        Row: {
          audience_id: string
          created_at: string
          error_message: string | null
          id: string
          lead_id: string | null
          mailchimp_member_id: string | null
          sync_status: string
          synced_at: string | null
          user_id: string
        }
        Insert: {
          audience_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id?: string | null
          mailchimp_member_id?: string | null
          sync_status?: string
          synced_at?: string | null
          user_id: string
        }
        Update: {
          audience_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          lead_id?: string | null
          mailchimp_member_id?: string | null
          sync_status?: string
          synced_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mailchimp_lead_syncs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_organization_id: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          territory: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          territory?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          territory?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
      get_current_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_minimum_role: {
        Args: {
          _organization_id: string
          _min_role: Database["public"]["Enums"]["organization_role"]
        }
        Returns: boolean
      }
      has_organization_role: {
        Args: {
          _organization_id: string
          _role: Database["public"]["Enums"]["organization_role"]
        }
        Returns: boolean
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
        | "Send Email"
      organization_role:
        | "owner"
        | "admin"
        | "team_manager"
        | "sales_rep"
        | "viewer"
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
        "Send Email",
      ],
      organization_role: [
        "owner",
        "admin",
        "team_manager",
        "sales_rep",
        "viewer",
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
