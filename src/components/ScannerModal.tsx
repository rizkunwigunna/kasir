import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, Camera, Keyboard, AlertCircle } from 'lucide-react'

interface ScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (barcode: string) => void
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [manualCode, setManualCode] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = 'qr-reader-viewport'

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setErrorMsg(null)
    setIsScanning(false)

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerContainerId)
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success callback
            if (navigator.vibrate) {
              navigator.vibrate(100)
            }
            onScanSuccess(decodedText)
            handleClose()
          },
          () => {
            // QR code not detected frame - ignored
          }
        )

        if (isMounted) {
          setIsScanning(true)
        }
      } catch (err: unknown) {
        console.warn('Failed to start camera scanner:', err)
        if (isMounted) {
          setErrorMsg(
            'Kamera tidak dapat diakses atau izin ditolak. Anda dapat memasukkan kode barcode/SKU secara manual di bawah.'
          )
        }
      }
    }

    const timer = setTimeout(() => {
      startScanner()
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(timer)
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear()
          })
          .catch((e) => {
            console.warn('Scanner stop error', e)
          })
      }
    }
  }, [isOpen])

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear()
          onClose()
        })
        .catch(() => {
          onClose()
        })
    } else {
      onClose()
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim())
      setManualCode('')
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">Scan Barcode HP</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport for camera */}
        <div className="relative p-4 flex flex-col items-center justify-center">
          <div
            id={scannerContainerId}
            className="w-full aspect-square max-w-[280px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-emerald-500/50 relative shadow-inner"
          >
            {!isScanning && !errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Membuka kamera HP...</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-center mt-3">
            Arahkan kamera ke barcode atau QR produk untuk langsung memasukkan ke keranjang.
          </p>
        </div>

        {/* Manual Input Fallback */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Atau ketik Barcode / SKU..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              Cari
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
