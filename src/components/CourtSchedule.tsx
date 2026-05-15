import type { Reservation } from '../types'
import { getLocalDateValue } from '../utils/date'

type CourtScheduleProps = {
  reservations: Reservation[]
}

const court = 'Cancha 1'
const hours = [
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

export function CourtSchedule({ reservations }: CourtScheduleProps) {
  const today = getLocalDateValue()

  function getReservation(time: string) {
    return reservations.find(
      (reservation) =>
        reservation.court === court &&
        reservation.startTime <= time &&
        reservation.endTime > time &&
        reservation.date === today,
    )
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#DB5D4F]">
          Agenda
        </p>
        <h2 className="text-2xl font-bold text-slate-900">Agenda de hoy</h2>
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1 sm:pr-2">
        <div className="grid min-w-0 grid-cols-[74px_minmax(0,1fr)] gap-2 sm:grid-cols-[90px_minmax(0,1fr)]">
          <div className="sticky top-0 z-10 bg-white pb-2 text-sm font-bold text-slate-500">
            Hora
          </div>
          <div className="sticky top-0 z-10 bg-white pb-2 text-sm font-bold text-slate-700">
            {court}
          </div>

          {hours.map((hour) => {
            const reservation = getReservation(hour)

            return (
              <div className="contents" key={hour}>
                <div
                  className="rounded-xl bg-slate-100 p-2 text-sm font-bold text-slate-700 sm:p-3"
                >
                  {hour}
                </div>
                <div
                  className={`min-w-0 rounded-xl p-2 text-sm sm:p-3 ${
                    reservation
                      ? 'bg-[#DB5D4F] font-semibold text-white'
                      : 'bg-[#FBE7E4] text-[#B94439]'
                  }`}
                >
                  <span className="block truncate">
                    {reservation
                      ? `${reservation.playerName} (${reservation.startTime} - ${reservation.endTime})`
                      : 'Libre'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
