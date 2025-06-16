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
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointment_inventory: {
        Row: {
          appointment_id: string
          cost_per_unit: number | null
          created_at: string | null
          id: string
          inventory_item_id: string
          quantity_used: number
          total_cost: number | null
        }
        Insert: {
          appointment_id: string
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id: string
          quantity_used: number
          total_cost?: number | null
        }
        Update: {
          appointment_id?: string
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          quantity_used?: number
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_inventory_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_inventory_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          blood_exams: Json | null
          cost: number | null
          created_at: string | null
          created_by: string
          doctor_id: string
          duration_minutes: number | null
          estimated_tubes_needed: number | null
          exam_type_id: string
          id: string
          notes: string | null
          patient_email: string | null
          patient_name: string
          patient_phone: string | null
          scheduled_date: string
          status: string | null
          total_blood_volume_ml: number | null
          unit_id: string
          updated_at: string | null
        }
        Insert: {
          blood_exams?: Json | null
          cost?: number | null
          created_at?: string | null
          created_by: string
          doctor_id: string
          duration_minutes?: number | null
          estimated_tubes_needed?: number | null
          exam_type_id: string
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_name: string
          patient_phone?: string | null
          scheduled_date: string
          status?: string | null
          total_blood_volume_ml?: number | null
          unit_id: string
          updated_at?: string | null
        }
        Update: {
          blood_exams?: Json | null
          cost?: number | null
          created_at?: string | null
          created_by?: string
          doctor_id?: string
          duration_minutes?: number | null
          estimated_tubes_needed?: number | null
          exam_type_id?: string
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_name?: string
          patient_phone?: string | null
          scheduled_date?: string
          status?: string | null
          total_blood_volume_ml?: number | null
          unit_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_exam_panels: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          total_volume_ml: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          total_volume_ml?: number
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          total_volume_ml?: number
        }
        Relationships: []
      }
      blood_exam_types: {
        Row: {
          active: boolean | null
          category: string
          code: string | null
          created_at: string | null
          id: string
          name: string
          preparation_instructions: string | null
          preparation_required: boolean | null
          reference_values: Json | null
          sample_volume_ml: number
          tube_type: string
        }
        Insert: {
          active?: boolean | null
          category?: string
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
          preparation_instructions?: string | null
          preparation_required?: boolean | null
          reference_values?: Json | null
          sample_volume_ml?: number
          tube_type?: string
        }
        Update: {
          active?: boolean | null
          category?: string
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          preparation_instructions?: string | null
          preparation_required?: boolean | null
          reference_values?: Json | null
          sample_volume_ml?: number
          tube_type?: string
        }
        Relationships: []
      }
      consumption_data: {
        Row: {
          average_daily_consumption: number | null
          created_at: string | null
          id: string
          item_id: string
          period_end: string
          period_start: string
          quantity_consumed: number
          total_cost: number | null
          unit_id: string
        }
        Insert: {
          average_daily_consumption?: number | null
          created_at?: string | null
          id?: string
          item_id: string
          period_end: string
          period_start: string
          quantity_consumed: number
          total_cost?: number | null
          unit_id: string
        }
        Update: {
          average_daily_consumption?: number | null
          created_at?: string | null
          id?: string
          item_id?: string
          period_end?: string
          period_start?: string
          quantity_consumed?: number
          total_cost?: number | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumption_data_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumption_data_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          active: boolean | null
          created_at: string | null
          crm: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          specialty: string | null
          unit_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          crm?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          specialty?: string | null
          unit_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          crm?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          specialty?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_type_materials: {
        Row: {
          created_at: string | null
          exam_type_id: string
          id: string
          inventory_item_id: string
          is_optional: boolean | null
          material_type: string | null
          notes: string | null
          quantity_required: number
          volume_per_exam: number | null
        }
        Insert: {
          created_at?: string | null
          exam_type_id: string
          id?: string
          inventory_item_id: string
          is_optional?: boolean | null
          material_type?: string | null
          notes?: string | null
          quantity_required?: number
          volume_per_exam?: number | null
        }
        Update: {
          created_at?: string | null
          exam_type_id?: string
          id?: string
          inventory_item_id?: string
          is_optional?: boolean | null
          material_type?: string | null
          notes?: string | null
          quantity_required?: number
          volume_per_exam?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_type_materials_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_type_materials_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_types: {
        Row: {
          active: boolean | null
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          preparation_instructions: string | null
          requires_preparation: boolean | null
          unit_id: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          preparation_instructions?: string | null
          requires_preparation?: boolean | null
          unit_id?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          preparation_instructions?: string | null
          requires_preparation?: boolean | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_types_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          active: boolean | null
          category_id: string
          cost_per_unit: number | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          expiry_date: string | null
          id: string
          lot_number: string | null
          max_stock: number | null
          min_stock: number | null
          name: string
          sku: string | null
          storage_location: string | null
          supplier: string | null
          unit_id: string
          unit_measure: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id: string
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          lot_number?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          sku?: string | null
          storage_location?: string | null
          supplier?: string | null
          unit_id: string
          unit_measure: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          lot_number?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          sku?: string | null
          storage_location?: string | null
          supplier?: string | null
          unit_id?: string
          unit_measure?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          movement_type: string
          performed_by: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          movement_type: string
          performed_by: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          movement_type?: string
          performed_by?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_exams: {
        Row: {
          exam_type_id: string | null
          id: string
          panel_id: string | null
        }
        Insert: {
          exam_type_id?: string | null
          id?: string
          panel_id?: string | null
        }
        Update: {
          exam_type_id?: string | null
          id?: string
          panel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_exams_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "blood_exam_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_exams_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "blood_exam_panels"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          position: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          current_value: number | null
          description: string | null
          expiry_date: string | null
          id: string
          item_id: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          threshold_value: number | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          item_id: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          threshold_value?: number | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          threshold_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_alerts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      units: {
        Row: {
          active: boolean | null
          address: string | null
          code: string
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
          phone: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          code: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          code?: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
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
      calculate_blood_volume_needed: {
        Args: { p_exam_ids: string[] }
        Returns: {
          total_volume_ml: number
          tubes_needed: number
          exam_details: Json
        }[]
      }
      calculate_detailed_exam_materials: {
        Args: { p_exam_type_id: string; p_blood_exams?: string[] }
        Returns: {
          inventory_item_id: string
          item_name: string
          quantity_required: number
          current_stock: number
          reserved_stock: number
          available_stock: number
          sufficient_stock: boolean
          estimated_cost: number
          material_type: string
        }[]
      }
      calculate_exam_materials: {
        Args: { p_exam_type_id: string }
        Returns: {
          inventory_item_id: string
          item_name: string
          quantity_required: number
          current_stock: number
          available_stock: number
          sufficient_stock: boolean
          estimated_cost: number
        }[]
      }
      create_first_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "supervisor"
      user_status: "active" | "inactive" | "pending"
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
      app_role: ["admin", "user", "supervisor"],
      user_status: ["active", "inactive", "pending"],
    },
  },
} as const
