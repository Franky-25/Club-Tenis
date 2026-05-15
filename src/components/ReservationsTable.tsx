import { useState } from 'react'
import type { Reservation } from '../types'
import { ConfirmDialog } from './ConfirmDialog'

type ReservationsTableProps = {
  reservations: Reservation[]
  onCancelReservation: (reservationId: string) => void
  onEditReservation: (reservation: Reservation) => void
}

export function ReservationsTable({
  reservations,
  onCancelReservation,
  onEditReservation,
}: ReservationsTableProps) {
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null)

  function handleConfirmCancel() {
    if (!reservationToCancel) {
      return
    }

    onCancelReservation(reservationToCancel.id)
    setReservationToCancel(null)
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#DB5D4F]">
          Proximas
        </p>
        <h2 className="text-2xl font-bold text-slate-900">Reservas</h2>
      </div>

      <div className="max-h-[390px] overflow-auto pr-1 sm:pr-2">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3 pr-4 font-semibold">Socio</th>
              <th className="py-3 pr-4 font-semibold">Cancha</th>
              <th className="py-3 pr-4 font-semibold">Fecha</th>
              <th className="py-3 pr-4 font-semibold">Inicio</th>
              <th className="py-3 pr-4 font-semibold">Salida</th>
              <th className="py-3 font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td className="py-5 text-slate-600" colSpan={6}>
                  No hay reservas creadas.
                </td>
              </tr>
            ) : (
              reservations.map((reservation) => (
                <tr className="border-b border-slate-100" key={reservation.id}>
                  <td className="py-4 pr-4 font-semibold text-slate-900">{reservation.playerName}</td>
                  <td className="py-4 pr-4 text-slate-700">{reservation.court}</td>
                  <td className="py-4 pr-4 text-slate-700">{reservation.date}</td>
                  <td className="py-4 pr-4 text-slate-700">{reservation.startTime}</td>
                  <td className="py-4 pr-4 text-slate-700">{reservation.endTime}</td>
                  <td className="py-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        className="secondary-button"
                        onClick={() => onEditReservation(reservation)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => setReservationToCancel(reservation)}
                        type="button"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        confirmLabel="Cancelar reserva"
        isOpen={reservationToCancel !== null}
        message={
          reservationToCancel
            ? `Se cancelara la reserva de ${reservationToCancel.playerName} para el ${reservationToCancel.date}, de ${reservationToCancel.startTime} a ${reservationToCancel.endTime}.`
            : ''
        }
        onCancel={() => setReservationToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancelar reserva"
      />
    </section>
  )
}
