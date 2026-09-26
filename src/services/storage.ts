import type { Product, StoreProfile, Transaction, User } from '../types'
import {
  initialProducts,
  initialStoreProfile,
  initialCategories,
  initialUsers,
} from '../data/initialData'

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_v1',
  TRANSACTIONS: 'pos_transactions_v1',
  STORE_PROFILE: 'pos_store_profile_v1',
  CATEGORIES: 'pos_categories_v1',
  USERS: 'pos_users_v1',
  CURRENT_USER: 'pos_current_user_v1',
}

export const getStoredProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    if (!data) {
      saveProducts(initialProducts)
      return initialProducts
    }
    return JSON.parse(data)
  } catch (err) {
    console.error('Failed reading products from localStorage', err)
    return initialProducts
  }
}

export const saveProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  } catch (err) {
    console.error('Failed saving products to localStorage', err)
  }
}

export const getStoredTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('Failed reading transactions from localStorage', err)
    return []
  }
}

export const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  } catch (err) {
    console.error('Failed saving transactions to localStorage', err)
  }
}

export const getStoredStoreProfile = (): StoreProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE)
    if (!data) return initialStoreProfile
    const parsed = JSON.parse(data)
    return {
      ...initialStoreProfile,
      ...parsed,
      bankAccounts: parsed.bankAccounts ?? initialStoreProfile.bankAccounts,
      qris: {
        ...initialStoreProfile.qris,
        ...(parsed.qris || {}),
      },
    }
  } catch (err) {
    console.error('Failed reading store profile', err)
    return initialStoreProfile
  }
}

export const saveStoreProfile = (profile: StoreProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(profile))
  } catch (err) {
    console.error('Failed saving store profile', err)
  }
}

export const getStoredCategories = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : initialCategories
  } catch (err) {
    console.error('Failed reading categories', err)
    return initialCategories
  }
}

export const saveCategories = (categories: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  } catch (err) {
    console.error('Failed saving categories', err)
  }
}

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!data) {
      saveUsers(initialUsers)
      return initialUsers
    }
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialUsers
  } catch (err) {
    console.error('Failed reading users from localStorage', err)
    return initialUsers
  }
}

export const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  } catch (err) {
    console.error('Failed saving users to localStorage', err)
  }
}

export const getStoredCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error('Failed reading current user', err)
    return null
  }
}

export const saveCurrentUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  } catch (err) {
    console.error('Failed saving current user', err)
  }
}

export const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number)
}

export const generateInvoiceNumber = (): string => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const date = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `INV-${year}${month}${date}-${random}`
}

export const formatDateIndo = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export const generateWhatsAppReceiptText = (
  transaction: Transaction,
  store: StoreProfile
): string => {
  const dateFormatted = formatDateIndo(transaction.date)
  let text = `*${store.name.toUpperCase()}*\n`
  text += `${store.address}\n`
  if (store.phone) text += `Telp/WA: ${store.phone}\n`
  text += `--------------------------------\n`
  text += `No. Faktur : ${transaction.invoiceNumber}\n`
  text += `Tanggal    : ${dateFormatted}\n`
  if (transaction.customerName) {
    text += `Pelanggan  : ${transaction.customerName}\n`
  }
  text += `Tipe Order : ${transaction.orderType === 'dine-in' ? 'Makan di Tempat' : transaction.orderType === 'take-away' ? 'Bungkus / Take Away' : 'Pesan Antar'}\n`
  text += `--------------------------------\n`

  transaction.items.forEach((item) => {
    text += `${item.name}\n`
    text += `  ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.subtotal)}\n`
    if (item.note) text += `  (Catatan: ${item.note})\n`
  })

  text += `--------------------------------\n`
  text += `Subtotal    : ${formatRupiah(transaction.subtotal)}\n`
  if (transaction.discount > 0) {
    text += `Diskon      : -${formatRupiah(transaction.discount)}\n`
  }
  if (transaction.tax > 0) {
    text += `Pajak       : ${formatRupiah(transaction.tax)}\n`
  }
  text += `*TOTAL       : ${formatRupiah(transaction.total)}*\n`
  text += `Metode Bayar: ${transaction.paymentMethod.toUpperCase()}\n`
  if (transaction.paymentMethod === 'tunai' && transaction.cashAmount) {
    text += `Bayar Tunai : ${formatRupiah(transaction.cashAmount)}\n`
    text += `Kembalian   : ${formatRupiah(transaction.changeAmount || 0)}\n`
  }
  text += `--------------------------------\n`
  text += `${store.receiptFooter}\n`
  text += `\n_Struk digital ini dibuat otomatis oleh Aplikasi Kasir._`

  return encodeURIComponent(text)
}
