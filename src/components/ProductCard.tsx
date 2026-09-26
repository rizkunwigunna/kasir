import React from 'react'
import type { Product } from '../types'
import { formatRupiah } from '../services/storage'
import { Plus, Minus, Package, AlertCircle } from 'lucide-react'

interface ProductCardProps {
  product: Product
  cartQuantity: number
  onAddToCart: (product: Product) => void
  onUpdateQuantity: (product: Product, delta: number) => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <div
      onClick={() => {
        if (!isOutOfStock && cartQuantity === 0) {
          onAddToCart(product)
        }
      }}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl p-3 border transition-all duration-200 shadow-sm ${
        isOutOfStock
          ? 'opacity-60 border-slate-200 cursor-not-allowed'
          : cartQuantity > 0
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md cursor-pointer'
          : 'border-slate-200/80 hover:border-emerald-400 active:scale-[0.98] cursor-pointer'
      }`}
    >
      <div>
        {/* Product Image / Placeholder */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-emerald-600">
              <Package className="w-8 h-8 opacity-40" />
            </div>
          )}

          {/* Stock Badges */}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow">
                Habis
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute top-1.5 left-1.5 bg-amber-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <AlertCircle className="w-3 h-3" /> Sisa {product.stock}
            </div>
          ) : (
            <div className="absolute top-1.5 left-1.5 bg-black/40 backdrop-blur-xs text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
              Stok {product.stock}
            </div>
          )}

          {/* Barcode badge if exists */}
          {product.barcode && (
            <div className="absolute bottom-1.5 right-1.5 bg-white/80 backdrop-blur-xs text-slate-700 text-[9px] font-mono px-1 rounded shadow-xs">
              #{product.barcode}
            </div>
          )}
        </div>

        {/* Product Category & Title */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md truncate max-w-full">
            {product.category}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>
      </div>

      {/* Pricing & Add/Quantity Actions */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <div>
          <span className="text-xs font-bold text-emerald-600">
            {formatRupiah(product.price)}
          </span>
          {product.unit && (
            <span className="text-[10px] text-slate-500 ml-0.5">/{product.unit}</span>
          )}
        </div>

        {/* Action button */}
        {isOutOfStock ? (
          <span className="text-[11px] font-medium text-slate-400">Habis</span>
        ) : cartQuantity > 0 ? (
          <div
            className="flex items-center bg-emerald-50 rounded-lg p-0.5 border border-emerald-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onUpdateQuantity(product, -1)}
              className="w-6 h-6 rounded-md bg-white text-emerald-700 hover:bg-emerald-100 active:scale-90 flex items-center justify-center shadow-xs"
              title="Kurang"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-emerald-800">
              {cartQuantity}
            </span>
            <button
              onClick={() => {
                if (cartQuantity < product.stock) {
                  onUpdateQuantity(product, 1)
                }
              }}
              disabled={cartQuantity >= product.stock}
              className={`w-6 h-6 rounded-md flex items-center justify-center shadow-xs ${
                cartQuantity >= product.stock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-90'
              }`}
              title="Tambah"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            type="button"
            className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white flex items-center justify-center shadow-sm transition-all"
            title="Tambah ke keranjang"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  )
}
