import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'civicgraph-auth-token'
  }
})

// Database types
export type CivicAction = {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  impact_points: number
  verified: boolean
  created_at: string
  updated_at: string
}

export type NetworkNode = {
  id: string
  label: string
  type: string
  properties: Record<string, any>
  created_at: string
}

export type NetworkEdge = {
  id: string
  source_id: string
  target_id: string
  weight: number
  type: string
  created_at: string
}
