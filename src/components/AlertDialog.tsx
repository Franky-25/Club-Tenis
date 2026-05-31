type AlertDialogProps = {
  isOpen: boolean
  message: string
  title: string
  onClose: () => void
}

export function AlertDialog({ isOpen, message, title, onClose }: AlertDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl sm:p-7">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
            Aviso
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
            {message}
          </p>
        </div>

        <div className="flex justify-end">
          <button className="primary-button px-8 sm:w-auto" onClick={onClose} type="button">
            Aceptar
          </button>
        </div>
      </section>
    </div>
  )
}
