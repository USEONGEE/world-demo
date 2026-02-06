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
      siwe_challenge: {
        Row: {
          id: string
          human_id: string
          address: string
          nonce: string
          issued_at: string
          expiration_time: string
          used: boolean
        }
        Insert: {
          id?: string
          human_id: string
          address: string
          nonce: string
          issued_at: string
          expiration_time: string
          used?: boolean
        }
        Update: {
          id?: string
          human_id?: string
          address?: string
          nonce?: string
          issued_at?: string
          expiration_time?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'siwe_challenge_human_id_fkey'
            columns: ['human_id']
            referencedRelation: 'human'
            referencedColumns: ['id']
          }
        ]
      }
      wallet_binding: {
        Row: {
          id: string
          human_id: string
          chain: string
          address: string
          verified_at: string
          verification_method: string
        }
        Insert: {
          id?: string
          human_id: string
          chain: string
          address: string
          verified_at?: string
          verification_method?: string
        }
        Update: {
          id?: string
          human_id?: string
          chain?: string
          address?: string
          verified_at?: string
          verification_method?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wallet_binding_human_id_fkey'
            columns: ['human_id']
            referencedRelation: 'human'
            referencedColumns: ['id']
          }
        ]
      }
      bridge_token: {
        Row: {
          id: string
          human_id: string
          code: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          human_id: string
          code: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          human_id?: string
          code?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bridge_token_human_id_fkey'
            columns: ['human_id']
            referencedRelation: 'human'
            referencedColumns: ['id']
          }
        ]
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

export type SiweChallenge = Database['gate']['Tables']['siwe_challenge']['Row']
export type SiweChallengeInsert = Database['gate']['Tables']['siwe_challenge']['Insert']

export type WalletBinding = Database['gate']['Tables']['wallet_binding']['Row']
export type WalletBindingInsert = Database['gate']['Tables']['wallet_binding']['Insert']

export type BridgeToken = Database['gate']['Tables']['bridge_token']['Row']
export type BridgeTokenInsert = Database['gate']['Tables']['bridge_token']['Insert']
