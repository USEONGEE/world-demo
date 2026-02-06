import 'server-only'

import { createSupabaseAdminClient } from '@/core/supabase/server'
import type { SiweChallenge } from '../types'

/**
 * Insert a new SIWE challenge
 */
export async function insertChallenge(data: {
  human_id: string
  address: string
  nonce: string
  issued_at: string
  expiration_time: string
}): Promise<SiweChallenge> {
  const supabase = createSupabaseAdminClient()

  const { data: challenge, error } = await supabase
    .schema('gate')
    .from('siwe_challenge')
    .insert({
      human_id: data.human_id,
      address: data.address,
      nonce: data.nonce,
      issued_at: data.issued_at,
      expiration_time: data.expiration_time,
      used: false,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return challenge as SiweChallenge
}

/**
 * Find a challenge by nonce
 */
export async function findChallengeByNonce(
  nonce: string
): Promise<SiweChallenge | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .schema('gate')
    .from('siwe_challenge')
    .select('*')
    .eq('nonce', nonce)
    .single()

  if (error) {
    // PGRST116: No rows found
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as SiweChallenge
}

/**
 * Mark a challenge as used
 */
export async function markChallengeUsed(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .schema('gate')
    .from('siwe_challenge')
    .update({ used: true })
    .eq('id', id)

  if (error) {
    throw error
  }
}
