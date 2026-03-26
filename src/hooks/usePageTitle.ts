// hooks/usePageTitle.ts
'use client'

import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Admin Dashboard`
    
    // Cleanup: kembalikan ke default title saat unmount (optional)
    return () => {
      document.title = 'Admin Dashboard'
    }
  }, [title])
}