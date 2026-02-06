import 'server-only'

import { listWalletBindingsByHumanId } from '../repo'
import type { WalletBinding } from '../types'

const log = (msg: string, data?: unknown) =>
  console.log(`[listWallets] ${msg}`, data !== undefined ? data : '')

/**
 * List all wallets bound to a human
 */
export async function listWallets(humanId: string): Promise<WalletBinding[]> {
  log('called for human:', humanId)
  const wallets = await listWalletBindingsByHumanId(humanId)
  log(`found ${wallets.length} wallets`)
  return wallets
}
