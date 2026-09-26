import React, { useState, useMemo } from 'react'
import type { Transaction, Product } from '../types'
import { formatRupiah } from '../services/storage'
import {
  TrendingUp,
  Award,
  Wallet,
  ShoppingBag,
  CreditCard,
  Utensils,
} from 'lucide-react'

interface AnalyticsViewProps {
  transactions: Transaction[]
  products: Product[]
}

type Period = 'today' | 'week' | 'month' | 'all'

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  products,
}) => {
  const [period, setPeriod] = useState<Period>('today')

  // Filter transactions based on period
  const filtered = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    return transactions.filter((tx) => {
      if (tx.status === 'cancelled') return false
      const t = new Date(tx.date).getTime()
      if (period === 'today') return t >= todayStart
      if (period === 'week') return t >= weekAgo
      if (period === 'month') return t >= monthStart
      return true
    })
  }, [transactions, period])

  // Calculation Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0
    let totalDiscount = 0
    let totalItemsSold = 0
    let estimatedCost = 0

    // Map product cost
    const productCostMap = new Map<string, number>()
    products.forEach((p) => productCostMap.set(p.id, p.costPrice || 0))

    // Top items count
    const itemCountMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >()

    // Payment methods count
    const paymentMap: Record<string, number> = {
      tunai: 0,
      qris: 0,
      transfer: 0,
      debit: 0,
    }

    // Order types count
    const orderTypeMap: Record<string, number> = {
      'dine-in': 0,
      'take-away': 0,
      delivery: 0,
    }

    filtered.forEach((tx) => {
      totalRevenue += tx.total
      totalDiscount += tx.discount
      paymentMap[tx.paymentMethod] = (paymentMap[tx.paymentMethod] || 0) + tx.total
      orderTypeMap[tx.orderType] = (orderTypeMap[tx.orderType] || 0) + 1

      tx.items.forEach((item) => {
        totalItemsSold += item.quantity
        const unitCost = productCostMap.get(item.productId) || 0
        estimatedCost += unitCost * item.quantity

        const existing = itemCountMap.get(item.name) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        }
        existing.quantity += item.quantity
        existing.revenue += item.subtotal
        itemCountMap.set(item.name, existing)
      })
    })

    const topItems = Array.from(itemCountMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    const estimatedProfit = Math.max(0, totalRevenue - estimatedCost)
    const averageOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0

    return {
      revenue: totalRevenue,
      transactionsCount: filtered.length,
      profit: estimatedProfit,
      itemsSold: totalItemsSold,
      aov: averageOrderValue,
      discount: totalDiscount,
      topItems,
      paymentMap,
      orderTypeMap,
    }
  }, [filtered, products])

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 m-0">Laporan Penjualan</h2>
            <p className="text-xs text-slate-500 m-0">Ringkasan performa omset toko</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: '7 Hari' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua Waktu' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as Period)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                period === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Omset */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md col-span-2">
          <div className="flex items-center justify-between opacity-90 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Omset (Pendapatan)
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            {formatRupiah(metrics.revenue)}
          </div>
          <div className="text-xs text-emerald-100 mt-1 flex items-center justify-between">
            <span>{metrics.transactionsCount} Transaksi Sukses</span>
            <span>Rata-rata: {formatRupiah(metrics.aov)}</span>
          </div>
        </div>

        {/* Keuntungan Bersih Estimasi */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Estimasi Margin
            </span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-800">
            {formatRupiah(metrics.profit)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Pendapatan - Harga Modal</p>
        </div>

        {/* Produk Terjual */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Produk Terjual
            </span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-800">
            {metrics.itemsSold} Porsi / Cup
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Total unit item</p>
        </div>
      </div>

      {/* Top 5 Products Leaderboard */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800 m-0">
            Produk Terlaris (Top 5)
          </h3>
        </div>

        {metrics.topItems.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Belum ada data penjualan pada periode ini.
          </p>
        ) : (
          <div className="space-y-3">
            {metrics.topItems.map((item, index) => {
              const maxQty = metrics.topItems[0]?.quantity || 1
              const percent = Math.round((item.quantity / maxQty) * 100)

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          index === 0
                            ? 'bg-amber-400 text-amber-950'
                            : index === 1
                            ? 'bg-slate-300 text-slate-800'
                            : index === 2
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900">
                        {item.quantity} terjual
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Payment Methods & Order Types breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Payment Methods */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 m-0">Metode Pembayaran</h4>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { id: 'tunai', label: 'Tunai (Cash)', color: 'bg-emerald-500' },
              { id: 'qris', label: 'QRIS', color: 'bg-indigo-500' },
              { id: 'transfer', label: 'Transfer Bank', color: 'bg-amber-500' },
              { id: 'debit', label: 'Kartu Debit', color: 'bg-blue-500' },
            ].map((m) => {
              const amount = metrics.paymentMap[m.id] || 0
              const percent =
                metrics.revenue > 0 ? Math.round((amount / metrics.revenue) * 100) : 0

              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>{m.label}</span>
                    <span className="font-semibold text-slate-800">
                      {formatRupiah(amount)} ({percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} rounded-full`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Types */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800 m-0">Tipe Pemesanan</h4>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { id: 'dine-in', label: 'Makan di Tempat', color: 'bg-teal-500' },
              { id: 'take-away', label: 'Bungkus (Take Away)', color: 'bg-orange-500' },
            ].map((o) => {
              const count = metrics.orderTypeMap[o.id] || 0
              const totalOrders = metrics.transactionsCount || 1
              const percent = Math.round((count / totalOrders) * 100)

              return (
                <div key={o.id} className="space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>{o.label}</span>
                    <span className="font-semibold text-slate-800">
                      {count} pesanan ({percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${o.color} rounded-full`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
