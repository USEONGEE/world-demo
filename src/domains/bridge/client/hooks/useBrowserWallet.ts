'use client'

import { useState, useCallback } from 'react'
import { createWalletClient, custom, type EIP1193Provider } from 'viem'
import { mainnet } from 'viem/chains'
import { SiweMessage } from 'siwe'
import { analytics } from '@/core/analytics'
import type { SiweChallengeResponse, SiweVerifyResponse } from '@/shared/contracts'

type BrowserWalletStatus = 'idle' | 'connecting' | 'signing' | 'verifying' | 'success' | 'error'

function getEthereum(): EIP1193Provider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { ethereum?: EIP1193Provider }).ethereum
}

export function useBrowserWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<BrowserWalletStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const hasEthereum = !!getEthereum()

  const connectAndBind = useCallback(async () => {
    const ethereum = getEthereum()
    if (!ethereum) return

    setStatus('connecting')
    setError(null)
    let trackedFailure = false
    let connectedAddress: string | null = null

    try {
      // 1. Connect wallet via window.ethereum
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(ethereum),
      })

      const [walletAddress] = await client.requestAddresses()
      if (!walletAddress) {
        throw new Error('No address returned')
      }

      connectedAddress = walletAddress
      setAddress(walletAddress)

      // 2. Request SIWE challenge
      setStatus('signing')

      const challengeRes = await fetch('/api/siwe/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress }),
      })

      if (!challengeRes.ok) {
        const errorData = await challengeRes.json()
        throw new Error(errorData.error?.message ?? 'Failed to get challenge')
      }

      const challenge: SiweChallengeResponse = await challengeRes.json()

      // 3. Create and sign SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: 'Sign in to World Gate to link your wallet',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: challenge.nonce,
        issuedAt: challenge.issued_at,
        expirationTime: challenge.expiration_time,
      })

      const message = siweMessage.prepareMessage()
      const signature = await client.signMessage({
        account: walletAddress,
        message,
      })

      // 4. Verify signature
      setStatus('verifying')

      const verifyRes = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: { message, signature },
          nonce: challenge.nonce,
        }),
      })

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json()
        const errorMessage = errorData.error?.message ?? 'Verification failed'
        analytics.track({
          name: 'wallet_bind_fail',
          properties: { reason: errorData.error?.code ?? errorMessage, address: walletAddress },
          timestamp: new Date(),
        })
        trackedFailure = true
        throw new Error(errorMessage)
      }

      const result: SiweVerifyResponse = await verifyRes.json()
      analytics.track({
        name: 'wallet_bind_success',
        properties: {
          address: result.address,
          idempotent: result.idempotent ?? false,
          source: 'browser',
        },
        timestamp: new Date(),
      })
      setAddress(result.address)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      if (!trackedFailure) {
        analytics.track({
          name: 'wallet_bind_fail',
          properties: {
            reason: err instanceof Error ? err.message : 'Unknown error',
            address: connectedAddress ?? undefined,
            source: 'browser',
          },
          timestamp: new Date(),
        })
      }
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setAddress(null)
    setStatus('idle')
    setError(null)
  }, [])

  return {
    address,
    status,
    error,
    hasEthereum,
    connectAndBind,
    reset,
  }
}
