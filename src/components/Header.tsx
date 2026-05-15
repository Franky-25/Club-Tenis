export function Header() {
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
        <div className="w-full rounded-2xl border border-white/40 bg-white/10 px-4 py-4 text-left shadow-lg sm:px-5 lg:w-auto lg:min-w-56">
          <p className="text-sm text-[#FBE7E4]">Estado</p>
          <p className="text-2xl font-bold">🎾 Operativo</p>
        </div>
      </div>
    </header>
  )
}
