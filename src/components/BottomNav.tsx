import React from 'react'
import type { ActiveTab } from '../types'
import { ShoppingCart, Clock, Package, BarChart3, Settings } from 'lucide-react'

interface BottomNavProps {
  activeTab: ActiveTab
  onChangeTab: (tab: ActiveTab) => void
  cartCount: number
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  cartCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'pos', label: 'Kasir', icon: ShoppingCart },
    { id: 'history', label: 'Riwayat', icon: Clock },
    { id: 'inventory', label: 'Produk', icon: Package },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'settings', label: 'Toko', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center relative py-1 transition-all ${
                isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {tab.id === 'pos' && cartCount > 0 && (
                <span className="absolute top-1.5 right-1/4 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <div
                className={`p-1 rounded-full transition-transform ${
                  isActive ? 'scale-110 bg-emerald-50' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
