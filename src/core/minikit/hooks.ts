'use client'

import { MiniKit } from '@worldcoin/minikit-js'
import { useState, useEffect } from 'react'

export function useMiniKitInstalled() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    let timer: ReturnType<typeof setInterval> | null = null

    const check = () => {
      try {
        const installed = MiniKit.isInstalled()
        if (isMounted) setIsInstalled(installed)
        if (installed && timer) {
          clearInterval(timer)
          timer = null
        }
      } catch (error) {
        if (isMounted) setIsInstalled(false)
      }
    }

    check()
    timer = setInterval(check, 1000)
    return () => {
      isMounted = false
      if (timer) clearInterval(timer)
    }
  }, [])

  return isInstalled
}

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

const DEFAULT_INSETS: SafeAreaInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>(DEFAULT_INSETS)

  useEffect(() => {
    const deviceInsets = MiniKit.deviceProperties?.safeAreaInsets
    if (deviceInsets) {
      setInsets(deviceInsets)
    }
  }, [])

  return insets
}

export function useLaunchLocation() {
  const [location, setLocation] = useState<string | null>(null)

  useEffect(() => {
    setLocation(MiniKit.location || null)
  }, [])

  return location
}
