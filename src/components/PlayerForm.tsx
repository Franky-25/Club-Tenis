import type { FormEvent } from 'react'
import type { Player } from '../types'

type PlayerFormProps = {
  onAddPlayer: (player: Omit<Player, 'id'>) => void
}

export function PlayerForm({ onAddPlayer }: PlayerFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    onAddPlayer({
      name: String(formData.get('name') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
    })

    event.currentTarget.reset()
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#DB5D4F]">
          Registro
        </p>
        <h2 className="text-2xl font-bold text-slate-900">Nuevo socio</h2>
      </div>

      <form className="grid min-w-0 gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nombre
          <input className="input-field" name="name" placeholder="Ej: Martin Silva" required />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Telefono
            <input className="input-field" name="phone" placeholder="+56 9 1234 5678" required />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input className="input-field" name="email" placeholder="nombre@email.com" type="email" required />
          </label>
        </div>

        <button className="primary-button" type="submit">
          Agregar socio
        </button>
      </form>
    </section>
  )
}
