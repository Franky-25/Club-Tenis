export type Player = {
  id: string
  name: string
  phone: string
  email: string
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
