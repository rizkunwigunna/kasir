import React, { useState } from 'react'
import type { Transaction, StoreProfile } from '../types'
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsAppReceiptText,
} from '../services/storage'
import {
  Printer,
  Share2,
  CheckCircle,
  X,
  Phone,
} from 'lucide-react'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  store: StoreProfile
  onNewTransaction: () => void
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  store,
  onNewTransaction,
}) => {
  const [waPhone, setWaPhone] = useState('')
  const [showWaInput, setShowWaInput] = useState(false)

  if (!isOpen || !transaction) return null

  const handlePrint = () => {
    window.print()
  }

  const handleSendWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const textEncoded = generateWhatsAppReceiptText(transaction, store)
    let url = `https://api.whatsapp.com/send?text=${textEncoded}`
    if (waPhone.trim()) {
      let cleanPhone = waPhone.trim().replace(/\D/g, '')
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1)
      }
      url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${textEncoded}`
    }
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-3 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Transaksi Berhasil!
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-emerald-800 hover:bg-emerald-900 active:scale-95 flex items-center justify-center text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="p-4 bg-slate-100 overflow-y-auto max-h-[65vh]">
          {/* Authentic Thermal Receipt Paper */}
          <div
            id="thermal-receipt"
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed relative"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                {store.name}
              </h2>
              <p className="text-[10px] text-slate-600 m-0">{store.address}</p>
              {store.phone && (
                <p className="text-[10px] text-slate-600 m-0">Telp/WA: {store.phone}</p>
              )}
            </div>

            {/* Invoice Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-0.5 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>No. Faktur:</span>
                <span className="font-bold text-slate-800">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDateIndo(transaction.date)}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-semibold text-slate-800">
                    {transaction.customerName}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tipe Order:</span>
                <span className="font-semibold uppercase text-slate-800">
                  {transaction.orderType === 'dine-in'
                    ? 'Makan di Tempat'
                    : transaction.orderType === 'take-away'
                    ? 'Bungkus / Take Away'
                    : 'Pesan Antar'}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                  {item.note && (
                    <div className="text-[9px] italic text-slate-500 pl-1">
                      *{item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Diskon</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}
              {transaction.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Pajak</span>
                  <span>{formatRupiah(transaction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL</span>
                <span className="text-emerald-700">{formatRupiah(transaction.total)}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 text-[10px]">
                <span>Metode Bayar</span>
                <span className="font-bold uppercase text-slate-900">
                  {transaction.paymentMethod}
                </span>
              </div>
              {transaction.paymentMethod === 'tunai' && transaction.cashAmount && (
                <>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>Tunai Diterima</span>
                    <span>{formatRupiah(transaction.cashAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>Kembalian</span>
                    <span className="font-bold text-slate-900">
                      {formatRupiah(transaction.changeAmount || 0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Message */}
            <div className="pt-3 text-center text-[10px] text-slate-500 whitespace-pre-line">
              {store.receiptFooter}
            </div>
          </div>
        </div>

        {/* WhatsApp Phone Form (if open) */}
        {showWaInput && (
          <div className="p-3 bg-emerald-50 border-t border-emerald-200 animate-in fade-in">
            <form onSubmit={handleSendWhatsApp} className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Nomor WA (cth: 0812...)"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Kirim
              </button>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Cetak Struk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowWaInput(!showWaInput)
                if (showWaInput) {
                  handleSendWhatsApp()
                }
              }}
              className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Kirim WA</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNewTransaction}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesai & Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  )
}
