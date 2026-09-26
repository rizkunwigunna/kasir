import { useState, useEffect, useMemo } from 'react'
import type {
  Product,
  CartItem,
  Transaction,
  StoreProfile,
  ActiveTab,
  PaymentMethod,
} from './types'
import {
  getStoredProducts,
  saveProducts,
  getStoredTransactions,
  saveTransactions,
  getStoredStoreProfile,
  saveStoreProfile,
  getStoredCategories,
  saveCategories,
  formatRupiah,
  generateInvoiceNumber,
} from './services/storage'
import {
  initialProducts,
  initialStoreProfile,
  initialCategories,
} from './data/initialData'

import { Navbar } from './components/Navbar'
import { BottomNav } from './components/BottomNav'
import { ProductCard } from './components/ProductCard'
import { CartDrawer } from './components/CartDrawer'
import { PaymentModal } from './components/PaymentModal'
import { ReceiptModal } from './components/ReceiptModal'
import { ScannerModal } from './components/ScannerModal'
import { HistoryView } from './components/HistoryView'
import { ProductManager } from './components/ProductManager'
import { AnalyticsView } from './components/AnalyticsView'
import { SettingsView } from './components/SettingsView'

import { Search, ShoppingBag, ArrowRight } from 'lucide-react'

export function App() {
  // Global App States
  const [products, setProducts] = useState<Product[]>(getStoredProducts)
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions)
  const [store, setStore] = useState<StoreProfile>(getStoredStoreProfile)
  const [categories, setCategories] = useState<string[]>(getStoredCategories)
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos')

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [orderType, setOrderType] = useState<'dine-in' | 'take-away' | 'delivery'>('dine-in')
  const [discount, setDiscount] = useState(0)

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)

  // Search & Filter for POS
  const [posSearch, setPosSearch] = useState('')
  const [posCategory, setPosCategory] = useState('Semua')

  // Sync to localStorage
  useEffect(() => {
    saveProducts(products)
  }, [products])

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  useEffect(() => {
    saveStoreProfile(store)
  }, [store])

  useEffect(() => {
    saveCategories(categories)
  }, [categories])

  // Total cart calculation
  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [cart])

  const taxableAmount = Math.max(0, subtotal - discount)
  const tax = Math.round((taxableAmount * (store.taxPercent || 0)) / 100)
  const grandTotal = Math.max(0, taxableAmount + tax)

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            if (newQty > item.product.stock) return item
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }

  const handleUpdateProductQuantity = (product: Product, delta: number) => {
    handleUpdateQuantity(product.id, delta)
  }

  const handleUpdateNote = (productId: string, note: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, note } : item
      )
    )
  }

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const handleClearCart = () => {
    setCart([])
    setCustomerName('')
    setDiscount(0)
  }

  // Barcode scan handler
  const handleScanSuccess = (barcode: string) => {
    const clean = barcode.trim()
    const found = products.find(
      (p) =>
        p.barcode?.toLowerCase() === clean.toLowerCase() ||
        p.id.toLowerCase() === clean.toLowerCase()
    )

    if (found) {
      if (found.stock <= 0) {
        alert(`Produk "${found.name}" stoknya habis!`)
      } else {
        handleAddToCart(found)
      }
    } else {
      alert(`Produk dengan barcode/SKU "${barcode}" tidak ditemukan di sistem.`)
    }
  }

  // Complete Payment & Save Transaction
  const handleCompletePayment = (
    method: PaymentMethod,
    cashAmount?: number,
    changeAmount?: number
  ) => {
    const invoiceNumber = generateInvoiceNumber()
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
        note: item.note,
      })),
      subtotal,
      discount,
      tax,
      total: grandTotal,
      paymentMethod: method,
      cashAmount,
      changeAmount,
      customerName: customerName.trim() || undefined,
      orderType,
      status: 'completed',
    }

    // Reduce inventory stocks
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((ci) => ci.product.id === p.id)
        if (cartItem) {
          return {
            ...p,
            stock: Math.max(0, p.stock - cartItem.quantity),
          }
        }
        return p
      })
    )

    // Save transaction
    setTransactions((prev) => [newTx, ...prev])
    setCurrentTransaction(newTx)

    // Close drawers and open receipt
    setIsPaymentOpen(false)
    setIsCartOpen(false)
    setIsReceiptOpen(true)
  }

  // Cancel / Void Transaction (Refund stock)
  const handleCancelTransaction = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId)
    if (!tx || tx.status === 'cancelled') return

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = tx.items.find((i) => i.productId === p.id)
        if (item) {
          return {
            ...p,
            stock: p.stock + item.quantity,
          }
        }
        return p
      })
    )

    // Mark cancelled
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'cancelled' } : t))
    )
  }

  // Product CRUD
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = product
        return updated
      }
      return [product, ...prev]
    })
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const handleAddCategory = (cat: string) => {
    const trimmed = cat.trim()
    if (!trimmed) return
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed])
    }
  }

  const handleDeleteCategory = (catToDelete: string) => {
    if (catToDelete === 'Semua') {
      alert('Kategori "Semua" adalah kategori sistem dan tidak dapat dihapus.')
      return
    }

    const affectedProducts = products.filter((p) => p.category === catToDelete)
    const message =
      affectedProducts.length > 0
        ? `Kategori "${catToDelete}" digunakan oleh ${affectedProducts.length} produk.\nJika dihapus, kategori produk tersebut akan dialihkan ke "Lainnya".\n\nLanjutkan menghapus kategori ini?`
        : `Yakin ingin menghapus kategori "${catToDelete}"?`

    if (!confirm(message)) return

    setCategories((prev) => {
      const filtered = prev.filter((c) => c !== catToDelete)
      if (affectedProducts.length > 0 && !filtered.includes('Lainnya')) {
        return [...filtered, 'Lainnya']
      }
      return filtered
    })

    if (affectedProducts.length > 0) {
      setProducts((prev) =>
        prev.map((p) =>
          p.category === catToDelete ? { ...p, category: 'Lainnya' } : p
        )
      )
    }

    if (posCategory === catToDelete) {
      setPosCategory('Semua')
    }
  }

  // Backup & Reset handlers
  const handleRestoreData = (data: {
    products: Product[]
    transactions: Transaction[]
    store: StoreProfile
    categories: string[]
  }) => {
    setProducts(data.products)
    setTransactions(data.transactions)
    setStore(data.store)
    setCategories(data.categories)
    setCart([])
  }

  const handleResetToDemo = () => {
    setProducts(initialProducts)
    setTransactions([])
    setStore(initialStoreProfile)
    setCategories(initialCategories)
    setCart([])
    saveProducts(initialProducts)
    saveTransactions([])
    saveStoreProfile(initialStoreProfile)
    saveCategories(initialCategories)
  }

  // POS filtered products
  const posFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(posSearch.toLowerCase()))
      const matchesCat =
        posCategory === 'Semua' || p.category === posCategory
      return matchesSearch && matchesCat
    })
  }, [products, posSearch, posCategory])

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        store={store}
        activeTab={activeTab}
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4">
        {activeTab === 'pos' && (
          <div className="space-y-3 pb-28">
            {/* Search & Categories Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari menu, kopi, makanan, atau barcode..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPosCategory(cat)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      posCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid (2 columns on mobile, 3-4 on tablet/desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {posFilteredProducts.map((product) => {
                const cartItem = cart.find(
                  (item) => item.product.id === product.id
                )
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartQuantity={cartItem?.quantity || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateProductQuantity}
                  />
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <HistoryView
            transactions={transactions}
            store={store}
            products={products}
            onViewReceipt={(tx) => {
              setCurrentTransaction(tx)
              setIsReceiptOpen(true)
            }}
            onCancelTransaction={handleCancelTransaction}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductManager
            products={products}
            categories={categories}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === 'reports' && (
          <AnalyticsView transactions={transactions} products={products} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            store={store}
            onSaveStore={setStore}
            products={products}
            transactions={transactions}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onRestoreData={handleRestoreData}
            onResetToDemo={handleResetToDemo}
          />
        )}
      </main>

      {/* Floating Bottom Checkout Bar for Mobile (Only in POS tab when cart has items) */}
      {activeTab === 'pos' && cart.length > 0 && (
        <div className="fixed bottom-18 left-3 right-3 z-30 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white p-3 rounded-2xl shadow-xl shadow-emerald-700/30 flex items-center justify-between transition-all border border-emerald-500/40"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 flex items-center justify-center font-bold text-xs">
                {totalCartCount}
              </div>
              <div className="text-left leading-tight">
                <span className="text-[10px] uppercase font-bold text-emerald-200">
                  Keranjang ({totalCartCount} item)
                </span>
                <div className="text-sm font-black">{formatRupiah(grandTotal)}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-white text-emerald-900 px-3 py-1.5 rounded-xl shadow-sm">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Lihat & Bayar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Bottom Ergonomic Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        cartCount={totalCartCount}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        customerName={customerName}
        setCustomerName={setCustomerName}
        orderType={orderType}
        setOrderType={setOrderType}
        discount={discount}
        setDiscount={setDiscount}
        taxPercent={store.taxPercent || 0}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateNote={handleUpdateNote}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToPayment={() => setIsPaymentOpen(true)}
      />

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={grandTotal}
        store={store}
        onComplete={handleCompletePayment}
      />

      {/* Receipt Modal (Thermal Print & WhatsApp Share) */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={currentTransaction}
        store={store}
        onNewTransaction={() => {
          handleClearCart()
          setIsReceiptOpen(false)
        }}
      />

      {/* Barcode Camera Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  )
}

export default App
