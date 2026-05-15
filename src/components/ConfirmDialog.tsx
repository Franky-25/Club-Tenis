type ConfirmDialogProps = {
  confirmLabel: string
  isOpen: boolean
  message: string
  title: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  confirmLabel,
  isOpen,
  message,
  title,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 text-left shadow-2xl">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
            Confirmacion
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button className="secondary-button" onClick={onCancel} type="button">
            Volver
          </button>
          <button className="danger-button" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
