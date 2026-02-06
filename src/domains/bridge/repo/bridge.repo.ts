import 'server-only'

import { createSupabaseAdminClient } from '@/core/supabase/server'
import type { BridgeToken } from '../types'

/**
 * Insert a new bridge token
 */
export async function insertBridgeToken(data: {
  human_id: string
  code: string
  expires_at: string
}): Promise<BridgeToken> {
  const supabase = createSupabaseAdminClient()

  const { data: token, error } = await supabase
    .schema('gate')
    .from('bridge_token')
    .insert({
      human_id: data.human_id,
      code: data.code,
      expires_at: data.expires_at,
      used: false,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return token as BridgeToken
}

/**
 * Invalidate unused bridge tokens for a human
 */
export async function markUnusedByHumanId(humanId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .schema('gate')
    .from('bridge_token')
    .update({ used: true })
    .eq('human_id', humanId)
    .eq('used', false)

  if (error) {
    throw error
  }
}

/**
 * Find a bridge token by code
 */
export async function findByCode(code: string): Promise<BridgeToken | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .schema('gate')
    .from('bridge_token')
    .select('*')
    .eq('code', code)
    .single()

  if (error) {
    // PGRST116: No rows found
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as BridgeToken
}

/**
 * Mark a bridge token as used
 */
export async function markUsed(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .schema('gate')
    .from('bridge_token')
    .update({ used: true })
    .eq('id', id)

  if (error) {
    throw error
  }
}
