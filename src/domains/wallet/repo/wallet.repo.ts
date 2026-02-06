import 'server-only'

import { createSupabaseAdminClient } from '@/core/supabase/server'
import type { WalletBinding } from '../types'

/**
 * Find a wallet binding by chain and address
 */
export async function findWalletBindingByChainAddress(
  chain: string,
  address: string
): Promise<WalletBinding | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .schema('gate')
    .from('wallet_binding')
    .select('*')
    .eq('chain', chain)
    .eq('address', address.toLowerCase())
    .single()

  if (error) {
    // PGRST116: No rows found
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as WalletBinding
}

/**
 * Insert a new wallet binding
 */
export async function insertWalletBinding(data: {
  human_id: string
  chain: string
  address: string
  verification_method: string
}): Promise<WalletBinding> {
  const supabase = createSupabaseAdminClient()

  const { data: binding, error } = await supabase
    .schema('gate')
    .from('wallet_binding')
    .insert({
      human_id: data.human_id,
      chain: data.chain,
      address: data.address.toLowerCase(),
      verification_method: data.verification_method,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return binding as WalletBinding
}

/**
 * List all wallet bindings for a human
 */
export async function listWalletBindingsByHumanId(
  humanId: string
): Promise<WalletBinding[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .schema('gate')
    .from('wallet_binding')
    .select('*')
    .eq('human_id', humanId)
    .order('verified_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as WalletBinding[]
}
