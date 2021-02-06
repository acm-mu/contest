import { useState } from "react"
import config from './environment'

const isAuthenticated = (): boolean => {
  const { username, session_token } = localStorage
  // If any of them are undefined
  if (!(username && session_token)) return false

  const [state, setState] = useState(false)

  const formData = new FormData()
  formData.set('username', username)
  formData.set('session_token', session_token)

  fetch(`${config.API_URL}/auth`, {
    method: 'POST',
    body: formData
  })
    .then(res => setState(res.status == 200))

  return state
}

const logout = (): void => {
  localStorage.removeItem('user')
  localStorage.removeItem('username')
  localStorage.removeItem('session_token')
}

const authenticate = async (username: string, password: string): Promise<boolean> => {
  const formData = new FormData()
  formData.set('username', username)
  formData.set('password', password)

  const res = await fetch(`${config.API_URL}/auth`, {
    method: 'POST',
    body: formData
  })
  if (res.status != 200) return false

  const user = await res.json()

  Object.keys(user).forEach(key => localStorage.setItem(key, user[key]))

  return true
}

const getuserinfo = (key: string): string => {
  return localStorage.getItem(key) || ''
}

export { isAuthenticated, authenticate, logout, getuserinfo }