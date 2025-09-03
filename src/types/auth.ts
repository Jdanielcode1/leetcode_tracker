export interface User {
  username: string
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

export const VALID_USERS = {
  'pedraza': '54321',
  'daniel': '54321',
  'sebas': '54321'
} as const

export type ValidUsername = keyof typeof VALID_USERS
