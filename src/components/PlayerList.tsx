import { useState } from 'react'
import type { Player } from '../types'
import { ConfirmDialog } from './ConfirmDialog'

type PlayerListProps = {
  canManagePlayers: boolean
  players: Player[]
  searchTerm: string
  onEditPlayer: (player: Player) => void
  onSearchChange: (value: string) => void
  onDeletePlayer: (playerId: string) => void
}

export function PlayerList({
  canManagePlayers,
  players,
  searchTerm,
  onEditPlayer,
  onSearchChange,
  onDeletePlayer,
}: PlayerListProps) {
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)

  function handleConfirmDelete() {
    if (!playerToDelete) {
      return
    }

    onDeletePlayer(playerToDelete.id)
    setPlayerToDelete(null)
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#DB5D4F]">
            Socios
          </p>
          <h2 className="text-2xl font-bold text-slate-900">Lista registrada</h2>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:w-72">
          Buscar por nombre
          <input
            className="input-field"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar socio..."
            value={searchTerm}
          />
        </label>
      </div>

      <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-2">
        {players.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-600">
            No hay socios para mostrar.
          </p>
        ) : (
          players.map((player) => (
            <article
              className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={player.id}
            >
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900">{player.name}</h3>
                <p className="break-words text-sm text-slate-600">{player.email}</p>
                <p className="text-sm text-slate-600">{player.phone}</p>
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {player.role === 'admin' ? 'Administrador' : 'Socio'}
                </span>
              </div>
              {canManagePlayers ? (
                <div className="flex min-w-0 flex-col gap-3 sm:items-end">
                  <button className="secondary-button" onClick={() => onEditPlayer(player)} type="button">
                    Editar
                  </button>
                  <button className="danger-button" onClick={() => setPlayerToDelete(player)} type="button">
                    Eliminar
                  </button>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      {canManagePlayers ? (
        <ConfirmDialog
          confirmLabel="Eliminar socio"
          isOpen={playerToDelete !== null}
          message={
            playerToDelete
              ? `Se eliminara a ${playerToDelete.name} y tambien sus reservas asociadas.`
              : ''
          }
          onCancel={() => setPlayerToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Eliminar socio"
        />
      ) : null}
    </section>
  )
}
