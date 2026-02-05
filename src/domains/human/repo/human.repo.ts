import 'server-only'

import { createSupabaseAdminClient } from '@/core/supabase/server'
import type { Human } from '../types'

/**
 * Find a human by action and nullifier hash
 * Returns the human if found, null otherwise
 */
export async function findHumanByActionNullifier(
  action: string,
  nullifierHash: string
): Promise<Human | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .schema('gate')
    .from('human')
    .select('*')
    .eq('action', action)
    .eq('nullifier_hash', nullifierHash)
    .single()

  if (error) {
    // PGRST116: No rows found - this is expected
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as Human
}

/**
 * Insert a new human record
 * Throws on duplicate (action, nullifier_hash) constraint violation
 */
export async function insertHuman(input: {
  action: string
  nullifier_hash: string
}): Promise<Human> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .schema('gate')
    .from('human')
    .insert({
      action: input.action,
      nullifier_hash: input.nullifier_hash,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Human
}
