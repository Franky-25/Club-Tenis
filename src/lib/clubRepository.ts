import type { CourtStatus } from '../components/Header'
import type { Player, Reservation } from '../types'
import { supabase } from './supabase'

const defaultCourtName = 'Cancha 1'

type ClubData = {
  courtStatus: CourtStatus
  players: Player[]
  reservations: Reservation[]
}

function normalizeTime(time: string) {
  return time.slice(0, 5)
}

async function getDefaultCourt() {
  const { data, error } = await supabase
    .from('courts')
    .select('id, name, status')
    .eq('name', defaultCourtName)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function fetchClubData(): Promise<ClubData> {
  const [playersResult, courtsResult, reservationsResult] = await Promise.all([
    supabase.from('players').select('id, name, phone, email, role').order('name'),
    supabase.from('courts').select('id, name, status').order('name'),
    supabase
      .from('reservations')
      .select('id, player_id, court_id, reservation_date, start_time, end_time')
      .eq('status', 'active')
      .order('reservation_date')
      .order('start_time'),
  ])

  if (playersResult.error) {
    throw playersResult.error
  }

  if (courtsResult.error) {
    throw courtsResult.error
  }

  if (reservationsResult.error) {
    throw reservationsResult.error
  }

  const players = playersResult.data
  const courts = courtsResult.data
  const playersById = new Map(players.map((player) => [player.id, player]))
  const courtsById = new Map(courts.map((court) => [court.id, court]))
  const defaultCourt = courts.find((court) => court.name === defaultCourtName)

  return {
    courtStatus: defaultCourt?.status ?? 'operativo',
    players,
    reservations: reservationsResult.data.map((reservation) => {
      const player = playersById.get(reservation.player_id)
      const court = courtsById.get(reservation.court_id)

      return {
        id: reservation.id,
        playerId: reservation.player_id,
        playerName: player?.name ?? 'Socio eliminado',
        court: court?.name ?? defaultCourtName,
        date: reservation.reservation_date,
        startTime: normalizeTime(reservation.start_time),
        endTime: normalizeTime(reservation.end_time),
      }
    }),
  }
}

export async function isCurrentUserRegisteredPlayer() {
  const { data: userResult, error: userError } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  const email = userResult.user?.email

  if (!email) {
    return false
  }

  const { data, error } = await supabase
    .from('players')
    .select('id')
    .ilike('email', email)
    .limit(1)

  if (error) {
    throw error
  }

  return data.length > 0
}

export async function getCurrentUserPlayer() {
  const { data: userResult, error: userError } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  const email = userResult.user?.email

  if (!email) {
    return null
  }

  const { data, error } = await supabase
    .from('players')
    .select('id, name, phone, email, role')
    .ilike('email', email)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function canCreateAccessForRegisteredPlayer(email: string) {
  const { data, error } = await supabase.rpc('can_create_player_access', {
    requested_email: email,
  })

  if (error) {
    throw error
  }

  return data
}

export async function createPlayer(playerData: Omit<Player, 'id'>) {
  const { data, error } = await supabase
    .from('players')
    .insert(playerData)
    .select('id, name, phone, email, role')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePlayer(playerId: string, playerData: Omit<Player, 'id'>) {
  const { data, error } = await supabase
    .from('players')
    .update(playerData)
    .eq('id', playerId)
    .select('id, name, phone, email, role')
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deletePlayer(playerId: string) {
  const { error } = await supabase.from('players').delete().eq('id', playerId)

  if (error) {
    throw error
  }
}

export async function saveReservation(
  reservationData: Omit<Reservation, 'id' | 'playerName'>,
  playerName: string,
  reservationId?: string,
) {
  const court = await getDefaultCourt()
  const payload = {
    player_id: reservationData.playerId,
    court_id: court.id,
    reservation_date: reservationData.date,
    start_time: reservationData.startTime,
    end_time: reservationData.endTime,
  }

  const query = reservationId
    ? supabase
        .from('reservations')
        .update(payload)
        .eq('id', reservationId)
        .select('id, player_id, reservation_date, start_time, end_time')
        .single()
    : supabase
        .from('reservations')
        .insert(payload)
        .select('id, player_id, reservation_date, start_time, end_time')
        .single()

  const { data, error } = await query

  if (error) {
    throw error
  }

  return {
    id: data.id,
    playerId: data.player_id,
    playerName,
    court: court.name,
    date: data.reservation_date,
    startTime: normalizeTime(data.start_time),
    endTime: normalizeTime(data.end_time),
  }
}

export async function cancelReservation(reservationId: string) {
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId)

  if (error) {
    throw error
  }
}

export async function updateCourtStatus(status: CourtStatus) {
  const { error } = await supabase.from('courts').update({ status }).eq('name', defaultCourtName)

  if (error) {
    throw error
  }
}
