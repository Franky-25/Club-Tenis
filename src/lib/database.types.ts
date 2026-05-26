export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      courts: {
        Row: {
          id: string
          name: string
          status: 'operativo' | 'mantencion'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: 'operativo' | 'mantencion'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'operativo' | 'mantencion'
          created_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          player_id: string
          court_id: string
          reservation_date: string
          start_time: string
          end_time: string
          status: 'active' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          court_id: string
          reservation_date: string
          start_time: string
          end_time: string
          status?: 'active' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          court_id?: string
          reservation_date?: string
          start_time?: string
          end_time?: string
          status?: 'active' | 'cancelled'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reservations_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_player_id_fkey'
            columns: ['player_id']
            isOneToOne: false
            referencedRelation: 'players'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      can_create_player_access: {
        Args: {
          requested_email: string
        }
        Returns: boolean
      }
      current_player_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_registered_player: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
