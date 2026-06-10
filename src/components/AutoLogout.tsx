"use client"

import { useEffect } from 'react'
import { signout } from '@/app/login/actions'

export function AutoLogout() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timeoutId)
      // 7 minutes = 7 * 60 * 1000 = 420,000 ms
      timeoutId = setTimeout(async () => {
        await signout()
      }, 420000)
    }

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    events.forEach((event) => {
      document.addEventListener(event, resetTimer)
    })

    // Initialize timer
    resetTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [])

  return null
}
