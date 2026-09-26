import React, { useState } from 'react'
import type { CartItem } from '../types'
import { formatRupiah } from '../services/storage'
import {
  X,
  Trash2,
  Plus,
  Minus,
  Utensils,
  ShoppingBag,
  Percent,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  customerName: string
  setCustomerName: (name: string) => void
  orderType: 'dine-in' | 'take-away' | 'delivery'
  setOrderType: (type: 'dine-in' | 'take-away' | 'delivery') => void
  discount: number
  setDiscount: (discount: number) => void
  taxPercent: number
  onUpdateQuantity: (productId: string, delta: number) => void
  onUpdateNote: (productId: string, note: string) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  onProceedToPayment: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  customerName,
  setCustomerName,
  orderType,
  setOrderType,
  discount,
  setDiscount,
  taxPercent,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveItem,
  onClearCart,
  onProceedToPayment,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [showDiscountInput, setShowDiscountInput] = useState(discount > 0)

  if (!isOpen) return null

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const taxableAmount = Math.max(0, subtotal - discount)
  const tax = Math.round((taxableAmount * taxPercent) / 100)
  const grandTotal = Math.max(0, taxableAmount + tax)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {cart.reduce((total, i) => total + i.quantity, 0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 m-0">
                Keranjang Pesanan
              </h2>
              <p className="text-xs text-slate-500 m-0">Periksa rincian sebelum bayar</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Kosongkan semua pesanan di keranjang?')) {
                    onClearCart()
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-600 active:scale-95 transition-all"
                title="Hapus Semua"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Details: Customer Name & Type */}
        <div className="p-3 bg-slate-100/70 border-b border-slate-200 space-y-2.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOrderType('dine-in')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                orderType === 'dine-in'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Makan Sini
            </button>
            <button
              type="button"
              onClick={() => setOrderType('take-away')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                orderType === 'take-away'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Bungkus
            </button>
          </div>
          <input
            type="text"
            placeholder="Nama Pelanggan / No. Meja (opsional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <ShoppingBag className="w-16 h-16 stroke-1 text-slate-300 mb-3" />
              <p className="text-sm font-medium">Keranjang masih kosong</p>
              <p className="text-xs text-slate-400 text-center max-w-xs mt-1">
                Pilih menu di katalog kasir untuk mulai menambahkan pesanan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {formatRupiah(item.product.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Note toggle */}
                {activeNoteId === item.product.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Catatan (cth: tidak pedas, es sedikit)"
                      value={item.note || ''}
                      onChange={(e) => onUpdateNote(item.product.id, e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                    <button
                      onClick={() => setActiveNoteId(null)}
                      className="text-[11px] text-emerald-600 font-bold px-2 py-1 bg-emerald-50 rounded-lg"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setActiveNoteId(item.product.id)}
                      className="text-[10px] text-slate-400 hover:text-emerald-600 flex items-center gap-1 py-0.5"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {item.note ? (
                        <span className="text-slate-700 italic font-medium truncate max-w-[160px]">
                          "{item.note}"
                        </span>
                      ) : (
                        '+ Tambah Catatan'
                      )}
                    </button>
                  </div>
                )}

                {/* Subtotal & Quantity controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-900">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-md bg-white text-slate-700 hover:bg-slate-200 active:scale-90 flex items-center justify-center shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        if (item.quantity < item.product.stock) {
                          onUpdateQuantity(item.product.id, 1)
                        }
                      }}
                      disabled={item.quantity >= item.product.stock}
                      className={`w-6 h-6 rounded-md flex items-center justify-center shadow-xs ${
                        item.quantity >= item.product.stock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-slate-200 shadow-lg space-y-3">
            {/* Discount row toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowDiscountInput(!showDiscountInput)}
                  className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Percent className="w-3.5 h-3.5" />
                  {showDiscountInput ? 'Tutup Diskon' : '+ Beri Diskon'}
                </button>
                {discount > 0 && (
                  <span className="text-red-500 font-semibold">
                    -{formatRupiah(discount)}
                  </span>
                )}
              </div>

              {showDiscountInput && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                  <input
                    type="number"
                    min="0"
                    placeholder="Nominal Diskon (Rp)"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {discount > 0 && (
                    <button
                      onClick={() => setDiscount(0)}
                      className="text-xs text-slate-400 hover:text-red-500"
                    >
                      Batal
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 pt-1 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((t, i) => t + i.quantity, 0)} item)</span>
                <span className="font-semibold">{formatRupiah(subtotal)}</span>
              </div>
              {taxPercent > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Pajak ({taxPercent}%)</span>
                  <span>{formatRupiah(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Pembayaran</span>
                <span className="text-emerald-700 text-base">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={onProceedToPayment}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
