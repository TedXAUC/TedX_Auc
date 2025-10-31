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
      bookings: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          event_title: string
          id: number
          seat_count: number
          selected_seats: string[]
          total_amount: number
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          event_title: string
          id?: number
          seat_count: number
          selected_seats: string[]
          total_amount: number
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          event_title?: string
          id?: number
          seat_count?: number
          selected_seats?: string[]
          total_amount?: number
          transaction_id?: string | null
        }
        Relationships: []
      }
      contacts: { // <-- NEW TABLE DEFINITION
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          email: string
          id: number
          message: string | null
          name: string
          phone: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          id?: number
          message?: string | null
          name: string
          phone?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          id?: number
          message?: string | null
          name?: string
          phone?: string | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      events: { // <--- NEW EVENTS TABLE ADDED
        Row: {
          id: number
          created_at: string
          title: string
          date: string
          time: string
          location: string
          description: string
          image_url: string
          status: "ongoing" | "upcoming" | "completed"
          tickets_available: boolean
          gallery_images: string[] | null
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          date: string
          time: string
          location: string
          description: string
          image_url: string
          status: "ongoing" | "upcoming" | "completed"
          tickets_available: boolean
          gallery_images?: string[] | null
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          date?: string
          time?: string
          location?: string
          description?: string
          image_url?: string
          status?: "ongoing" | "upcoming" | "completed"
          tickets_available?: boolean
          gallery_images?: string[] | null
        }
        Relationships: []
      }
      speakers: {
        Row: {
          id: number
          created_at: string
          name: string
          image_url: string
          profession: string
          about_text: string
          instagram_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          name: string
          image_url: string
          profession: string
          about_text: string
          instagram_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          name?: string
          image_url?: string
          profession?: string
          about_text?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
        }
        Relationships: []
      }
      speaker_registrations: { // <-- NEW TABLE DEFINITION
        Row: {
          created_at: string
          gender: string
          id: number
          message: string
          name: string
          occupation: string
        }
        Insert: {
          created_at?: string
          gender: string
          id?: number
          message: string
          name: string
          occupation: string
        }
        Update: {
          created_at?: string
          gender?: string
          id?: number
          message?: string
          name?: string
          occupation?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// (The rest of the helper types remain unchanged)
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
  ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never