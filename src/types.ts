export type PlayerRole = 'admin' | 'member'

export type Player = {
  id: string
  name: string
  phone: string
  email: string
  role: PlayerRole
}

export type Reservation = {
  id: string
  playerId: string
  playerName: string
  court: string
  date: string
  startTime: string
  endTime: string
}
