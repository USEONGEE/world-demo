import 'server-only'

import type { WalletBinding } from '../types'

export async function issueChallenge(_address: string): Promise<{
  nonce: string
  issued_at: string
  expiration_time: string
}> {
  throw new Error('issueChallenge not implemented')
}

export async function verifyWalletBinding(_payload: unknown): Promise<{
  address: string
  bound: boolean
  idempotent?: boolean
}> {
  throw new Error('verifyWalletBinding not implemented')
}

export async function listWalletBindings(): Promise<WalletBinding[]> {
  throw new Error('listWalletBindings not implemented')
}
