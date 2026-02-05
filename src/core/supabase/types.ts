// Database types for World Gate
// Human table added in Phase v0.0.2 (gate schema)

export type Database = {
  gate: {
    Tables: {
      human: {
        Row: {
          id: string
          action: string
          nullifier_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          nullifier_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          nullifier_hash?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
  public: {
    Tables: {
      // Intentionally empty; use gate schema for app tables
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience type aliases
export type Human = Database['gate']['Tables']['human']['Row']
export type HumanInsert = Database['gate']['Tables']['human']['Insert']
