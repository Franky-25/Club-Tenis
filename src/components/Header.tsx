export type CourtStatus = 'operativo' | 'mantencion'

type HeaderProps = {
  canManageCourt: boolean
  courtStatus: CourtStatus
  currentPlayerName?: string
  onCourtStatusChange: (status: CourtStatus) => void
  onSignOut?: () => void
}

export function Header({
  canManageCourt,
  courtStatus,
  currentPlayerName,
  onCourtStatusChange,
  onSignOut,
}: HeaderProps) {
  const isOperational = courtStatus === 'operativo'

  return (
    <header className="w-full bg-[#DB5D4F] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">
            Club de Tenis El Chato
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#FFF7F6] sm:text-base">
            Gestion de socios, reserva de cancha.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-white/40 bg-white/10 px-4 py-4 text-left shadow-lg sm:px-5 lg:w-auto lg:min-w-72">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {currentPlayerName ? (
                <p className="truncate text-sm font-bold text-white">
                  Hola {currentPlayerName}
                </p>
              ) : null}
              <p className="text-sm text-[#FBE7E4]">Estado</p>
            </div>
            {onSignOut ? (
              <button
                className="rounded-lg border border-white/40 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/10"
                onClick={onSignOut}
                type="button"
              >
                Salir
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-2xl font-bold">
            {isOperational ? '🎾 Operativo' : '🛠️ En mantencion'}
          </p>

          {canManageCourt ? (
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1">
              <button
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  isOperational
                    ? 'bg-white text-[#B94439] shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => onCourtStatusChange('operativo')}
                type="button"
              >
                Operativo
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  !isOperational
                    ? 'bg-white text-[#B94439] shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => onCourtStatusChange('mantencion')}
                type="button"
              >
                En mantencion
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
