import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthPanel } from './components/AuthPanel'
import { CourtSchedule } from './components/CourtSchedule'
import { Dashboard } from './components/Dashboard'
import { Header, type CourtStatus } from './components/Header'
import { PlayerForm } from './components/PlayerForm'
import { PlayerList } from './components/PlayerList'
import { ReservationForm } from './components/ReservationForm'
import { ReservationsTable } from './components/ReservationsTable'
import {
  cancelReservation,
  createPlayer,
  deletePlayer,
  fetchClubData,
  getCurrentUserPlayer,
  saveReservation,
  updatePlayer,
  updateCourtStatus,
} from './lib/clubRepository'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import type { Player, Reservation } from './types'

const seededPlayers: Player[] = [
  {
    id: crypto.randomUUID(),
    name: 'Camila Rojas',
    phone: '+56 9 4321 9876',
    email: 'camila@elsalto.cl',
    role: 'admin',
  },
  {
    id: crypto.randomUUID(),
    name: 'Nicolas Fuentes',
    phone: '+56 9 8765 1234',
    email: 'nicolas@elsalto.cl',
    role: 'member',
  },
]

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }

  return fallbackMessage
}

function App() {
  const [players, setPlayers] = useState<Player[]>(seededPlayers)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(isSupabaseConfigured ? null : seededPlayers[0])
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [courtStatus, setCourtStatus] = useState<CourtStatus>('operativo')
  const [searchTerm, setSearchTerm] = useState('')
  const [reservationError, setReservationError] = useState('')
  const [appMessage, setAppMessage] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(!isSupabaseConfigured)
  const [isLoadingRemoteData, setIsLoadingRemoteData] = useState(false)
  const playerFormRef = useRef<HTMLDivElement | null>(null)
  const reservationFormRef = useRef<HTMLDivElement | null>(null)
  const shouldUseSupabase = isSupabaseConfigured && session !== null
  const isAdmin = !isSupabaseConfigured || currentPlayer?.role === 'admin'

  const loadRemoteData = useCallback(async function loadRemoteData() {
    setIsLoadingRemoteData(true)
    setAppMessage('')

    try {
      const data = await fetchClubData()
      setPlayers(data.players)
      setReservations(data.reservations)
      setCourtStatus(data.courtStatus)
    } catch (error) {
      setAppMessage(getErrorMessage(error, 'No se pudo cargar Supabase.'))
    } finally {
      setIsLoadingRemoteData(false)
    }
  }, [])

  const applySession = useCallback(async function applySession(nextSession: Session | null) {
    if (!nextSession) {
      setSession(null)
      setCurrentPlayer(null)
      return
    }

    try {
      const userPlayer = await getCurrentUserPlayer()

      if (!userPlayer) {
        await supabase.auth.signOut()
        setSession(null)
        setAuthMessage('Este correo no esta registrado como socio de Tenis El Salto.')
        return
      }

      setAuthMessage('')
      setCurrentPlayer(userPlayer)
      setSession(nextSession)
      await loadRemoteData()
    } catch (error) {
      await supabase.auth.signOut()
      setSession(null)
      setAuthMessage(getErrorMessage(error, 'No se pudo validar el acceso.'))
    }
  }, [loadRemoteData])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }

    supabase.auth.getSession()
      .then(({ data }) => applySession(data.session))
      .finally(() => setIsAuthReady(true))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [applySession])

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return players
    }

    return players.filter((player) => player.name.toLowerCase().includes(normalizedSearch))
  }, [players, searchTerm])

  async function handleSavePlayer(playerData: Omit<Player, 'id'>) {
    if (!isAdmin) {
      setAppMessage('Solo un administrador puede crear o editar socios.')
      return false
    }

    if (shouldUseSupabase) {
      try {
        const savedPlayer = editingPlayer
          ? await updatePlayer(editingPlayer.id, playerData)
          : await createPlayer(playerData)
        setPlayers((currentPlayers) =>
          (editingPlayer
            ? currentPlayers.map((player) => (player.id === editingPlayer.id ? savedPlayer : player))
            : [...currentPlayers, savedPlayer]
          ).sort((first, second) => first.name.localeCompare(second.name)),
        )
        if (currentPlayer?.id === savedPlayer.id) {
          setCurrentPlayer(savedPlayer)
        }
        setEditingPlayer(null)
        return true
      } catch (error) {
        setAppMessage(getErrorMessage(error, 'No se pudo guardar el socio.'))
        return false
      }
    }

    setPlayers((currentPlayers) =>
      (editingPlayer
        ? currentPlayers.map((player) =>
            player.id === editingPlayer.id ? { ...player, ...playerData } : player,
          )
        : [
            ...currentPlayers,
            {
              ...playerData,
              id: crypto.randomUUID(),
            },
          ]
      ).sort((first, second) => first.name.localeCompare(second.name)),
    )
    if (currentPlayer && currentPlayer.id === editingPlayer?.id) {
      setCurrentPlayer({
        id: currentPlayer.id,
        ...playerData,
      })
    }
    setEditingPlayer(null)
    return true
  }

  async function handleDeletePlayer(playerId: string) {
    if (!isAdmin) {
      setAppMessage('Solo un administrador puede eliminar socios.')
      return
    }

    if (shouldUseSupabase) {
      try {
        await deletePlayer(playerId)
      } catch (error) {
        setAppMessage(getErrorMessage(error, 'No se pudo eliminar el socio.'))
        return
      }
    }

    setPlayers((currentPlayers) => currentPlayers.filter((player) => player.id !== playerId))
    setReservations((currentReservations) =>
      currentReservations.filter((reservation) => reservation.playerId !== playerId),
    )
    if (editingPlayer?.id === playerId) {
      setEditingPlayer(null)
    }
    if (editingReservation?.playerId === playerId) {
      setEditingReservation(null)
      setReservationError('')
    }
  }

  function handleEditPlayer(player: Player) {
    setEditingPlayer(player)
    setTimeout(() => {
      playerFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  async function handleSaveReservation(reservationData: Omit<Reservation, 'id' | 'playerName'>) {
    if (courtStatus === 'mantencion' && !editingReservation) {
      setReservationError('La cancha esta en mantencion. No se pueden crear nuevas reservas por ahora.')
      return false
    }

    const selectedPlayer = players.find((player) => player.id === reservationData.playerId)

    if (!selectedPlayer) {
      setReservationError('Selecciona un socio valido para crear la reserva.')
      return false
    }

    if (!isAdmin && selectedPlayer.id !== currentPlayer?.id) {
      setReservationError('Solo puedes crear o editar tus propias reservas.')
      return false
    }

    if (!isAdmin && editingReservation && editingReservation.playerId !== currentPlayer?.id) {
      setReservationError('No puedes editar reservas de otros socios.')
      return false
    }

    const newStartTime = timeToMinutes(reservationData.startTime)
    const newEndTime = timeToMinutes(reservationData.endTime)

    if (newEndTime <= newStartTime) {
      setReservationError('El horario de salida debe ser posterior al horario de inicio.')
      return false
    }

    const isSlotTaken = reservations.some((reservation) => {
      if (
        reservation.id === editingReservation?.id ||
        reservation.court !== reservationData.court ||
        reservation.date !== reservationData.date
      ) {
        return false
      }

      const reservedStartTime = timeToMinutes(reservation.startTime)
      const reservedEndTime = timeToMinutes(reservation.endTime)

      return newStartTime < reservedEndTime && newEndTime > reservedStartTime
    })

    if (isSlotTaken) {
      setReservationError('Ese rango horario ya esta ocupado para la cancha seleccionada.')
      return false
    }

    setReservationError('')

    if (shouldUseSupabase) {
      try {
        const savedReservation = await saveReservation(
          reservationData,
          selectedPlayer.name,
          editingReservation?.id,
        )

        setReservations((currentReservations) => {
          const nextReservations = editingReservation
            ? currentReservations.map((reservation) =>
                reservation.id === editingReservation.id ? savedReservation : reservation,
              )
            : [...currentReservations, savedReservation]

          return nextReservations.sort((first, second) =>
            `${first.date} ${first.startTime}`.localeCompare(`${second.date} ${second.startTime}`),
          )
        })
        setEditingReservation(null)
        return true
      } catch (error) {
        setReservationError(
          getErrorMessage(error, 'No se pudo guardar la reserva en Supabase.'),
        )
        return false
      }
    }

    setReservations((currentReservations) => {
      const nextReservations = editingReservation
        ? currentReservations.map((reservation) =>
            reservation.id === editingReservation.id
              ? {
                  ...reservation,
                  ...reservationData,
                  playerName: selectedPlayer.name,
                }
              : reservation,
          )
        : [
            ...currentReservations,
            {
              ...reservationData,
              id: crypto.randomUUID(),
              playerName: selectedPlayer.name,
            },
          ]

      return nextReservations.sort((first, second) =>
        `${first.date} ${first.startTime}`.localeCompare(`${second.date} ${second.startTime}`),
      )
    })
    setEditingReservation(null)
    return true
  }

  async function handleCancelReservation(reservationId: string) {
    const reservationToCancel = reservations.find((reservation) => reservation.id === reservationId)

    if (!reservationToCancel) {
      return
    }

    if (!isAdmin && reservationToCancel.playerId !== currentPlayer?.id) {
      setReservationError('No puedes cancelar reservas de otros socios.')
      return
    }

    if (shouldUseSupabase) {
      try {
        await cancelReservation(reservationId)
      } catch (error) {
        setAppMessage(getErrorMessage(error, 'No se pudo cancelar la reserva.'))
        return
      }
    }

    setReservations((currentReservations) =>
      currentReservations.filter((reservation) => reservation.id !== reservationId),
    )
    if (editingReservation?.id === reservationId) {
      setEditingReservation(null)
    }
    setReservationError('')
  }

  function handleEditReservation(reservation: Reservation) {
    if (!isAdmin && reservation.playerId !== currentPlayer?.id) {
      setReservationError('No puedes editar reservas de otros socios.')
      return
    }

    setEditingReservation(reservation)
    setReservationError('')
    setTimeout(() => {
      reservationFormRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }

  function handleCancelEditReservation() {
    setEditingReservation(null)
    setReservationError('')
  }

  async function handleCourtStatusChange(nextStatus: CourtStatus) {
    if (!isAdmin) {
      setAppMessage('Solo un administrador puede cambiar el estado de la cancha.')
      return
    }

    const previousStatus = courtStatus
    setCourtStatus(nextStatus)

    if (!shouldUseSupabase) {
      return
    }

    try {
      await updateCourtStatus(nextStatus)
    } catch (error) {
      setCourtStatus(previousStatus)
      setAppMessage(getErrorMessage(error, 'No se pudo actualizar la cancha.'))
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    setPlayers(seededPlayers)
    setReservations([])
    setCurrentPlayer(null)
    setEditingPlayer(null)
    setEditingReservation(null)
  }

  if (!isAuthReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-4 text-slate-700">
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold shadow-sm">
          Un momento por favor...
        </p>
      </div>
    )
  }

  if (isSupabaseConfigured && !session) {
    return <AuthPanel accessMessage={authMessage} onAuthenticated={(nextSession) => void applySession(nextSession)} />
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 text-slate-800">
      <Header
        canManageCourt={isAdmin}
        courtStatus={courtStatus}
        currentPlayerName={currentPlayer?.name}
        onCourtStatusChange={handleCourtStatusChange}
        onSignOut={shouldUseSupabase ? handleSignOut : undefined}
      />
      <main className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
        {appMessage ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {appMessage}
          </p>
        ) : null}

        {isLoadingRemoteData ? (
          <p className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600">
            Actualizando datos...
          </p>
        ) : null}

        <Dashboard players={players} reservations={reservations} />

        {isAdmin ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="grid gap-6">
              <div ref={playerFormRef}>
                <PlayerForm
                  editingPlayer={editingPlayer}
                  onCancelEdit={() => setEditingPlayer(null)}
                  onSavePlayer={handleSavePlayer}
                />
              </div>
              <div ref={reservationFormRef}>
                <ReservationForm
                  courtStatus={courtStatus}
                  currentPlayer={currentPlayer}
                  editingReservation={editingReservation}
                  errorMessage={reservationError}
                  isAdmin={isAdmin}
                  onCancelEdit={handleCancelEditReservation}
                  onSaveReservation={handleSaveReservation}
                  players={players}
                />
              </div>
            </div>

            <div className="grid gap-6">
              <PlayerList
                canManagePlayers={isAdmin}
                onDeletePlayer={handleDeletePlayer}
                onEditPlayer={handleEditPlayer}
                onSearchChange={setSearchTerm}
                players={filteredPlayers}
                searchTerm={searchTerm}
              />
              <CourtSchedule reservations={reservations} />
            </div>
          </div>
        ) : (
          <>
            <PlayerList
              canManagePlayers={false}
              onDeletePlayer={handleDeletePlayer}
              onEditPlayer={handleEditPlayer}
              onSearchChange={setSearchTerm}
              players={filteredPlayers}
              searchTerm={searchTerm}
            />

            <div
              className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              ref={reservationFormRef}
            >
              <ReservationForm
                courtStatus={courtStatus}
                currentPlayer={currentPlayer}
                editingReservation={editingReservation}
                errorMessage={reservationError}
                isAdmin={isAdmin}
                onCancelEdit={handleCancelEditReservation}
                onSaveReservation={handleSaveReservation}
                players={players}
              />
              <CourtSchedule reservations={reservations} />
            </div>
          </>
        )}

        <ReservationsTable
          canManageReservation={(reservation) => isAdmin || reservation.playerId === currentPlayer?.id}
          onCancelReservation={handleCancelReservation}
          onEditReservation={handleEditReservation}
          reservations={reservations}
        />
      </main>
    </div>
  )
}

export default App
