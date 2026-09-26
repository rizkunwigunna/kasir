import React, { useState, useRef } from 'react'
import type { StoreProfile, Product, Transaction } from '../types'
import {
  initialStoreProfile,
  initialCategories,
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
} from 'lucide-react'

interface SettingsViewProps {
  store: StoreProfile
  onSaveStore: (profile: StoreProfile) => void
  products: Product[]
  transactions: Transaction[]
  categories: string[]
  onRestoreData: (data: {
    products: Product[]
    transactions: Transaction[]
    store: StoreProfile
    categories: string[]
  }) => void
  onResetToDemo: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  store,
  onSaveStore,
  products,
  transactions,
  categories,
  onRestoreData,
  onResetToDemo,
}) => {
  const [formData, setFormData] = useState<StoreProfile>({ ...store })
  const [isSaved, setIsSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveStore(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
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

  return (
    <div className="space-y-4 pb-24 text-xs">
      {/* Store Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 m-0">Profil Toko & Struk</h3>
          </div>
          {isSaved && (
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
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
          <span>Simpan Pengaturan Toko</span>
        </button>
      </form>

      {/* Backup & Restore Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-800 m-0">Cadangkan & Pulihkan Data</h3>
        <p className="text-slate-500 m-0">
          Data tersimpan aman di browser HP Anda. Simpan salinan file untuk berjaga-jaga.
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

      {/* Vercel & PWA Guide for Mobile */}
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
    </div>
  )
}
