import 'server-only'

import type { WalletBinding } from '../types'

export async function findWalletBindingByAddress(
  _chain: string,
  _address: string
): Promise<WalletBinding | null> {
  throw new Error('findWalletBindingByAddress not implemented')
}

export async function insertWalletBinding(_data: {
  human_id: string
  chain: string
  address: string
  verification_method: string
}): Promise<WalletBinding> {
  throw new Error('insertWalletBinding not implemented')
}

export async function listWalletBindingsByHumanId(
  _humanId: string
): Promise<WalletBinding[]> {
  throw new Error('listWalletBindingsByHumanId not implemented')
}
