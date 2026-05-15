import { useState } from 'react'
import type { Reservation } from '../types'
import { formatDateForDisplay } from '../utils/date'
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

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="max-h-[390px] overflow-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-bold">Socio</th>
                <th className="px-4 py-3 font-bold">Fecha</th>
                <th className="px-4 py-3 font-bold">Inicio</th>
                <th className="px-4 py-3 font-bold">Salida</th>
                <th className="px-4 py-3 text-right font-bold">Accion</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-500" colSpan={5}>
                    <span className="block text-base font-semibold text-slate-700">
                      No hay reservas creadas.
                    </span>
                    <span className="mt-1 block text-sm">
                      Las proximas reservas apareceran aqui.
                    </span>
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr
                    className="transition-colors hover:bg-slate-50"
                    key={reservation.id}
                  >
                    <td className="border-t border-slate-100 px-4 py-4 font-semibold text-slate-900">
                      {reservation.playerName}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                        {formatDateForDisplay(reservation.date)}
                      </span>
                    </td>
                    <td className="border-t border-slate-100 px-4 py-4 font-semibold text-[#B94439]">
                      {reservation.startTime}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-4 font-semibold text-slate-700">
                      {reservation.endTime}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-4">
                      <div className="flex flex-col justify-end gap-2 sm:flex-row">
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
      </div>

      <ConfirmDialog
        confirmLabel="Cancelar reserva"
        isOpen={reservationToCancel !== null}
        message={
          reservationToCancel
            ? `Se cancelara la reserva de ${reservationToCancel.playerName} para el ${formatDateForDisplay(reservationToCancel.date)}, de ${reservationToCancel.startTime} a ${reservationToCancel.endTime}.`
            : ''
        }
        onCancel={() => setReservationToCancel(null)}
        onConfirm={handleConfirmCancel}
        title="Cancelar reserva"
      />
    </section>
  )
}
