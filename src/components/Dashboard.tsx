import type { Player, Reservation } from '../types'
import { getLocalDateValue } from '../utils/date'

type DashboardProps = {
  players: Player[]
  reservations: Reservation[]
}

export function Dashboard({ players, reservations }: DashboardProps) {
  const today = getLocalDateValue()
  const reservationsToday = reservations.filter((reservation) => reservation.date === today)

  const metrics = [
    { label: 'Socios', value: players.length, icon: '👥' },
    { label: 'Reservas activas', value: reservations.length, icon: '📅' },
    { label: 'Reservas hoy', value: reservationsToday.length, icon: '⏱️' },
  ]

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {metrics.map((metric) => (
        <article
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          key={metric.label}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">{metric.label}</p>
            <span className="text-xl sm:text-2xl" aria-hidden="true">
              {metric.icon}
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{metric.value}</p>
        </article>
      ))}
    </section>
  )
}
