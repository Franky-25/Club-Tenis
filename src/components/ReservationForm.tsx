import type { FormEvent } from 'react'
import type { Player, Reservation } from '../types'
import { getLocalDateValue } from '../utils/date'

type ReservationFormProps = {
  editingReservation: Reservation | null
  errorMessage: string
  onCancelEdit: () => void
  players: Player[]
  onSaveReservation: (reservation: Omit<Reservation, 'id' | 'playerName'>) => boolean
}

const court = 'Cancha 1'
const timeOptions = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
]

export function ReservationForm({
  editingReservation,
  errorMessage,
  onCancelEdit,
  players,
  onSaveReservation,
}: ReservationFormProps) {
  const today = getLocalDateValue()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const wasSaved = onSaveReservation({
      playerId: String(formData.get('playerId')),
      court: String(formData.get('court')),
      date: String(formData.get('date')),
      startTime: String(formData.get('startTime')),
      endTime: String(formData.get('endTime')),
    })

    if (wasSaved) {
      event.currentTarget.reset()
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#DB5D4F]">
          Reservas
        </p>
        <h2 className="text-2xl font-bold text-slate-900">
          {editingReservation ? 'Editar reserva' : 'Crear reserva'}
        </h2>
      </div>

      {errorMessage ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <form className="grid min-w-0 gap-4" key={editingReservation?.id ?? 'new-reservation'} onSubmit={handleSubmit}>
        <input name="court" type="hidden" value={court} />

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Socio
          <select
            className="input-field"
            defaultValue={editingReservation?.playerId ?? ''}
            name="playerId"
            required
            disabled={players.length === 0}
          >
            <option value="">Seleccionar socio</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-xl bg-[#FBE7E4] px-4 py-3 text-sm font-semibold text-[#B94439]">
          Cancha disponible: {court}
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Fecha
            <input
              className="input-field"
              defaultValue={editingReservation?.date ?? today}
              name="date"
              required
              type="date"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Horario de inicio
            <select
              className="input-field"
              defaultValue={editingReservation?.startTime ?? ''}
              name="startTime"
              required
            >
              <option value="">Seleccionar inicio</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Horario de salida
            <select
              className="input-field"
              defaultValue={editingReservation?.endTime ?? ''}
              name="endTime"
              required
            >
              <option value="">Seleccionar salida</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button className="primary-button" disabled={players.length === 0} type="submit">
            {editingReservation ? 'Guardar cambios' : 'Crear reserva'}
          </button>
          {editingReservation ? (
            <button className="secondary-button" onClick={onCancelEdit} type="button">
              Salir de edicion
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
