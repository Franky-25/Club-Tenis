import { useMemo, useRef, useState } from 'react'
import { CourtSchedule } from './components/CourtSchedule'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { PlayerForm } from './components/PlayerForm'
import { PlayerList } from './components/PlayerList'
import { ReservationForm } from './components/ReservationForm'
import { ReservationsTable } from './components/ReservationsTable'
import type { Player, Reservation } from './types'

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function App() {
  const [players, setPlayers] = useState<Player[]>([
    {
      id: crypto.randomUUID(),
      name: 'Camila Rojas',
      phone: '+56 9 4321 9876',
      email: 'camila@elsalto.cl',
    },
    {
      id: crypto.randomUUID(),
      name: 'Nicolas Fuentes',
      phone: '+56 9 8765 1234',
      email: 'nicolas@elsalto.cl',
    },
  ])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [reservationError, setReservationError] = useState('')
  const reservationFormRef = useRef<HTMLDivElement | null>(null)

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) {
      return players
    }

    return players.filter((player) => player.name.toLowerCase().includes(normalizedSearch))
  }, [players, searchTerm])

  function handleAddPlayer(playerData: Omit<Player, 'id'>) {
    setPlayers((currentPlayers) => [
      ...currentPlayers,
      {
        ...playerData,
        id: crypto.randomUUID(),
      },
    ])
  }

  function handleDeletePlayer(playerId: string) {
    setPlayers((currentPlayers) => currentPlayers.filter((player) => player.id !== playerId))
    setReservations((currentReservations) =>
      currentReservations.filter((reservation) => reservation.playerId !== playerId),
    )
    if (editingReservation?.playerId === playerId) {
      setEditingReservation(null)
      setReservationError('')
    }
  }

  function handleSaveReservation(reservationData: Omit<Reservation, 'id' | 'playerName'>) {
    const selectedPlayer = players.find((player) => player.id === reservationData.playerId)

    if (!selectedPlayer) {
      setReservationError('Selecciona un socio valido para crear la reserva.')
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

  function handleCancelReservation(reservationId: string) {
    setReservations((currentReservations) =>
      currentReservations.filter((reservation) => reservation.id !== reservationId),
    )
    if (editingReservation?.id === reservationId) {
      setEditingReservation(null)
    }
    setReservationError('')
  }

  function handleEditReservation(reservation: Reservation) {
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

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 text-slate-800">
      <Header />
      <main className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
        <Dashboard players={players} reservations={reservations} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <PlayerForm onAddPlayer={handleAddPlayer} />
          <PlayerList
            onDeletePlayer={handleDeletePlayer}
            onSearchChange={setSearchTerm}
            players={filteredPlayers}
            searchTerm={searchTerm}
          />
        </div>

        <div
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          ref={reservationFormRef}
        >
          <ReservationForm
            editingReservation={editingReservation}
            errorMessage={reservationError}
            onCancelEdit={handleCancelEditReservation}
            onSaveReservation={handleSaveReservation}
            players={players}
          />
          <CourtSchedule reservations={reservations} />
        </div>

        <ReservationsTable
          onCancelReservation={handleCancelReservation}
          onEditReservation={handleEditReservation}
          reservations={reservations}
        />
      </main>
    </div>
  )
}

export default App
