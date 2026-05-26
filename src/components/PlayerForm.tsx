import { useState, type FormEvent } from 'react'
import type { Player } from '../types'
import { ConfirmDialog } from './ConfirmDialog'

type PlayerFormData = Omit<Player, 'id'>

type PlayerFormProps = {
  editingPlayer: Player | null
  onCancelEdit: () => void
  onSavePlayer: (player: PlayerFormData) => boolean | Promise<boolean>
}

export function PlayerForm({ editingPlayer, onCancelEdit, onSavePlayer }: PlayerFormProps) {
  const [playerToSave, setPlayerToSave] = useState<PlayerFormData | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  function handlePhoneChange(event: FormEvent<HTMLInputElement>) {
    event.currentTarget.value = event.currentTarget.value.replace(/[^0-9+\s()-]/g, '')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccessMessage('')
    const form = event.currentTarget
    const formData = new FormData(form)
    const nextPlayer = {
      name: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      role: String(formData.get('role')) === 'admin' ? 'admin' : 'member',
    } satisfies PlayerFormData

    if (editingPlayer) {
      setPlayerToSave(nextPlayer)
      return
    }

    const wasSaved = await onSavePlayer(nextPlayer)

    if (wasSaved) {
      setSuccessMessage('Socio creado.')
      form.reset()
    }
  }

  async function handleConfirmSave() {
    if (!playerToSave) {
      return
    }

    const wasSaved = await onSavePlayer(playerToSave)

    if (wasSaved) {
      setPlayerToSave(null)
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#DB5D4F]">
          Registro
        </p>
        <h2 className="text-2xl font-bold text-slate-900">
          {editingPlayer ? 'Editar socio' : 'Nuevo socio'}
        </h2>
      </div>

      <form className="grid min-w-0 gap-4" key={editingPlayer?.id ?? 'new-player'} onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nombre
          <input
            className="input-field"
            defaultValue={editingPlayer?.name ?? ''}
            name="name"
            placeholder="Ej: Martin Silva"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Telefono
            <input
              className="input-field"
              defaultValue={editingPlayer?.phone ?? ''}
              name="phone"
              onInput={handlePhoneChange}
              pattern="[0-9+\s()-]+"
              placeholder="+56 9 1234 5678"
              required
              title="Ingresa solo numeros y caracteres como +, espacios, parentesis o guiones."
              type="tel"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              className="input-field"
              defaultValue={editingPlayer?.email ?? ''}
              name="email"
              placeholder="nombre@email.com"
              type="email"
              required
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Permisos
          <select className="input-field" defaultValue={editingPlayer?.role ?? 'member'} name="role" required>
            <option value="member">Socio</option>
            <option value="admin">Administrador</option>
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <button className="primary-button" type="submit">
            {editingPlayer ? 'Guardar cambios' : 'Agregar socio'}
          </button>
          {editingPlayer ? (
            <button className="secondary-button" onClick={onCancelEdit} type="button">
              Salir de edicion
            </button>
          ) : null}
        </div>

        {successMessage ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </p>
        ) : null}
      </form>

      <ConfirmDialog
        confirmLabel="Guardar cambios"
        isOpen={playerToSave !== null}
        message={
          editingPlayer
            ? `Esta seguro que desea editar este socio: ${editingPlayer.name}?`
            : ''
        }
        onCancel={() => setPlayerToSave(null)}
        onConfirm={handleConfirmSave}
        title="Editar socio"
      />
    </section>
  )
}
