import React, { useState, useRef } from 'react'
import type { StoreProfile, Product, Transaction, BankAccount, User, UserRole } from '../types'
import {
  initialStoreProfile,
  initialCategories,
  initialUsers,
} from '../data/initialData'
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Globe,
  Store,
  CheckCircle,
  Building2,
  QrCode,
  Plus,
  Trash2,
  Edit2,
  Tag,
  ImageIcon,
  X,
  CreditCard,
  Users,
  ShieldCheck,
  UserCheck,
  KeyRound,
} from 'lucide-react'

interface SettingsViewProps {
  store: StoreProfile
  onSaveStore: (profile: StoreProfile) => void
  products: Product[]
  transactions: Transaction[]
  categories: string[]
  users: User[]
  currentUser: User | null
  onSaveUsers: (users: User[]) => void
  onAddCategory?: (category: string) => void
  onDeleteCategory?: (category: string) => void
  onRestoreData: (data: {
    products: Product[]
    transactions: Transaction[]
    store: StoreProfile
    categories: string[]
    users?: User[]
  }) => void
  onResetToDemo: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  store,
  onSaveStore,
  products,
  transactions,
  categories,
  users,
  currentUser,
  onSaveUsers,
  onAddCategory,
  onDeleteCategory,
  onRestoreData,
  onResetToDemo,
}) => {
  const [formData, setFormData] = useState<StoreProfile>({ ...store })
  const [isSaved, setIsSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrisFileInputRef = useRef<HTMLInputElement>(null)

  // Bank Account Modal & Form State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null)
  const [bankForm, setBankForm] = useState({
    bankName: 'BCA',
    accountNumber: '',
    accountHolder: '',
  })

  // Category input State
  const [newCatInput, setNewCatInput] = useState('')

  // User Account Modal & Form State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState<{
    name: string
    username: string
    pin: string
    role: UserRole
  }>({
    name: '',
    username: '',
    pin: '',
    role: 'kasir',
  })

  // Submit Store Profile
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveStore(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  // Bank Account Handlers
  const handleOpenAddBank = () => {
    setEditingBank(null)
    setBankForm({
      bankName: 'BCA',
      accountNumber: '',
      accountHolder: formData.name || 'KASIR',
    })
    setIsBankModalOpen(true)
  }

  const handleOpenEditBank = (bank: BankAccount) => {
    setEditingBank(bank)
    setBankForm({
      bankName: bank.bankName,
      accountNumber: bank.accountNumber,
      accountHolder: bank.accountHolder,
    })
    setIsBankModalOpen(true)
  }

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bankForm.bankName.trim() || !bankForm.accountNumber.trim()) {
      alert('Nama Bank dan Nomor Rekening wajib diisi!')
      return
    }

    const currentBanks = formData.bankAccounts || []
    let updatedBanks: BankAccount[]

    if (editingBank) {
      updatedBanks = currentBanks.map((b) =>
        b.id === editingBank.id
          ? {
              ...b,
              bankName: bankForm.bankName.trim(),
              accountNumber: bankForm.accountNumber.trim(),
              accountHolder: bankForm.accountHolder.trim() || formData.name,
            }
          : b
      )
    } else {
      const newBank: BankAccount = {
        id: `bank-${Date.now()}`,
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        accountHolder: bankForm.accountHolder.trim() || formData.name,
      }
      updatedBanks = [...currentBanks, newBank]
    }

    const updatedProfile = { ...formData, bankAccounts: updatedBanks }
    setFormData(updatedProfile)
    onSaveStore(updatedProfile)
    setIsBankModalOpen(false)
    setEditingBank(null)
  }

  const handleDeleteBank = (id: string, bankName: string, accNum: string) => {
    if (confirm(`Yakin ingin menghapus nomor rekening ${bankName} (${accNum})?`)) {
      const updatedBanks = (formData.bankAccounts || []).filter((b) => b.id !== id)
      const updatedProfile = { ...formData, bankAccounts: updatedBanks }
      setFormData(updatedProfile)
      onSaveStore(updatedProfile)
    }
  }

  // QRIS Handlers
  const handleQrisImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar! Maksimal 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      const updatedQris = {
        merchantName: formData.qris?.merchantName || formData.name,
        nmid: formData.qris?.nmid || '',
        qrImageUrl: base64,
      }
      const updatedProfile = { ...formData, qris: updatedQris }
      setFormData(updatedProfile)
      onSaveStore(updatedProfile)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteQrisImage = () => {
    if (confirm('Hapus foto QRIS ini? Kasir akan kembali menampilkan QRIS standar tanpa gambar.')) {
      const updatedQris = {
        merchantName: formData.qris?.merchantName || formData.name,
        nmid: formData.qris?.nmid || '',
        qrImageUrl: '',
      }
      const updatedProfile = { ...formData, qris: updatedQris }
      setFormData(updatedProfile)
      onSaveStore(updatedProfile)
      if (qrisFileInputRef.current) qrisFileInputRef.current.value = ''
    }
  }

  const handleUpdateQrisField = (field: 'merchantName' | 'nmid', value: string) => {
    const updatedQris = {
      merchantName: field === 'merchantName' ? value : formData.qris?.merchantName || formData.name,
      nmid: field === 'nmid' ? value : formData.qris?.nmid || '',
      qrImageUrl: formData.qris?.qrImageUrl || '',
    }
    const updatedProfile = { ...formData, qris: updatedQris }
    setFormData(updatedProfile)
  }

  // Category Handler in Settings
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newCatInput.trim()
    if (!trimmed) return
    if (categories.includes(trimmed)) {
      alert('Kategori tersebut sudah terdaftar!')
      return
    }
    onAddCategory?.(trimmed)
    setNewCatInput('')
  }

  // User Accounts Handlers
  const handleOpenAddUser = () => {
    setEditingUser(null)
    setUserForm({
      name: '',
      username: '',
      pin: '',
      role: 'kasir',
    })
    setIsUserModalOpen(true)
  }

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u)
    setUserForm({
      name: u.name,
      username: u.username,
      pin: u.pin,
      role: u.role,
    })
    setIsUserModalOpen(true)
  }

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanUsername = userForm.username.trim().toLowerCase().replace(/\s+/g, '')
    const cleanName = userForm.name.trim()
    const cleanPin = userForm.pin.trim()

    if (!cleanUsername || !cleanName || !cleanPin) {
      alert('Nama, Username, dan PIN wajib diisi!')
      return
    }

    if (cleanPin.length < 4) {
      alert('PIN minimal 4 karakter/angka untuk keamanan!')
      return
    }

    // Check duplicate username
    const duplicate = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername &&
        (!editingUser || u.id !== editingUser.id)
    )
    if (duplicate) {
      alert(`Username "${cleanUsername}" sudah digunakan oleh akun lain!`)
      return
    }

    let updatedUsers: User[]
    if (editingUser) {
      updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: cleanName,
              username: cleanUsername,
              pin: cleanPin,
              role: userForm.role,
            }
          : u
      )
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: cleanName,
        username: cleanUsername,
        pin: cleanPin,
        role: userForm.role,
        createdAt: new Date().toISOString(),
      }
      updatedUsers = [...users, newUser]
    }

    onSaveUsers(updatedUsers)
    setIsUserModalOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (u: User) => {
    if (currentUser && currentUser.id === u.id) {
      alert('Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!')
      return
    }

    const adminCount = users.filter((usr) => usr.role === 'admin').length
    if (u.role === 'admin' && adminCount <= 1) {
      alert('Tidak dapat menghapus! Sistem harus memiliki minimal satu akun Admin.')
      return
    }

    if (confirm(`Yakin ingin menghapus akun "${u.name}" (@${u.username})?`)) {
      const updated = users.filter((usr) => usr.id !== u.id)
      onSaveUsers(updated)
    }
  }

  // Backup Data as JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      store: formData,
      categories,
      products,
      transactions,
      users,
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute(
      'download',
      `backup-kasir-${new Date().toISOString().slice(0, 10)}.json`
    )
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Restore Data from JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (parsed.products && parsed.store) {
          onRestoreData({
            products: parsed.products,
            transactions: parsed.transactions || [],
            store: parsed.store || initialStoreProfile,
            categories: parsed.categories || initialCategories,
            users: parsed.users || initialUsers,
          })
          setFormData(parsed.store)
          alert('Data kasir berhasil dipulihkan dari file backup!')
        } else {
          alert('Format file backup tidak valid!')
        }
      } catch (err) {
        alert('Gagal membaca file JSON backup!')
      }
    }
    reader.readAsText(file)
  }

  const popularBanks = [
    'BCA',
    'Mandiri',
    'BRI',
    'BNI',
    'BSI',
    'CIMB Niaga',
    'SeaBank',
    'Bank Jago',
    'DANA',
    'GoPay',
  ]

  return (
    <div className="space-y-4 pb-24 text-xs">
      {/* 1. Kelola Pengguna & Kasir Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 m-0">Kelola Akun & Kasir</h3>
              <p className="text-[11px] text-slate-500 m-0">
                Atur akun staf kasir (hanya akses kasir) dan akun owner/admin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun</span>
          </button>
        </div>

        {/* Real-time credential monitor info for Admin */}
        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
          <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <b>Pantauan Kredensial Kasir:</b> Kasir dapat mengganti nama, username, dan PIN mereka sendiri lewat tombol profil di navbar atas. Setiap kali kasir mengubah akunnya, username dan PIN baru <b>otomatis terupdate dan langsung terlihat oleh Anda di daftar ini</b>.
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2">
          {users.map((u) => {
            const isMe = currentUser?.id === u.id
            const isKasir = u.role === 'kasir'

            return (
              <div
                key={u.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    u.role === 'admin'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}>
                    {u.role === 'admin' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <UserCheck className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-800 text-xs">
                        {u.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                          Sedang Aktif
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isKasir
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isKasir ? 'Hanya Kasir' : 'Full Admin'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Username:</span>
                        <b className="text-slate-900 font-bold">{u.username}</b>
                      </div>
                      <div className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-amber-600" />
                        <span className="text-[10px] text-amber-700">PIN Aktif:</span>
                        <b className="text-amber-950 font-bold tracking-wider">{u.pin}</b>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditUser(u)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 active:scale-90 transition-all"
                    title="Ubah Akun"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u)}
                    disabled={isMe}
                    className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    title={isMe ? 'Tidak bisa menghapus akun yang sedang digunakan' : 'Hapus Akun'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Rekening Bank Transfer Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 m-0">Rekening Bank Transfer</h3>
              <p className="text-[11px] text-slate-500 m-0">
                Nomor rekening yang ditampilkan saat transaksi transfer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenAddBank}
            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Rekening</span>
          </button>
        </div>

        {/* Bank List */}
        <div className="space-y-2">
          {(!formData.bankAccounts || formData.bankAccounts.length === 0) ? (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-slate-500">
              <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-1 stroke-1" />
              <p className="font-semibold text-xs text-slate-700">Belum ada nomor rekening bank</p>
              <p className="text-[11px] text-slate-400">
                Klik tombol "+ Tambah Rekening" untuk menambahkan BCA, BRI, Mandiri, dll.
              </p>
            </div>
          ) : (
            formData.bankAccounts.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                      {b.bankName}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                      {b.accountNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 truncate">
                    Atas Nama: <b className="text-slate-800">{b.accountHolder}</b>
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditBank(b)}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 active:scale-90 transition-all"
                    title="Ubah Rekening"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBank(b.id, b.bankName, b.accountNumber)}
                    className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 active:scale-90 transition-all"
                    title="Hapus Rekening"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Pengaturan QRIS Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <QrCode className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 m-0">Pengaturan Pembayaran QRIS</h3>
            <p className="text-[11px] text-slate-500 m-0">
              Ganti atau hapus gambar dan identitas barcode QRIS toko Anda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          {/* QRIS Image Preview & Upload/Delete Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center text-center space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700">Tampilan QRIS Kasir</span>
            
            <div className="w-44 h-44 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden p-2 relative">
              {formData.qris?.qrImageUrl ? (
                <img
                  src={formData.qris.qrImageUrl}
                  alt="QRIS Toko"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                  <QrCode className="w-20 h-20 text-slate-300 stroke-1 mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold">
                    QRIS Standar Sistem
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center w-full">
              <button
                type="button"
                onClick={() => qrisFileInputRef.current?.click()}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] rounded-xl flex items-center gap-1 shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{formData.qris?.qrImageUrl ? 'Ganti Foto QRIS' : 'Unggah Foto QRIS'}</span>
              </button>

              {formData.qris?.qrImageUrl && (
                <button
                  type="button"
                  onClick={handleDeleteQrisImage}
                  className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] rounded-xl border border-red-200 flex items-center gap-1 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Foto QRIS</span>
                </button>
              )}

              <input
                type="file"
                ref={qrisFileInputRef}
                onChange={handleQrisImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <p className="text-[10px] text-slate-400">
              Mendukung foto/screenshot barcode QRIS format JPG/PNG (Maks 2MB)
            </p>
          </div>

          {/* QRIS Text Details Form */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nama Merchant / Usaha di QRIS
              </label>
              <input
                type="text"
                placeholder="Cth: KASIR NUSANTARA"
                value={formData.qris?.merchantName ?? formData.name}
                onChange={(e) => handleUpdateQrisField('merchantName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Nama yang akan tertera di bawah barcode QRIS
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                NMID QRIS (Opsional)
              </label>
              <input
                type="text"
                placeholder="Cth: ID1029384756"
                value={formData.qris?.nmid ?? ''}
                onChange={(e) => handleUpdateQrisField('nmid', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-slate-800"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Nomor identitas merchant nasional dari Bank Indonesia
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Data QRIS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Kelola Kategori Menu Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Tag className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 m-0">Kelola Kategori Menu</h3>
            <p className="text-[11px] text-slate-500 m-0">
              Tambah kategori baru atau hapus kategori yang sudah tidak diperlukan
            </p>
          </div>
        </div>

        {/* Form Tambah Kategori */}
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            placeholder="Ketik nama kategori baru..."
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-semibold"
          />
          <button
            type="submit"
            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 active:scale-95 shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>

        {/* List of Categories */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold px-1">
            <span>Kategori Terdaftar ({categories.length})</span>
            <span>Jumlah Menu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.map((cat) => {
              const count = cat === 'Semua'
                ? products.length
                : products.filter((p) => p.category === cat).length
              const isSystem = cat === 'Semua'

              return (
                <div
                  key={cat}
                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-bold text-slate-800 text-xs truncate">
                      {cat}
                    </span>
                    {isSystem && (
                      <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                        Sistem
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {count} produk
                    </span>
                    {!isSystem && onDeleteCategory && (
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(cat)}
                        title={`Hapus kategori "${cat}"`}
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

      {/* 5. Profil Toko & Struk Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 m-0">Profil Toko & Struk</h3>
              <p className="text-[11px] text-slate-500 m-0">Informasi nama toko dan kop struk fisik</p>
            </div>
          </div>
          {isSaved && (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" /> Tersimpan!
            </span>
          )}
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Nama Toko / Usaha *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Slogan / Tagline</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            placeholder="Cth: Kopi Nikmat Harga Sahabat"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              No. WhatsApp / Telepon
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              placeholder="081234567890"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Pajak PPN (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.taxPercent}
              onChange={(e) =>
                setFormData({ ...formData, taxPercent: Number(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              placeholder="0 (jika tanpa pajak)"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Alamat Toko</label>
          <textarea
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            placeholder="Jl. Raya No. 123..."
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Catatan Bawah Struk (Footer)
          </label>
          <textarea
            rows={2}
            value={formData.receiptFooter}
            onChange={(e) =>
              setFormData({ ...formData, receiptFooter: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            placeholder="Terima kasih atas kunjungan Anda!"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Semua Pengaturan Toko</span>
        </button>
      </form>

      {/* 6. Cadangkan & Pulihkan Data Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 m-0">Cadangkan & Pulihkan Data</h3>
        <p className="text-slate-500 m-0">
          Data tersimpan aman di browser HP Anda. Simpan salinan file untuk berpindah perangkat atau berjaga-jaga.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 font-bold text-slate-700 flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Backup</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:scale-95 font-bold text-slate-700 flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Pulihkan JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                'Kembalikan data ke contoh awal demo? Transaksi & produk buatan Anda akan direset.'
              )
            ) {
              onResetToDemo()
              setFormData(initialStoreProfile)
            }
          }}
          className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 font-semibold flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Data Demo Awal</span>
        </button>
      </div>

      {/* 7. Vercel & PWA Guide for Mobile */}
      <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold m-0">Panduan Akses HP via Vercel</h3>
        </div>

        <div className="space-y-2 text-[11px] leading-relaxed text-emerald-200">
          <p>
            <b>1. Deploy ke Vercel:</b> Push proyek ini ke GitHub, lalu import di{' '}
            <span className="text-white underline">vercel.com</span>, atau jalankan perintah{' '}
            <code className="bg-emerald-900 px-1 py-0.5 rounded text-white font-mono">
              npx vercel
            </code>{' '}
            di terminal.
          </p>
          <p>
            <b>2. Pasang di Layar Utama HP (PWA App):</b>
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <b>Android (Chrome):</b> Buka link Vercel Anda, ketuk titik 3 di kanan atas &rarr;
              pilih <b>"Tambahkan ke Layar Utama" (Add to Home screen)</b> atau "Install Aplikasi".
            </li>
            <li>
              <b>iPhone (Safari):</b> Buka link Vercel Anda di Safari, ketuk tombol <b>Share</b>{' '}
              (kotak panah ke atas) &rarr; pilih <b>"Add to Home Screen"</b>.
            </li>
          </ul>
          <div className="p-2 bg-emerald-900/60 rounded-xl border border-emerald-800 text-[10px] flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Aplikasi akan berjalan fullscreen tanpa bilah browser layaknya aplikasi kasir native di HP!
            </span>
          </div>
        </div>
      </div>

      {/* User Add/Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 m-0">
                    {editingUser ? 'Ubah Akun Pengguna' : 'Tambah Akun Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500 m-0">
                    Atur nama, username, PIN, dan hak akses
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Budi Santoso / Kasir Sore"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Username Login *</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: kasir1 / budi"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold text-slate-900 lowercase"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Huruf kecil tanpa spasi
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">PIN / Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: 123456"
                  value={userForm.pin}
                  onChange={(e) => setUserForm({ ...userForm, pin: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold text-slate-900 tracking-wider"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Minimal 4 karakter/angka
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Hak Akses (Role) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, role: 'kasir' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      userForm.role === 'kasir'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-sky-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserCheck className="w-4 h-4 text-sky-600" />
                      <span>Hanya Kasir</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      Hanya bisa transaksi kasir (POS). Menu lain disembunyikan.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserForm({ ...userForm, role: 'admin' })}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      userForm.role === 'admin'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Admin / Owner</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      Akses penuh: produk, omset, laporan, dan pengaturan.
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Account Add/Edit Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 m-0">
                    {editingBank ? 'Ubah Rekening Bank' : 'Tambah Rekening Bank'}
                  </h3>
                  <p className="text-[11px] text-slate-500 m-0">
                    Untuk pembayaran transfer pelanggan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="p-4 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Bank / E-Wallet *</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: BCA, BRI, Mandiri..."
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold uppercase text-slate-800"
                />
                
                {/* Popular Bank Shortcuts */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {popularBanks.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankForm({ ...bankForm, bankName: b })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                        bankForm.bankName.toUpperCase() === b.toUpperCase()
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Rekening *</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: 1234567890"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Atas Nama Pemilik</label>
                <input
                  type="text"
                  placeholder="Cth: MOHAMAD RIZKUN WIGUNA"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 uppercase text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
