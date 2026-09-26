import React from 'react'
import type { StoreProfile, ActiveTab, User } from '../types'
import { Store, Camera, ShoppingBag, LogOut, ShieldCheck, UserCheck } from 'lucide-react'

interface NavbarProps {
  store: StoreProfile
  activeTab: ActiveTab
  cartItemCount: number
  currentUser: User | null
  onLogout: () => void
  onOpenCart: () => void
  onOpenScanner: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  store,
  activeTab,
  cartItemCount,
  currentUser,
  onLogout,
  onOpenCart,
  onOpenScanner,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Store Name */}
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight truncate">
            <h1 className="text-base font-bold truncate text-white m-0 tracking-tight">
              {store.name}
            </h1>
            <p className="text-xs text-emerald-100 truncate opacity-90 m-0">
              {store.tagline || 'Sistem Kasir Pintar'}
            </p>
          </div>
        </div>

        {/* Quick Actions (User, Scan Barcode, Cart Drawer, Logout) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {currentUser && (
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              )}
              <div className="flex flex-col text-left leading-none">
                <span className="font-bold text-white text-[11px] truncate max-w-20 sm:max-w-28">
                  {currentUser.name}
                </span>
                <span className={`text-[9px] font-bold uppercase ${
                  currentUser.role === 'admin' ? 'text-amber-300' : 'text-sky-300'
                }`}>
                  {currentUser.role === 'admin' ? 'Admin' : 'Kasir'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'pos' && (
            <button
              onClick={onOpenScanner}
              type="button"
              className="p-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 active:scale-95 text-white transition-all flex items-center justify-center shadow-sm"
              title="Scan Barcode Kamera HP"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {activeTab === 'pos' && (
            <button
              onClick={onOpenCart}
              type="button"
              className="relative p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white transition-all flex items-center justify-center shadow-sm"
              title="Buka Keranjang"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-emerald-950 text-xs font-black px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center shadow-md animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {currentUser && (
            <button
              onClick={onLogout}
              type="button"
              className="p-2 sm:p-2.5 rounded-xl bg-emerald-900/80 hover:bg-red-600 active:scale-95 text-emerald-100 hover:text-white transition-all flex items-center justify-center shadow-sm"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
