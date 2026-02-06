'use client'

import { create } from 'zustand'
import { MiniKit, type WalletAuthInput } from '@worldcoin/minikit-js'
import { analytics } from '@/core/analytics'
import type { WalletBinding, WalletState, WalletBindingStatus } from '../../types'
import type { SiweChallengeResponse, SiweVerifyResponse, WalletsResponse } from '@/shared/contracts'

// Timeout for API calls (10 seconds)
const API_TIMEOUT = 10000

// SIWE statement
const SIWE_STATEMENT = 'Sign in to World Gate to link your wallet'
const FALLBACK_ADDRESS = '0x0000000000000000000000000000000000000000'

function extractAddressFromMessage(message: string): string | null {
  const match = message.match(/0x[a-fA-F0-9]{40}/)
  return match ? match[0] : null
}

interface WalletStore extends WalletState {}

export const useWalletStore = create<WalletStore>()((set, get) => ({
  wallets: [],
  isLoading: false,
  error: null,
  status: 'idle' as WalletBindingStatus,

  fetchWallets: async () => {
    const state = get()
    if (state.isLoading) return

    set({ isLoading: true, error: null })

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT)

      const response = await fetch('/api/wallet/bindings', {
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout))

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message ?? 'Failed to fetch wallets')
      }

      const data: WalletsResponse = await response.json()

      set({
        wallets: data.wallets as WalletBinding[],
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.name === 'AbortError'
          ? 'Request timeout'
          : error instanceof Error
            ? error.message
            : 'Unknown error'

      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  bindWallet: async () => {
    const state = get()
    if (state.isLoading) return

    set({ isLoading: true, error: null, status: 'loading' })

    try {
      // 1. Check MiniKit installation
      if (!MiniKit.isInstalled()) {
        throw new Error('MiniKit is not installed')
      }

      // Get wallet address from MiniKit user (may be unavailable until Wallet Auth runs)
      const walletAddress = MiniKit.user?.walletAddress
      const challengeAddress = walletAddress ?? FALLBACK_ADDRESS

      // 2. Request challenge
      const challengeController = new AbortController()
      const challengeTimeout = setTimeout(() => challengeController.abort(), API_TIMEOUT)

      const challengeResponse = await fetch('/api/siwe/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: challengeAddress }),
        signal: challengeController.signal,
      }).finally(() => clearTimeout(challengeTimeout))

      if (!challengeResponse.ok) {
        const errorData = await challengeResponse.json()
        throw new Error(errorData.error?.message ?? 'Failed to get challenge')
      }

      const challenge: SiweChallengeResponse = await challengeResponse.json()

      analytics.track({
        name: 'siwe_challenge_issued',
        properties: { address: walletAddress ?? challengeAddress },
        timestamp: new Date(),
      })

      // 3. Request signature via MiniKit
      set({ status: 'signing' })

      const walletAuthPayload: WalletAuthInput = {
        nonce: challenge.nonce,
        statement: SIWE_STATEMENT,
        expirationTime: new Date(challenge.expiration_time),
      }

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthPayload)

      // Check if signing was successful
      if (finalPayload.status !== 'success') {
        analytics.track({
          name: 'siwe_sign_fail',
          properties: { reason: String(finalPayload.status ?? 'user_cancelled') },
          timestamp: new Date(),
        })
        throw new Error(String(finalPayload.status ?? 'Signing failed'))
      }

      const resolvedAddress =
        walletAddress ?? extractAddressFromMessage(finalPayload.message) ?? challengeAddress

      analytics.track({
        name: 'siwe_sign_success',
        properties: { address: resolvedAddress },
        timestamp: new Date(),
      })

      // 4. Verify signature
      set({ status: 'verifying' })

      const verifyController = new AbortController()
      const verifyTimeout = setTimeout(() => verifyController.abort(), API_TIMEOUT)

      const verifyResponse = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            message: finalPayload.message,
            signature: finalPayload.signature,
          },
          nonce: challenge.nonce,
        }),
        signal: verifyController.signal,
      }).finally(() => clearTimeout(verifyTimeout))

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        const errorCode = errorData.error?.code
        const errorMessage = errorData.error?.message ?? 'Verification failed'

        analytics.track({
          name: 'wallet_bind_fail',
          properties: { reason: errorCode ?? errorMessage, address: walletAddress ?? challengeAddress },
          timestamp: new Date(),
        })

        throw new Error(errorMessage)
      }

      const result: SiweVerifyResponse = await verifyResponse.json()

      analytics.track({
        name: 'wallet_bind_success',
        properties: {
          address: result.address,
          idempotent: result.idempotent ?? false,
        },
        timestamp: new Date(),
      })

      // 5. Refresh wallet list
      await get().fetchWallets()

      set({
        isLoading: false,
        error: null,
        status: 'success',
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.name === 'AbortError'
          ? 'Request timeout'
          : error instanceof Error
            ? error.message
            : 'Unknown error'

      set({
        isLoading: false,
        error: errorMessage,
        status: 'error',
      })
    }
  },

  reset: () => {
    set({
      wallets: [],
      isLoading: false,
      error: null,
      status: 'idle',
    })
  },
}))
