import React, { useState } from 'react'
import type { Product } from '../types'
import { formatRupiah } from '../services/storage'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  X,
  Check,
  Tag,
} from 'lucide-react'

interface ProductManagerProps {
  products: Product[]
  categories: string[]
  onSaveProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  onAddCategory: (category: string) => void
  onDeleteCategory: (category: string) => void
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  categories,
  onSaveProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCatInput, setNewCatInput] = useState('')
  const [newCatModalInput, setNewCatModalInput] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    costPrice: 0,
    stock: 10,
    category: categories[1] || 'Makanan',
    barcode: '',
    unit: 'pcs',
    image: '',
  })

  const lowStockCount = products.filter((p) => p.stock <= 5).length

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCat =
      selectedCategory === 'Semua' || p.category === selectedCategory
    return matchesSearch && matchesCat
  })

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      price: 0,
      costPrice: 0,
      stock: 10,
      category: categories.find((c) => c !== 'Semua') || 'Kopi & Minuman',
      barcode: '',
      unit: 'pcs',
      image: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setFormData({ ...p })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.price) {
      alert('Nama produk dan harga jual wajib diisi!')
      return
    }

    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formData.name.trim(),
      price: Number(formData.price),
      costPrice: Number(formData.costPrice || 0),
      stock: Number(formData.stock || 0),
      category: formData.category || 'Lainnya',
      barcode: formData.barcode?.trim() || undefined,
      unit: formData.unit?.trim() || 'pcs',
      image: formData.image?.trim() || undefined,
    }

    onSaveProduct(productToSave)
    setIsModalOpen(false)
  }

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCatInput.trim()) {
      onAddCategory(newCatInput.trim())
      setFormData((prev) => ({ ...prev, category: newCatInput.trim() }))
      setNewCatInput('')
      setShowAddCat(false)
    }
  }

  const handleModalCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newCatModalInput.trim()
    if (trimmed) {
      if (categories.includes(trimmed)) {
        alert('Kategori tersebut sudah terdaftar!')
        return
      }
      onAddCategory(trimmed)
      setNewCatModalInput('')
    }
  }

  const handleModalDeleteCategory = (cat: string) => {
    onDeleteCategory(cat)
    if (selectedCategory === cat) {
      setSelectedCategory('Semua')
    }
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Low Stock Warning */}
      {lowStockCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Ada <b>{lowStockCount} produk</b> dengan stok menipis (≤ 5).
            </span>
          </div>
        </div>
      )}

      {/* Action Header & Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 m-0">Katalog Produk</h2>
            <p className="text-xs text-slate-500 m-0">
              Total {products.length} menu terdaftar
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama produk atau kode barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 shrink-0 transition-all active:scale-95"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kelola Kategori</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
            <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-400">
              Coba ganti kata kunci pencarian atau tambah menu baru.
            </p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isOutOfStock = p.stock <= 0
            const isLowStock = p.stock > 0 && p.stock <= 5

            return (
              <div
                key={p.id}
                className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-800 truncate m-0">
                        {p.name}
                      </h4>
                      {isOutOfStock ? (
                        <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-bold">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-bold">
                          Sisa {p.stock}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] mt-0.5">
                      <span className="font-bold text-emerald-600">
                        {formatRupiah(p.price)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">Stok: {p.stock} {p.unit || 'pcs'}</span>
                    </div>

                    {p.barcode && (
                      <span className="text-[10px] font-mono text-slate-400">
                        #{p.barcode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 active:scale-95"
                    title="Edit Produk"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
                        onDeleteProduct(p.id)
                      }
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 active:scale-95"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Menu / Produk *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Kopi Kenangan Mantan"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="15000"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Harga Modal / Beli (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="7000"
                    value={formData.costPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    placeholder="cup / porsi / pcs"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Kategori</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCat(!showAddCat)}
                    className="text-[10px] text-emerald-600 font-bold hover:underline"
                  >
                    + Kategori Baru
                  </button>
                </div>

                {showAddCat ? (
                  <div className="flex gap-1 mb-2">
                    <input
                      type="text"
                      placeholder="Nama kategori baru..."
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-xl font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}

                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  {categories
                    .filter((c) => c !== 'Semua')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Barcode / SKU (Bisa discan kamera HP)
                </label>
                <input
                  type="text"
                  placeholder="Cth: 8991001"
                  value={formData.barcode || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  URL Foto Produk (opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 m-0">Kelola Kategori Menu</h3>
                  <p className="text-[11px] text-slate-500 m-0">Tambah atau hapus kategori produk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Form Tambah Kategori */}
              <form onSubmit={handleModalCreateCategory} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Tambah Kategori Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Cth: Minuman Dingin, Snack..."
                    value={newCatModalInput}
                    onChange={(e) => setNewCatModalInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                  <button
                    type="submit"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </form>

              {/* Daftar Kategori */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Daftar Kategori ({categories.length})</span>
                  <span className="text-[10px] text-slate-400">Total Produk</span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const count =
                      cat === 'Semua'
                        ? products.length
                        : products.filter((p) => p.category === cat).length
                    const isSystem = cat === 'Semua'

                    return (
                      <div
                        key={cat}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {cat}
                          </span>
                          {isSystem && (
                            <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                              Sistem
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            {count} produk
                          </span>
                          {!isSystem && (
                            <button
                              type="button"
                              onClick={() => handleModalDeleteCategory(cat)}
                              title={`Hapus kategori ${cat}`}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center active:scale-90 transition-all border border-red-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl active:scale-95"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
