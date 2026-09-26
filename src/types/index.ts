export interface Product {
  id: string
  name: string
  price: number
  costPrice?: number // harga modal
  category: string
  stock: number
  barcode?: string
  image?: string
  unit?: string // pcs, porsi, cup, botol
}

export interface CartItem {
  product: Product
  quantity: number
  note?: string
}

export type PaymentMethod = 'tunai' | 'qris' | 'transfer' | 'debit'

export interface Transaction {
  id: string
  invoiceNumber: string
  date: string // ISO string
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    subtotal: number
    note?: string
  }[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  cashAmount?: number
  changeAmount?: number
  customerName?: string
  orderType: 'dine-in' | 'take-away' | 'delivery'
  status: 'completed' | 'cancelled'
}

export interface StoreProfile {
  name: string
  tagline: string
  address: string
  phone: string
  receiptFooter: string
  taxPercent: number // e.g. 10 or 0
  currency: string // default 'Rp'
}

export type ActiveTab = 'pos' | 'history' | 'inventory' | 'reports' | 'settings'
