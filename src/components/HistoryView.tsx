import React, { useState, useMemo } from 'react'
import type { Transaction, StoreProfile, Product } from '../types'
import { formatRupiah, formatDateIndo } from '../services/storage'
import {
  Search,
  Calendar,
  RotateCcw,
  Receipt,
  FileText,
  DollarSign,
  ShoppingBag,
} from 'lucide-react'

interface HistoryViewProps {
  transactions: Transaction[]
  store: StoreProfile
  products: Product[]
  onViewReceipt: (transaction: Transaction) => void
  onCancelTransaction: (transactionId: string) => void
}

type DateFilter = 'today' | 'week' | 'month' | 'all'

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onViewReceipt,
  onCancelTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    return transactions.filter((tx) => {
      const txTime = new Date(tx.date).getTime()

      // Date filter
      if (dateFilter === 'today' && txTime < todayStart) return false
      if (dateFilter === 'week' && txTime < weekAgo) return false
      if (dateFilter === 'month' && txTime < monthStart) return false

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchesInvoice = tx.invoiceNumber.toLowerCase().includes(query)
        const matchesCustomer = tx.customerName?.toLowerCase().includes(query)
        const matchesItem = tx.items.some((item) =>
          item.name.toLowerCase().includes(query)
        )
        return matchesInvoice || matchesCustomer || matchesItem
      }

      return true
    })
  }, [transactions, dateFilter, searchTerm])

  const stats = useMemo(() => {
    const active = filteredTransactions.filter((tx) => tx.status === 'completed')
    const totalRev = active.reduce((sum, tx) => sum + tx.total, 0)
    return {
      count: active.length,
      revenue: totalRev,
    }
  }, [filteredTransactions])

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Pendapatan
            </span>
            <div className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              {formatRupiah(stats.revenue)}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Transaksi
            </span>
            <div className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              {stats.count} Transaksi
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
        {/* Date Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: '7 Hari' },
            { id: 'month', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id as DateFilter)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                dateFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no. faktur / pelanggan / menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
            <FileText className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada riwayat transaksi</p>
            <p className="text-xs text-slate-400">
              Transaksi yang selesai akan tercatat otomatis di sini.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isCancelled = tx.status === 'cancelled'
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className={`p-3.5 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs active:scale-[0.99] ${
                  isCancelled
                    ? 'border-red-200 bg-red-50/20 opacity-70'
                    : 'border-slate-200/80 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {tx.invoiceNumber}
                      </span>
                      {isCancelled ? (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                          DIBATALKAN
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded uppercase">
                          {tx.paymentMethod}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateIndo(tx.date)}</span>
                      {tx.customerName && (
                        <span>• Pelanggan: {tx.customerName}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-black ${
                        isCancelled ? 'line-through text-slate-400' : 'text-emerald-700'
                      }`}
                    >
                      {formatRupiah(tx.total)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {tx.items.reduce((s, i) => s + i.quantity, 0)} item
                    </span>
                  </div>
                </div>

                {/* Items teaser */}
                <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 line-clamp-1">
                  {tx.items.map((i) => `${i.name} (${i.quantity}x)`).join(', ')}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Detail Transaksi</h3>
                <span className="font-mono text-xs text-slate-500">
                  {selectedTx.invoiceNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-500">
                  <span>Waktu:</span>
                  <span className="font-medium text-slate-800">
                    {formatDateIndo(selectedTx.date)}
                  </span>
                </div>
                {selectedTx.customerName && (
                  <div className="flex justify-between text-slate-500">
                    <span>Pelanggan:</span>
                    <span className="font-medium text-slate-800">
                      {selectedTx.customerName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Metode Bayar:</span>
                  <span className="font-bold uppercase text-slate-800">
                    {selectedTx.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Status:</span>
                  <span
                    className={`font-bold uppercase ${
                      selectedTx.status === 'completed'
                        ? 'text-emerald-700'
                        : 'text-red-600'
                    }`}
                  >
                    {selectedTx.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 block">Rincian Item:</span>
                {selectedTx.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-1 border-b border-slate-100"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{i.name}</span>
                      <div className="text-[10px] text-slate-400">
                        {i.quantity} x {formatRupiah(i.price)}
                      </div>
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatRupiah(i.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(selectedTx.subtotal)}</span>
                </div>
                {selectedTx.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon</span>
                    <span>-{formatRupiah(selectedTx.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-emerald-700">
                    {formatRupiah(selectedTx.total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onViewReceipt(selectedTx)
                  setSelectedTx(null)
                }}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Receipt className="w-4 h-4" />
                <span>Lihat Struk</span>
              </button>

              {selectedTx.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Batalkan transaksi ini? Stok produk akan dikembalikan otomatis ke inventaris.'
                      )
                    ) {
                      onCancelTransaction(selectedTx.id)
                      setSelectedTx(null)
                    }
                  }}
                  className="py-2 px-3 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                  title="Batalkan & Kembalikan Stok"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Void</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
