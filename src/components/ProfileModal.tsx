import React, { useState } from 'react'
import type { User } from '../types'
import {
  X,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
  CheckCircle,
  Info,
} from 'lucide-react'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  allUsers: User[]
  onUpdateProfile: (updatedUser: User) => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser.name)
  const [username, setUsername] = useState(currentUser.username)
  const [pin, setPin] = useState(currentUser.pin)
  const [showPin, setShowPin] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanName = name.trim()
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '')
    const cleanPin = pin.trim()

    if (!cleanName || !cleanUsername || !cleanPin) {
      setErrorMsg('Nama, Username, dan PIN wajib diisi!')
      return
    }

    if (cleanPin.length < 4) {
      setErrorMsg('PIN minimal 4 digit/karakter untuk keamanan!')
      return
    }

    // Check duplicate username against other users
    const isDuplicate = allUsers.some(
      (u) =>
        u.id !== currentUser.id &&
        u.username.toLowerCase() === cleanUsername
    )

    if (isDuplicate) {
      setErrorMsg(`Username "${cleanUsername}" sudah digunakan oleh akun lain! Silakan pilih username lain.`)
      return
    }

    const updatedUser: User = {
      ...currentUser,
      name: cleanName,
      username: cleanUsername,
      pin: cleanPin,
    }

    onUpdateProfile(updatedUser)
    setIsSuccess(true)

    setTimeout(() => {
      setIsSuccess(false)
      onClose()
    }, 1200)
  }

  const isKasir = currentUser.role === 'kasir'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isKasir ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isKasir ? <UserCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0">
                {isKasir ? 'Ubah Akun Kasir' : 'Ubah Profil Admin'}
              </h3>
              <p className="text-[11px] text-slate-500 m-0">
                Ganti username & PIN login Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 animate-shake">
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5 font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Username & PIN berhasil diperbarui!</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Username Login
            </label>
            <div className="relative">
              <span className="text-slate-400 font-mono font-bold absolute left-3 top-1/2 -translate-y-1/2 text-xs">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white lowercase"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Gunakan huruf kecil tanpa spasi
            </span>
          </div>

          {/* PIN / Password Field */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              PIN / Password Baru
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN baru..."
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Minimal 4 angka / karakter
            </span>
          </div>

          {/* Admin Sync Notice */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-700">
              <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Sinkronisasi Otomatis:</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 m-0">
              Admin/Owner dapat melihat username dan PIN aktif Anda di menu Pengaturan Toko untuk keperluan keamanan dan administrasi.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-md shadow-emerald-600/20"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
