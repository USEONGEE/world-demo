import 'server-only'

import { listWalletBindingsByHumanId } from '../repo'
import type { WalletBinding } from '../types'

/**
 * List all wallets bound to a human
 */
export async function listWallets(humanId: string): Promise<WalletBinding[]> {
  return listWalletBindingsByHumanId(humanId)
}
