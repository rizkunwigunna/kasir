import React, { useState, useEffect } from 'react'
import type { PaymentMethod } from '../types'
import { formatRupiah } from '../services/storage'
import confetti from 'canvas-confetti'
import {
  X,
  Banknote,
  QrCode,
  Building2,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onComplete: (
    paymentMethod: PaymentMethod,
    cashAmount?: number,
    changeAmount?: number
  ) => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onComplete,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('tunai')
  const [cashGiven, setCashGiven] = useState<number>(totalAmount)
  const [copiedBank, setCopiedBank] = useState<string | null>(null)

  // Reset cash given when total changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCashGiven(totalAmount)
    }
  }, [isOpen, totalAmount])

  if (!isOpen) return null

  const change = Math.max(0, cashGiven - totalAmount)
  const isInsufficient = method === 'tunai' && cashGiven < totalAmount

  const handleCashShortcut = (amount: number) => {
    setCashGiven(amount)
  }

  const handleAddCash = (amount: number) => {
    setCashGiven((prev) => (prev || 0) + amount)
  }

  const handleConfirm = () => {
    if (isInsufficient) return

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch (e) {
      console.warn('Confetti error', e)
    }

    onComplete(
      method,
      method === 'tunai' ? cashGiven : undefined,
      method === 'tunai' ? change : undefined
    )
  }

  const copyToClipboard = (text: string, bank: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedBank(bank)
    setTimeout(() => setCopiedBank(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800 m-0">Pembayaran</h3>
            <p className="text-xs text-slate-500 m-0">Pilih metode & selesaikan transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 active:scale-95 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Total Tag */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Total Tagihan
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight mt-0.5">
              {formatRupiah(totalAmount)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'tunai', label: 'Tunai', icon: Banknote },
                { id: 'qris', label: 'QRIS', icon: QrCode },
                { id: 'transfer', label: 'Transfer', icon: Building2 },
                { id: 'debit', label: 'Kartu', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon
                const isSelected = method === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id as PaymentMethod)}
                    className={`py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Conditional Method Body */}
          {method === 'tunai' && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Uang Diterima (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Nominal Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">
                  Nominal Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCashShortcut(totalAmount)}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-semibold rounded-lg text-slate-800 border border-slate-200"
                  >
                    Uang Pas
                  </button>
                  {[10000, 20000, 50000, 100000].map((nominal) => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => handleCashShortcut(nominal)}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-semibold rounded-lg text-slate-800 border border-slate-200"
                    >
                      {formatRupiah(nominal)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddCash(50000)}
                    className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold rounded-lg text-emerald-800 border border-emerald-200"
                  >
                    +50rb
                  </button>
                </div>
              </div>

              {/* Kembalian / Insufficient indicator */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isInsufficient
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-xs font-bold">
                  {isInsufficient ? 'Uang Masih Kurang:' : 'Kembalian:'}
                </span>
                <span className="text-base font-black">
                  {isInsufficient
                    ? formatRupiah(totalAmount - cashGiven)
                    : formatRupiah(change)}
                </span>
              </div>
            </div>
          )}

          {method === 'qris' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="w-48 h-48 bg-white flex flex-col items-center justify-center p-2 border border-slate-100 rounded-lg">
                  <QrCode className="w-36 h-36 text-slate-900 stroke-1" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 mt-1">
                    NMID: ID1029384756
                  </span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800">
                  Scan QRIS Menggunakan HP Pelanggan
                </span>
                <p className="text-[11px] text-slate-500">
                  Mendukung BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, DANA & LinkAja.
                </p>
              </div>
            </div>
          )}

          {method === 'transfer' && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Pilih Rekening Tujuan Transfer:
              </span>
              {[
                { bank: 'BCA', no: '1234567890', name: 'KASIR NUSANTARA' },
                { bank: 'Mandiri', no: '1370009876543', name: 'KASIR NUSANTARA' },
                { bank: 'BRI', no: '012301009876501', name: 'KASIR NUSANTARA' },
              ].map((acc) => (
                <div
                  key={acc.bank}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-emerald-800">{acc.bank}</span>
                    <p className="font-mono font-bold text-slate-800 text-sm tracking-wide m-0">
                      {acc.no}
                    </p>
                    <span className="text-[10px] text-slate-500">a/n {acc.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(acc.no, acc.bank)}
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 active:scale-95 flex items-center gap-1 font-medium"
                  >
                    {copiedBank === acc.bank ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600">Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Salin</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {method === 'debit' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <CreditCard className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="text-xs font-bold text-slate-800">
                Gesek / Masukkan Kartu di Mesin EDC
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Pastikan transaksi di mesin EDC berhasil sebelum menekan tombol Selesai di bawah.
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 active:scale-95 text-xs transition-all"
          >
            Kembali
          </button>
          <button
            type="button"
            disabled={isInsufficient}
            onClick={handleConfirm}
            className={`flex-2 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all ${
              isInsufficient
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesaikan & Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  )
}
