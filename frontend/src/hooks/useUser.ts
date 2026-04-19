import { useState } from 'react'

const USER_ID_KEY = 'mire_user_id'

export function useUser(): string {
  const [userId] = useState<string>(() => {
    const stored = localStorage.getItem(USER_ID_KEY)
    if (stored) return stored
    const id = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, id)
    return id
  })
  return userId
}
