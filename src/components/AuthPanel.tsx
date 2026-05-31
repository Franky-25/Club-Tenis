import { useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { canCreateAccessForRegisteredPlayer } from '../lib/clubRepository'
import { supabase } from '../lib/supabase'

type AuthPanelProps = {
  accessMessage?: string
  onAuthenticated: (session: Session) => void
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }

  return fallbackMessage
}

function translateAuthError(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Correo o contrasena incorrectos.'
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de ingresar.'
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'Este correo ya tiene acceso creado.'
  }

  if (normalizedMessage.includes('password should be at least')) {
    return 'La contrasena debe tener al menos 6 caracteres.'
  }

  if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('frequency')) {
    return 'Se alcanzo el limite de intentos. Espera unos minutos e intenta nuevamente.'
  }

  return message
}

export function AuthPanel({ accessMessage, onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (mode === 'signup') {
      try {
        const canCreateAccess = await canCreateAccessForRegisteredPlayer(email)

        if (!canCreateAccess) {
          setErrorMessage('Este correo no esta registrado como socio. Solicita que lo agreguen primero.')
          setIsSubmitting(false)
          return
        }
      } catch (error) {
        setErrorMessage(getErrorMessage(error, 'No se pudo validar el correo.'))
        setIsSubmitting(false)
        return
      }
    }

    const { data, error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(translateAuthError(error.message))
      return
    }

    if (mode === 'signup' && !data.session) {
      setSuccessMessage('Acceso creado. Revisa tu correo si Supabase solicita confirmacion.')
      return
    }

    if (data.session) {
      onAuthenticated(data.session)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-800">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img
            alt="Club Deportivo de Tenis Las Torres"
            className="h-32 w-32 object-contain"
            src="/club-logo.png"
          />
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-[#DB5D4F]">
            Club Deportivo de Tenis Las Torres
          </p>
        </div>
        <h1 className="mt-2 text-center text-2xl font-bold text-slate-900">
          {mode === 'signin' ? 'Ingresar Socio' : 'Crear acceso de socio'}
        </h1>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input className="input-field" name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Contrasena
            <input className="input-field" minLength={6} name="password" required type="password" />
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Conectando...' : mode === 'signin' ? 'Ingresar' : 'Crear acceso'}
          </button>
        </form>

        {successMessage ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        {errorMessage || accessMessage ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {errorMessage || accessMessage}
          </p>
        ) : null}

        <button
          className="mt-4 text-sm font-bold text-[#B94439]"
          onClick={() => {
            setMode((currentMode) => (currentMode === 'signin' ? 'signup' : 'signin'))
            setErrorMessage('')
            setSuccessMessage('')
          }}
          type="button"
        >
          {mode === 'signin' ? 'Crear acceso de socio' : 'Ya tengo acceso'}
        </button>
      </section>
    </div>
  )
}
