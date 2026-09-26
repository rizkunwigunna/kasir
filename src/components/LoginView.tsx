import React, { useState } from 'react'
import type { User, StoreProfile } from '../types'
import {
  Store,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react'

interface LoginViewProps {
  store: StoreProfile
  users: User[]
  onLoginSuccess: (user: User) => void
}

export const LoginView: React.FC<LoginViewProps> = ({
  store,
  users,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanUsername = username.trim().toLowerCase()
    const cleanPin = pin.trim()

    if (!cleanUsername || !cleanPin) {
      setErrorMsg('Mohon masukkan Username dan PIN!')
      return
    }

    setIsLoading(true)

    // Simulate snappy login check
    setTimeout(() => {
      const foundUser = users.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername &&
          u.pin.toString() === cleanPin
      )

      if (foundUser) {
        onLoginSuccess(foundUser)
      } else {
        setErrorMsg('Username atau PIN yang Anda masukkan salah!')
        setIsLoading(false)
      }
    }, 200)
  }

  // Quick preset login helper
  const handleQuickLogin = (role: 'admin' | 'kasir') => {
    const target = users.find((u) => u.role === role)
    if (target) {
      setUsername(target.username)
      setPin(target.pin)
      setErrorMsg(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header / Store Branding */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 to-emerald-600 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-black/10 rounded-full blur-md pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Store className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-xl font-black tracking-tight uppercase m-0">
            {store.name}
          </h1>
          <p className="text-xs text-emerald-100 mt-1 opacity-90 m-0">
            {store.tagline || 'Sistem Kasir Pintar'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 m-0">Masuk ke Kasir</h2>
            <p className="text-xs text-slate-500 m-0">
              Silakan login untuk memulai transaksi atau kelola toko
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Username Akun
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="admin / kasir..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* PIN / Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  PIN / Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  placeholder="Masukkan PIN (cth: 123456)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white tracking-widest transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all text-sm disabled:opacity-50"
            >
              <span>{isLoading ? 'Memeriksa Akun...' : 'Masuk Sekarang'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Helper Chips */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Pilihan Masuk Cepat (Akun Bawaan)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 active:scale-95 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Akun Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  User: <b>admin</b> | PIN: <b>123456</b>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kasir')}
                className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 active:scale-95 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-sky-800 font-bold text-xs">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Akun Kasir</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  User: <b>kasir</b> | PIN: <b>123456</b>
                </div>
              </button>
            </div>
          </div>

          {/* Role explanation */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 text-slate-700 font-bold">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hak Akses Akun:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
              <li><b>Admin / Owner:</b> Akses penuh ke kasir, stok, laporan omset, dan pengaturan.</li>
              <li><b>Kasir / Staf:</b> Dibatasi hanya bisa membuka layar transaksi kasir saja.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer copyright note */}
      <p className="text-[11px] text-emerald-200/70 mt-6 text-center">
        Aplikasi Kasir POS &bull; Aman & Offline-Ready
      </p>
    </div>
  )
}
