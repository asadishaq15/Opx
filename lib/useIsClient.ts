'use client'

import { useEffect, useState } from 'react'

/**
 * Custom hook to check if code is running on the client side
 * Useful for preventing hydration mismatches and SSR issues
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
