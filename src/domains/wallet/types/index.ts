export type WalletBinding = {
  id: string
  human_id: string
  chain: 'evm'
  address: string
  verified_at: string
  verification_method: 'SIWE'
}

export type SiweChallenge = {
  id: string
  human_id: string
  address: string
  nonce: string
  issued_at: string
  expiration_time: string
  used: boolean
}

// Client state for wallet binding
export type WalletBindingStatus = 'idle' | 'loading' | 'signing' | 'verifying' | 'success' | 'error'

export interface WalletState {
  wallets: WalletBinding[]
  isLoading: boolean
  error: string | null
  status: WalletBindingStatus
  fetchWallets: () => Promise<void>
  bindWallet: () => Promise<void>
  reset: () => void
}
