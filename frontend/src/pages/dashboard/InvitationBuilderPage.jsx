import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Eye, Share2, Palette, Settings,
  Plus, X, Trash2, Heart, Phone,
  MessageSquare, QrCode,
  Copy, Check, ChevronRight, ChevronLeft,
  Type, Bold, Italic, AlignCenter, AlignLeft, AlignRight,
  Upload, ImagePlus, Layers,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Design data (shared with public page) ────────────────────────────────────
import { DESIGN_CATEGORIES, ALL_DESIGNS } from '@/data/invitationDesigns'

const FONTS = [
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Dancing Script',   label: 'Dancing Script'   },
  { value: 'Great Vibes',      label: 'Great Vibes'      },
  { value: 'Cormorant Garamond', label: 'Cormorant'      },
  { value: 'Cinzel',           label: 'Cinzel'           },
  { value: 'Lora',             label: 'Lora'             },
  { value: 'Inter',            label: 'Inter'            },
]

const LINER_OPTIONS = [
  { value: 'none',    label: 'Tiada',     bg: 'bg-white border border-gray-200' },
  { value: 'gold',    label: 'Gold Leaf', bg: 'bg-gradient-to-br from-yellow-100 to-amber-200' },
  { value: 'floral',  label: 'Floral',    bg: 'bg-gradient-to-br from-rose-100 to-pink-200' },
  { value: 'marble',  label: 'Marble',    bg: 'bg-gradient-to-br from-gray-100 to-slate-200' },
]

const DEFAULT_TEXT_BLOCKS = (wedding) => [
  { id: 'event_type', content: 'Walimatul Urus', font: 'Dancing Script', size: 18, color: '#8B6F47', x: 50, y: 10, align: 'center', bold: false, italic: false },
  { id: 'couple',     content: `${wedding?.bride_name || 'Nama Pengantin Perempuan'} & ${wedding?.groom_name || 'Nama Pengantin Lelaki'}`, font: 'Playfair Display', size: 22, color: '#3D2C1E', x: 50, y: 40, align: 'center', bold: false, italic: true },
  { id: 'date',       content: wedding?.tarikh_nikah ? new Date(wedding.tarikh_nikah).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Tarikh Majlis', font: 'Cormorant Garamond', size: 14, color: '#5C4033', x: 50, y: 62, align: 'center', bold: false, italic: false },
  { id: 'venue',      content: wedding?.venue_nikah || wedding?.venue_name || 'Lokasi Majlis', font: 'Lora', size: 13, color: '#5C4033', x: 50, y: 70, align: 'center', bold: false, italic: false },
  { id: 'message',    content: 'Kehadiran anda amat kami junjung', font: 'Lora', size: 11, color: '#7C6152', x: 50, y: 82, align: 'center', bold: false, italic: true },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJson(str, fallback) {
  if (!str) return fallback
  try { return JSON.parse(str) } catch { return fallback }
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { key: 'design',   label: 'Pilih Design',  icon: Palette },
  { key: 'envelope', label: 'Envelope',       icon: Mail    },
  { key: 'card',     label: 'Kad',            icon: Type    },
  { key: 'settings', label: 'Tetapan',        icon: Settings },
  { key: 'share',    label: 'Kongsi',         icon: Share2  },
]

function StepBar({ step, setStep, inv }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 shrink-0">
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const active = step === s.key
        const done = STEPS.findIndex(x => x.key === step) > i
        return (
          <button
            key={s.key}
            onClick={() => inv && setStep(s.key)}
            disabled={!inv}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all
              ${active ? 'bg-primary-600 text-white shadow-sm' : done ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <Icon size={13} />
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Step 1: Design Picker ────────────────────────────────────────────────────

function validateAspectRatio(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = img.width / img.height
      // Accept 9:16 portrait ± 5% tolerance (0.5625 ± ~0.028)
      resolve({ w: img.width, h: img.height, valid: ratio >= 0.505 && ratio <= 0.620 })
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ valid: false }) }
    img.src = url
  })
}

function CustomUploadTab({ inv, wid, onSave, onNext }) {
  const qc = useQueryClient()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const { data: pages = [], isLoading } = useQuery(
    ['custom-pages', wid],
    () => api.get(`/weddings/${wid}/invitation/custom-pages`).then(r => r.data),
    { enabled: !!wid },
  )

  const deleteMutation = useMutation(
    (pageId) => api.delete(`/weddings/${wid}/invitation/custom-pages/${pageId}`),
    { onSuccess: () => qc.invalidateQueries(['custom-pages', wid]) },
  )

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    let errors = []
    for (const file of files) {
      const { valid, w, h } = await validateAspectRatio(file)
      if (!valid) {
        errors.push(`${file.name}: nisbah mestilah 9:16 portrait (cth 1080×1920)`)
        continue
      }
      try {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/weddings/${wid}/invitation/custom-pages`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } catch {
        errors.push(`${file.name}: gagal upload`)
      }
    }
    await qc.invalidateQueries(['custom-pages', wid])
    if (errors.length) errors.forEach(e => toast.error(e, { duration: 4000 }))
    else if (files.length) toast.success(`${files.length} halaman berjaya dimuat naik!`)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function confirm() {
    if (!pages.length) { toast.error('Muat naik sekurang-kurangnya 1 halaman'); return }
    onSave({ use_custom_design: true, design_id: null })
    onNext()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Upload Design Sendiri</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Muat naik slaid design jemputan anda. Format: portrait 9:16 (disyorkan 1080 × 1920 px).
        </p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-primary-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            <p className="text-sm font-medium">Sedang muat naik...</p>
          </div>
        ) : (
          <>
            <ImagePlus size={32} className="mx-auto text-primary-300 mb-3" />
            <p className="font-medium text-gray-700 text-sm">Klik untuk pilih gambar</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG atau WebP · Boleh pilih banyak sekaligus · Max 20 halaman</p>
            <p className="text-xs text-primary-500 mt-1 font-medium">Nisbah 9:16 portrait wajib (1080 × 1920 px disyorkan)</p>
          </>
        )}
      </div>

      {/* Uploaded pages */}
      {isLoading ? (
        <div className="text-center text-gray-400 text-sm py-4">Memuatkan...</div>
      ) : pages.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Layers size={14} className="text-primary-500" />
              {pages.length} halaman dimuat naik
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {pages.map((page, i) => (
              <div key={page.id} className="relative group aspect-[9/16] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={page.image_url} alt={`Halaman ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => deleteMutation.mutate(page.id)}
                    className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm py-2">Belum ada halaman dimuat naik.</p>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={confirm} disabled={!pages.length || uploading} className="btn-primary flex items-center gap-2">
          Seterusnya <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function DesignPickerStep({ inv, wid, onSave, onNext }) {
  const [mode, setMode] = useState(inv?.use_custom_design ? 'custom' : 'preset')
  const [selected, setSelected] = useState(inv?.use_custom_design ? null : (inv?.design_id || null))

  const initialOpen = () => {
    if (!selected) return { floral: true }
    const cat = DESIGN_CATEGORIES.find(c => c.designs.some(d => d.id === selected))
    return cat ? { [cat.key]: true } : { floral: true }
  }
  const [open, setOpen] = useState(initialOpen)
  const toggle = (key) => setOpen(p => ({ ...p, [key]: !p[key] }))

  function confirm() { onSave({ design_id: selected, use_custom_design: false }); onNext() }

  const selectedDesign = ALL_DESIGNS.find(d => d.id === selected)

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setMode('preset')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${mode === 'preset' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <Palette size={15} /> Pilih Preset
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${mode === 'custom' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <ImagePlus size={15} /> Upload Sendiri
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'custom' ? (
          <motion.div key="custom" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
            <CustomUploadTab inv={inv} wid={wid} onSave={onSave} onNext={onNext} />
          </motion.div>
        ) : (
          <motion.div key="preset" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pilih Reka Bentuk</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Pilih satu design untuk kad jemputan anda.</p>
                </div>
                {selectedDesign && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full">
                    <Check size={13} className="text-primary-600" />
                    <span className="text-xs font-medium text-primary-700">{selectedDesign.label}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {DESIGN_CATEGORIES.map(cat => (
                  <div key={cat.key} className="border border-gray-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggle(cat.key)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="font-semibold text-gray-800 text-sm">{cat.label}</span>
                        <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                          {cat.designs.length} design
                        </span>
                        {cat.designs.some(d => d.id === selected) && (
                          <span className="text-xs text-primary-600 bg-primary-50 border border-primary-200 rounded-full px-2 py-0.5 font-medium">
                            ✓ Terpilih
                          </span>
                        )}
                      </div>
                      <motion.div animate={{ rotate: open[cat.key] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight size={16} className="text-gray-400 rotate-90" />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {open[cat.key] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
                            {cat.designs.map(d => (
                              <button
                                key={d.id}
                                onClick={() => setSelected(d.id)}
                                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-[3/4]
                                  ${selected === d.id
                                    ? 'border-primary-500 shadow-lg scale-[1.02]'
                                    : 'border-transparent hover:border-primary-300'}`}
                              >
                                <img src={d.src} alt={d.label} className="w-full h-full object-cover" />
                                {selected === d.id && (
                                  <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                                    <div className="bg-primary-600 rounded-full p-1">
                                      <Check size={16} className="text-white" />
                                    </div>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                  <p className="text-white text-xs font-medium">{d.label}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={confirm} disabled={!selected} className="btn-primary flex items-center gap-2">
                  Seterusnya <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Step 2: Envelope Customizer ──────────────────────────────────────────────

function EnvelopePreview({ config, flip }) {
  const bg = config.bgColor || '#F5F0E8'
  const textColor = config.textColor || '#3D2C1E'
  return (
    <div
      className="relative w-64 h-44 rounded-lg shadow-xl cursor-pointer select-none mx-auto"
      style={{ background: bg, perspective: '800px' }}
      onClick={flip}
    >
      {/* Envelope flap top */}
      <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden">
        <div className="w-full h-full" style={{
          background: `linear-gradient(135deg, ${bg} 50%, transparent 50%)`,
          borderTop: `1px solid ${textColor}22`,
        }} />
      </div>
      {/* Wax seal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ background: `radial-gradient(circle at 35% 35%, #e8c46a, #b8860b)` }}>
          <span style={{ fontFamily: 'Cinzel', fontSize: 20, color: '#fff', fontWeight: 600 }}>♡</span>
        </div>
      </div>
      {/* Liner bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-1/2 rounded-b-lg overflow-hidden`}>
        {config.liner !== 'none' && (
          <div className={`w-full h-full ${LINER_OPTIONS.find(l => l.value === config.liner)?.bg || ''}`} />
        )}
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs" style={{ color: textColor, fontFamily: 'Lora', opacity: 0.7 }}>
        Klik untuk buka
      </p>
    </div>
  )
}

function EnvelopeStep({ inv, onSave, onNext, onBack }) {
  const saved = parseJson(inv?.envelope_config, {})
  const [cfg, setCfg] = useState({
    bgColor: saved.bgColor || '#F5F0E8',
    textColor: saved.textColor || '#3D2C1E',
    frontTitle: saved.frontTitle || 'You Are Invited',
    frontSubtitle: saved.frontSubtitle || 'Walimatul Urus',
    liner: saved.liner || 'none',
  })
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }))

  function save() { onSave({ envelope_config: JSON.stringify(cfg) }); onNext() }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Envelope Opener</h2>
        <p className="text-sm text-gray-500 mt-0.5">Tetamu akan nampak envelope ni dulu sebelum kad dibuka.</p>
      </div>

      <EnvelopePreview config={cfg} flip={() => {}} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Warna Envelope</label>
          <div className="flex items-center gap-2">
            <input type="color" value={cfg.bgColor} onChange={e => set('bgColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <input className="input-field flex-1 text-sm" value={cfg.bgColor} onChange={e => set('bgColor', e.target.value)} placeholder="#F5F0E8" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Warna Teks</label>
          <div className="flex items-center gap-2">
            <input type="color" value={cfg.textColor} onChange={e => set('textColor', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <input className="input-field flex-1 text-sm" value={cfg.textColor} onChange={e => set('textColor', e.target.value)} placeholder="#3D2C1E" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tajuk Depan</label>
          <input className="input-field text-sm" value={cfg.frontTitle} onChange={e => set('frontTitle', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subjudul</label>
          <input className="input-field text-sm" value={cfg.frontSubtitle} onChange={e => set('frontSubtitle', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Envelope Liner</label>
        <div className="grid grid-cols-4 gap-2">
          {LINER_OPTIONS.map(l => (
            <button key={l.value} onClick={() => set('liner', l.value)}
              className={`h-12 rounded-xl ${l.bg} border-2 text-xs font-medium transition-all ${cfg.liner === l.value ? 'border-primary-500 scale-105' : 'border-transparent hover:border-gray-300'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex items-center gap-1"><ChevronLeft size={15} /> Balik</button>
        <button onClick={save} className="btn-primary flex-1 flex items-center justify-center gap-2">
          Seterusnya <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Card Text Editor ─────────────────────────────────────────────────

function TextBlock({ block, selected, onSelect, onUpdate, containerRef }) {
  const blockRef = useRef(null)
  const dragStart = useRef(null)
  const [editing, setEditing] = useState(false)

  function onMouseDown(e) {
    if (editing) return
    e.preventDefault()
    const rect = containerRef.current.getBoundingClientRect()
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      origX: block.x,
      origY: block.y,
      w: rect.width,
      h: rect.height,
    }
    onSelect(block.id)

    function onMove(ev) {
      const { mouseX, mouseY, origX, origY, w, h } = dragStart.current
      const dx = ((ev.clientX - mouseX) / w) * 100
      const dy = ((ev.clientY - mouseY) / h) * 100
      onUpdate(block.id, { x: Math.max(5, Math.min(95, origX + dx)), y: Math.max(2, Math.min(98, origY + dy)) })
    }
    function onUp() {
      dragStart.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const style = {
    position: 'absolute',
    left: `${block.x}%`,
    top: `${block.y}%`,
    transform: 'translate(-50%, -50%)',
    fontFamily: block.font,
    fontSize: `${block.size}px`,
    color: block.color,
    textAlign: block.align,
    fontWeight: block.bold ? '600' : '400',
    fontStyle: block.italic ? 'italic' : 'normal',
    cursor: editing ? 'text' : 'move',
    userSelect: editing ? 'text' : 'none',
    maxWidth: '90%',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.3,
    outline: selected ? '1.5px dashed rgba(99,102,241,0.7)' : 'none',
    padding: '2px 4px',
    borderRadius: '3px',
    background: selected ? 'rgba(255,255,255,0.15)' : 'transparent',
  }

  return (
    <div
      ref={blockRef}
      style={style}
      onMouseDown={onMouseDown}
      onDoubleClick={() => setEditing(true)}
    >
      {editing ? (
        <textarea
          autoFocus
          value={block.content}
          onChange={e => onUpdate(block.id, { content: e.target.value })}
          onBlur={() => setEditing(false)}
          style={{ fontFamily: block.font, fontSize: `${block.size}px`, color: block.color, background: 'transparent', border: 'none', outline: 'none', resize: 'none', padding: 0, textAlign: block.align, fontWeight: block.bold ? '600' : '400', fontStyle: block.italic ? 'italic' : 'normal', minWidth: 120 }}
          rows={2}
        />
      ) : (
        <span>{block.content}</span>
      )}
    </div>
  )
}

function BlockToolbar({ block, onUpdate, onDelete }) {
  if (!block) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={block.font}
          onChange={e => onUpdate(block.id, { font: e.target.value })}
          style={{ fontFamily: block.font }}
          className="input-field text-xs py-1.5 flex-1 min-w-[140px]"
        >
          {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
        </select>

        <input
          type="number" min={8} max={72}
          value={block.size}
          onChange={e => onUpdate(block.id, { size: parseInt(e.target.value) || 14 })}
          className="input-field text-xs py-1.5 w-16 text-center"
        />

        <div className="flex items-center gap-1">
          <input type="color" value={block.color} onChange={e => onUpdate(block.id, { color: e.target.value })}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer" />
        </div>

        <div className="flex items-center gap-0.5">
          {[
            [AlignLeft, 'left'], [AlignCenter, 'center'], [AlignRight, 'right']
          ].map(([Icon, val]) => (
            <button key={val} onClick={() => onUpdate(block.id, { align: val })}
              className={`p-1.5 rounded-lg ${block.align === val ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}>
              <Icon size={13} />
            </button>
          ))}
        </div>

        <button onClick={() => onUpdate(block.id, { bold: !block.bold })}
          className={`p-1.5 rounded-lg ${block.bold ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}>
          <Bold size={13} />
        </button>
        <button onClick={() => onUpdate(block.id, { italic: !block.italic })}
          className={`p-1.5 rounded-lg ${block.italic ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}>
          <Italic size={13} />
        </button>

        <button onClick={() => onDelete(block.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 ml-auto">
          <Trash2 size={13} />
        </button>
      </div>

      <p className="text-xs text-gray-400">Double-klik pada teks untuk edit kandungan. Drag untuk ubah kedudukan.</p>
    </div>
  )
}

function CardEditorStep({ inv, wid, wedding, onSave, onNext, onBack }) {
  const containerRef = useRef(null)
  const design = ALL_DESIGNS.find(d => d.id === inv?.design_id) || ALL_DESIGNS[0]
  const saved = parseJson(inv?.card_config, null)
  const [blocks, setBlocks] = useState(saved || DEFAULT_TEXT_BLOCKS(wedding))
  const [selectedId, setSelectedId] = useState(null)

  const { data: customPages = [] } = useQuery(
    ['custom-pages', wid],
    () => api.get(`/weddings/${wid}/invitation/custom-pages`).then(r => r.data),
    { enabled: !!wid && !!inv?.use_custom_design },
  )

  if (inv?.use_custom_design) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Preview Design</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Design anda sudah dimuat naik. Halaman akan dipaparkan kepada tetamu mengikut urutan di bawah.
          </p>
        </div>
        {customPages.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {customPages.map((page, i) => (
              <div key={page.id} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={page.image_url} alt={`Halaman ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">{i + 1}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm py-6">Tiada halaman. Kembali ke langkah 1 untuk upload.</p>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onBack} className="btn-secondary flex items-center gap-1"><ChevronLeft size={15} /> Balik</button>
          <button onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
            Seterusnya <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  const selectedBlock = blocks.find(b => b.id === selectedId)

  function updateBlock(id, patch) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, ...patch } : b))
  }
  function deleteBlock(id) {
    setBlocks(bs => bs.filter(b => b.id !== id))
    setSelectedId(null)
  }
  function addBlock() {
    const id = `block_${Date.now()}`
    setBlocks(bs => [...bs, { id, content: 'Teks baru', font: 'Lora', size: 14, color: '#3D2C1E', x: 50, y: 50, align: 'center', bold: false, italic: false }])
    setSelectedId(id)
  }

  function save() { onSave({ card_config: JSON.stringify(blocks) }); onNext() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Edit Kad Jemputan</h2>
          <p className="text-sm text-gray-500 mt-0.5">Drag teks untuk ubah kedudukan. Double-klik untuk edit.</p>
        </div>
        <button onClick={addBlock} className="btn-secondary flex items-center gap-1.5 text-sm">
          <Plus size={14} /> Tambah Teks
        </button>
      </div>

      {/* Card canvas */}
      <div
        ref={containerRef}
        className="relative mx-auto rounded-xl overflow-hidden shadow-xl select-none"
        style={{ maxWidth: 360, aspectRatio: '3/4' }}
        onClick={(e) => { if (e.target === containerRef.current || e.target.tagName === 'IMG') setSelectedId(null) }}
      >
        <img src={design.src} alt={design.label} className="w-full h-full object-cover" draggable={false} />
        {blocks.map(block => (
          <TextBlock
            key={block.id}
            block={block}
            selected={block.id === selectedId}
            onSelect={setSelectedId}
            onUpdate={updateBlock}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Toolbar for selected block */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <BlockToolbar block={selectedBlock} onUpdate={updateBlock} onDelete={deleteBlock} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex items-center gap-1"><ChevronLeft size={15} /> Balik</button>
        <button onClick={save} className="btn-primary flex-1 flex items-center justify-center gap-2">
          Simpan & Seterusnya <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Settings ─────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

function SettingsStep({ inv, wid, onSave, onToggle, onNext, onBack }) {
  const [rsvpPax, setRsvpPax] = useState(inv?.rsvp_max_pax ?? '')
  const [musicUrl, setMusicUrl] = useState(inv?.music_url ?? '')
  const [qrFile, setQrFile] = useState(null)
  const [qrUploading, setQrUploading] = useState(false)
  const qc = useQueryClient()

  async function uploadQr() {
    if (!qrFile) return
    setQrUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', qrFile)
      const res = await api.post(`/weddings/${wid}/invitation/upload-qr`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      qc.invalidateQueries(['invitation', wid])
      toast.success('QR DuitNow berjaya dimuat naik!')
      setQrFile(null)
    } catch {
      toast.error('Gagal muat naik QR')
    } finally {
      setQrUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Tetapan Jemputan</h2>
        <p className="text-sm text-gray-500 mt-0.5">Urus ciri-ciri yang muncul dalam jemputan anda.</p>
      </div>

      {/* RSVP toggles */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 mb-2">RSVP & Paparan</p>
        <ToggleSwitch checked={inv?.enable_rsvp ?? true} onChange={v => onToggle('enable_rsvp', v)} label="Aktifkan RSVP" sub="Tetamu boleh hantar RSVP" />
        <ToggleSwitch checked={inv?.show_meal_preference ?? false} onChange={v => onToggle('show_meal_preference', v)} label="Pilihan Makanan" sub="Tunjuk pilihan makanan dalam RSVP" />
        <ToggleSwitch checked={inv?.enable_countdown ?? true} onChange={v => onToggle('enable_countdown', v)} label="Countdown" sub="Tunjuk kiraan masa ke hari majlis" />
        <ToggleSwitch checked={inv?.show_love_story ?? true} onChange={v => onToggle('show_love_story', v)} label="Kisah Cinta" sub="Tunjuk seksyen love story" />
        <ToggleSwitch checked={inv?.show_dress_code ?? true} onChange={v => onToggle('show_dress_code', v)} label="Dress Code" sub="Tunjuk kod pakaian" />
        <ToggleSwitch checked={inv?.show_gift_registry ?? false} onChange={v => onToggle('show_gift_registry', v)} label="Gift Registry" sub="Tunjuk senarai hadiah" />
        <ToggleSwitch checked={inv?.enable_music ?? false} onChange={v => onToggle('enable_music', v)} label="Muzik Latar" sub="Mainkan muzik apabila jemputan dibuka" />
        {inv?.enable_music && (
          <div className="pt-2 pb-1">
            <input value={musicUrl} onChange={e => setMusicUrl(e.target.value)} onBlur={() => onSave({ music_url: musicUrl || null })}
              className="input-field w-full text-sm" placeholder="URL YouTube atau MP3..." />
          </div>
        )}
        <div className="pt-3 border-t border-gray-50 mt-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Had Pax RSVP</label>
          <div className="flex gap-2">
            <input type="number" min="1" value={rsvpPax} onChange={e => setRsvpPax(e.target.value)}
              className="input-field flex-1 text-sm" placeholder="Kosong = tiada had" />
            <button onClick={() => onSave({ rsvp_max_pax: rsvpPax ? Number(rsvpPax) : null })} className="btn-primary text-sm px-4">Simpan</button>
          </div>
        </div>
      </div>

      {/* DuitNow QR */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 mb-3">QR DuitNow</p>
        {inv?.duitnow_qr_url && (
          <div className="mb-3 flex items-center gap-3">
            <img src={inv.duitnow_qr_url.startsWith('/') ? inv.duitnow_qr_url : inv.duitnow_qr_url} alt="DuitNow QR" className="w-20 h-20 object-contain rounded-lg border border-gray-200" />
            <p className="text-xs text-gray-500">QR semasa</p>
          </div>
        )}
        <label className="block text-xs font-medium text-gray-700 mb-1">Muat naik gambar QR</label>
        <div className="flex gap-2">
          <input type="file" accept="image/*" onChange={e => setQrFile(e.target.files?.[0] || null)}
            className="input-field flex-1 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary-50 file:text-primary-700" />
          <button onClick={uploadQr} disabled={!qrFile || qrUploading} className="btn-primary text-sm px-4 flex items-center gap-1.5">
            <Upload size={14} /> {qrUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Atau paste URL:</p>
        <input key={inv?.duitnow_qr_url} defaultValue={inv?.duitnow_qr_url ?? ''}
          onBlur={e => onSave({ duitnow_qr_url: e.target.value || null })}
          className="input-field w-full text-sm mt-1" placeholder="https://..." />
      </div>

      {/* Dress code + gift registry URLs */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold text-gray-700">Maklumat Tambahan</p>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dress Code</label>
          <input key={inv?.dress_code_description} defaultValue={inv?.dress_code_description ?? ''}
            onBlur={e => onSave({ dress_code_description: e.target.value || null })}
            className="input-field w-full text-sm" placeholder="cth. Baju Kurung / Smart Casual, Warna Krim & Gold..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Link Gift Registry (Shopee/Amazon)</label>
          <input key={inv?.gift_registry_url} defaultValue={inv?.gift_registry_url ?? ''}
            onBlur={e => onSave({ gift_registry_url: e.target.value || null })}
            className="input-field w-full text-sm" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mesej Khas</label>
          <textarea key={inv?.custom_message} defaultValue={inv?.custom_message ?? ''}
            onBlur={e => onSave({ custom_message: e.target.value || null })}
            className="input-field w-full text-sm resize-none" rows={3} placeholder="Mesej peribadi kepada tetamu..." />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary flex items-center gap-1"><ChevronLeft size={15} /> Balik</button>
        <button onClick={onNext} className="btn-primary flex-1 flex items-center justify-center gap-2">
          Seterusnya <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 5: Share ────────────────────────────────────────────────────────────

function ShareStep({ inv, wid, onBack, onPublish }) {
  const [copied, setCopied] = useState(false)
  const url = inv ? `${window.location.origin}/i/${inv.slug}` : ''

  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Terbitkan Jemputan</h2>
        <p className="text-sm text-gray-500 mt-0.5">Siap! Kongsi link jemputan dengan tetamu anda.</p>
      </div>

      <div className={`card border-2 ${inv?.is_published ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-gray-900">{inv?.is_published ? '✓ Jemputan Aktif' : 'Belum Diterbitkan'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{inv?.is_published ? 'Tetamu boleh buka link jemputan ini.' : 'Terbitkan supaya tetamu boleh akses.'}</p>
          </div>
          <button onClick={onPublish}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-colors ${inv?.is_published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
            {inv?.is_published ? 'Diterbitkan ✓' : 'Terbitkan'}
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-100">
          <input readOnly value={url} className="flex-1 text-xs text-gray-600 bg-transparent outline-none truncate" />
          <button onClick={copy} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {copied ? <><Check size={12} /> Disalin!</> : <><Copy size={12} /> Salin</>}
          </button>
        </div>
      </div>

      <a href={`/i/${inv?.slug}?preview=1`} target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors font-medium text-sm">
        <Eye size={16} /> Preview Jemputan
      </a>

      <button onClick={onBack} className="btn-secondary w-full flex items-center justify-center gap-1">
        <ChevronLeft size={15} /> Edit Semula
      </button>
    </div>
  )
}

// ─── Sub-sections for Settings: Love Story, Gallery, Contacts ─────────────────

function LoveStorySection({ wid }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ year: '', title: '', description: '', image_url: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { data: entries = [] } = useQuery(['love-story', wid], () => api.get(`/weddings/${wid}/invitation/love-story`).then(r => r.data), { enabled: !!wid })
  const addMutation = useMutation((d) => api.post(`/weddings/${wid}/invitation/love-story`, d), { onSuccess: () => { qc.invalidateQueries(['love-story', wid]); setShowForm(false); setForm({ year: '', title: '', description: '', image_url: '' }); toast.success('Ditambah!') } })
  const delMutation = useMutation((id) => api.delete(`/weddings/${wid}/invitation/love-story/${id}`), { onSuccess: () => qc.invalidateQueries(['love-story', wid]) })

  return (
    <div className="card space-y-3">
      <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Heart size={14} className="text-blush-500" /> Kisah Cinta</p>
      {entries.map((e, i) => (
        <div key={e.id} className="flex items-start gap-2 text-sm text-gray-700 group">
          <span className="w-5 h-5 rounded-full bg-blush-100 text-blush-600 flex items-center justify-center text-xs shrink-0 mt-0.5">{i + 1}</span>
          <div className="flex-1 min-w-0">
            {e.year && <span className="text-gray-400 text-xs mr-1">{e.year}</span>}
            <span className="font-medium">{e.title}</span>
            {e.description && <p className="text-xs text-gray-400">{e.description}</p>}
          </div>
          <button onClick={() => delMutation.mutate(e.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 shrink-0"><Trash2 size={12} /></button>
        </div>
      ))}
      {showForm ? (
        <div className="space-y-2 bg-gray-50 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-2">
            <input className="input-field text-sm" placeholder="Tahun" value={form.year} onChange={e => set('year', e.target.value)} />
            <input className="input-field text-sm" placeholder="Tajuk *" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <input className="input-field text-sm w-full" placeholder="Huraian" value={form.description} onChange={e => set('description', e.target.value)} />
          <input className="input-field text-sm w-full" placeholder="URL Gambar" value={form.image_url} onChange={e => set('image_url', e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Batal</button>
            <button onClick={() => form.title && addMutation.mutate(form)} className="btn-primary flex-1 text-sm">Tambah</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs text-gray-400 hover:text-primary-600 w-full py-1.5 border border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-1 transition-colors">
          <Plus size={11} /> Tambah
        </button>
      )}
    </div>
  )
}

function ContactsSection({ wid }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', role: '', side: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const { data: contacts = [] } = useQuery(['contacts', wid], () => api.get(`/weddings/${wid}/invitation/contacts`).then(r => r.data), { enabled: !!wid })
  const addMutation = useMutation((d) => api.post(`/weddings/${wid}/invitation/contacts`, d), { onSuccess: () => { qc.invalidateQueries(['contacts', wid]); setShowForm(false); setForm({ name: '', phone: '', role: '', side: '' }); toast.success('Ditambah!') } })
  const delMutation = useMutation((id) => api.delete(`/weddings/${wid}/invitation/contacts/${id}`), { onSuccess: () => qc.invalidateQueries(['contacts', wid]) })

  return (
    <div className="card space-y-3">
      <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Phone size={14} className="text-primary-500" /> Orang Hubungi</p>
      {contacts.map(c => (
        <div key={c.id} className="flex items-center justify-between text-sm group">
          <div>
            <span className="font-medium text-gray-800">{c.name}</span>
            {c.role && <span className="text-gray-400 ml-1">({c.role})</span>}
            <p className="text-xs text-gray-400">{c.phone}</p>
          </div>
          <button onClick={() => delMutation.mutate(c.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400"><Trash2 size={12} /></button>
        </div>
      ))}
      {showForm ? (
        <div className="space-y-2 bg-gray-50 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-2">
            <input className="input-field text-sm" placeholder="Nama *" value={form.name} onChange={e => set('name', e.target.value)} />
            <input className="input-field text-sm" placeholder="No. Tel *" value={form.phone} onChange={e => set('phone', e.target.value)} />
            <input className="input-field text-sm" placeholder="Peranan" value={form.role} onChange={e => set('role', e.target.value)} />
            <select className="input-field text-sm" value={form.side} onChange={e => set('side', e.target.value)}>
              <option value="">Kedua-dua</option>
              <option value="GROOM">Pihak Lelaki</option>
              <option value="BRIDE">Pihak Perempuan</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Batal</button>
            <button onClick={() => form.name && form.phone && addMutation.mutate(form)} className="btn-primary flex-1 text-sm">Tambah</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="text-xs text-gray-400 hover:text-primary-600 w-full py-1.5 border border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-1 transition-colors">
          <Plus size={11} /> Tambah
        </button>
      )}
    </div>
  )
}

// ─── Main Builder Page ────────────────────────────────────────────────────────

export default function InvitationBuilderPage() {
  const qc = useQueryClient()
  const [step, setStep] = useState('design')

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings[0]
  const wid = wedding?.id

  const { data: inv, isLoading } = useQuery(
    ['invitation', wid],
    () => api.get(`/weddings/${wid}/invitation`).then(r => r.data).catch(() => null),
    { enabled: !!wid },
  )

  const createMutation = useMutation(
    () => api.post(`/weddings/${wid}/invitation`, {}),
    { onSuccess: () => { qc.invalidateQueries(['invitation', wid]); toast.success('Jemputan dibuat!') } }
  )

  const updateMutation = useMutation(
    (data) => api.patch(`/weddings/${wid}/invitation`, data),
    {
      onMutate: async (data) => {
        await qc.cancelQueries(['invitation', wid])
        const prev = qc.getQueryData(['invitation', wid])
        qc.setQueryData(['invitation', wid], old => old ? { ...old, ...data } : old)
        return { prev }
      },
      onError: (_e, _v, ctx) => qc.setQueryData(['invitation', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['invitation', wid]),
    }
  )

  const publishMutation = useMutation(
    () => api.post(`/weddings/${wid}/invitation/publish`),
    { onSuccess: () => { qc.invalidateQueries(['invitation', wid]); toast.success(inv?.is_published ? 'Jemputan ditarik balik' : 'Jemputan diterbitkan! 🎉') } }
  )

  function handleSave(data) { updateMutation.mutate(data) }
  function handleToggle(key, value) { updateMutation.mutate({ [key]: value }) }
  function next() {
    const idx = STEPS.findIndex(s => s.key === step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key)
  }
  function back() {
    const idx = STEPS.findIndex(s => s.key === step)
    if (idx > 0) setStep(STEPS[idx - 1].key)
  }

  if (isLoading) return <div className="p-6 text-center text-gray-400 py-16">Memuatkan...</div>

  if (!inv) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20">
        <Mail size={48} className="mx-auto text-primary-300 mb-4" />
        <h1 className="text-2xl font-serif text-gray-900 mb-2">E-Jemputan Digital</h1>
        <p className="text-gray-500 mb-6">Cipta jemputan kahwin digital yang cantik. Boleh kongsi dengan semua tetamu.</p>
        <button onClick={() => createMutation.mutate()} disabled={createMutation.isLoading} className="btn-primary text-base px-8 py-3">
          {createMutation.isLoading ? 'Membuat...' : 'Mula Bina Jemputan'}
        </button>
      </div>
    )
  }

  const stepContent = {
    design:   <DesignPickerStep inv={inv} wid={wid} onSave={handleSave} onNext={next} />,
    envelope: <EnvelopeStep inv={inv} onSave={handleSave} onNext={next} onBack={back} />,
    card:     <CardEditorStep inv={inv} wid={wid} wedding={wedding} onSave={handleSave} onNext={next} onBack={back} />,
    settings: (
      <div className="space-y-4">
        <SettingsStep inv={inv} wid={wid} onSave={handleSave} onToggle={handleToggle} onNext={next} onBack={back} />
        <LoveStorySection wid={wid} />
        <ContactsSection wid={wid} />
      </div>
    ),
    share: <ShareStep inv={inv} wid={wid} onBack={back} onPublish={() => publishMutation.mutate()} />,
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-serif text-gray-900">E-Jemputan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bina jemputan digital yang cantik untuk hari istimewa anda.</p>
      </div>

      <StepBar step={step} setStep={setStep} inv={inv} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18 }}
        >
          {stepContent[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
