// This file can be generated using Supabase CLI:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

// For now, we provide a minimal type structure
// In production, generate this file from your Supabase project

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          timezone: string;
          created_at: string;
          owner_user_id: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          name: string;
          timezone?: string;
          created_at?: string;
          owner_user_id: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          name?: string;
          timezone?: string;
          created_at?: string;
          owner_user_id?: string;
          metadata?: Record<string, any>;
        };
      };
      employees: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          email: string | null;
          name: string;
          role: string | null;
          color: string | null;
          is_manager: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string | null;
          email?: string | null;
          name: string;
          role?: string | null;
          color?: string | null;
          is_manager?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string | null;
          email?: string | null;
          name?: string;
          role?: string | null;
          color?: string | null;
          is_manager?: boolean;
          created_at?: string;
        };
      };
      shifts: {
        Row: {
          id: string;
          business_id: string;
          employee_id: string | null;
          start: string;
          end: string;
          role: string | null;
          notes: string | null;
          source_text: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          employee_id?: string | null;
          start: string;
          end: string;
          role?: string | null;
          notes?: string | null;
          source_text?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          employee_id?: string | null;
          start?: string;
          end?: string;
          role?: string | null;
          notes?: string | null;
          source_text?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

