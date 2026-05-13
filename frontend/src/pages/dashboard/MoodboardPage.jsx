import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image, Plus, X, Trash2, Edit2, Link, Upload,
  Palette, StickyNote, Tag,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'ALL',         label: 'Semua' },
  { key: 'OUTFIT',      label: 'Baju Sanding' },
  { key: 'PELAMIN',     label: 'Pelamin' },
  { key: 'DECOR',       label: 'Dekorasi' },
  { key: 'FLOWERS',     label: 'Bunga' },
  { key: 'VENUE',       label: 'Venue' },
  { key: 'HAIR_MAKEUP', label: 'MUA & Rambut' },
  { key: 'HENNA',       label: 'Henna' },
  { key: 'COLORS',      label: 'Warna' },
  { key: 'FOOD',        label: 'Makanan' },
  { key: 'INVITATION',  label: 'Jemputan' },
  { key: 'OTHER',       label: 'Lain-lain' },
]

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c.label]))

// ─── Masonry layout helper ────────────────────────────────────────────────────
// Split items into N columns round-robin for a masonry feel
function splitColumns(items, n) {
  const cols = Array.from({ length: n }, () => [])
  items.forEach((item, i) => cols[i % n].push(item))
  return cols
}

// ─── Moodboard Card ───────────────────────────────────────────────────────────

function MoodCard({ item, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 group cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title || ''}
          className="w-full object-cover block"
          style={{ maxHeight: '400px' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      ) : item.color_hex ? (
        <div
          className="w-full h-32 flex items-center justify-center"
          style={{ background: item.color_hex }}
        >
          <span className="text-white/80 font-mono text-sm font-medium drop-shadow">{item.color_hex}</span>
        </div>
      ) : (
        <div className="w-full h-24 bg-gray-50 flex items-center justify-center">
          <Image size={28} className="text-gray-200" />
        </div>
      )}

      {/* Info */}
      {(item.title || item.note || item.color_hex) && (
        <div className="p-3 space-y-1">
          {item.title && <p className="text-sm font-medium text-gray-800 leading-snug">{item.title}</p>}
          {item.note && <p className="text-xs text-gray-400 leading-relaxed">{item.note}</p>}
          {item.color_hex && item.image_url && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ background: item.color_hex }} />
              <span className="text-xs font-mono text-gray-400">{item.color_hex}</span>
            </div>
          )}
        </div>
      )}

      {/* Category badge */}
      <div className="absolute top-2 left-2">
        <span className="px-2 py-0.5 rounded-full text-xs bg-black/40 text-white backdrop-blur-sm">
          {CAT_MAP[item.category] || item.category}
        </span>
      </div>

      {/* Action overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 flex gap-1"
          >
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow text-gray-600 hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Add/Edit Modal ───────────────────────────────────────────────────────────

function ItemModal({ item, defaultCategory, onClose, onSaveUrl, onUpload }) {
  const [mode, setMode] = useState('url') // 'url' | 'upload' | 'color'
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      category: item?.category ?? defaultCategory ?? 'OUTFIT',
      title: item?.title ?? '',
      image_url: item?.image_url ?? '',
      color_hex: item?.color_hex ?? '',
      note: item?.note ?? '',
    },
  })

  function pickFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function submitUpload(formData) {
    if (!file) { toast.error('Pilih fail gambar'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('category', formData.category)
    if (formData.title) fd.append('title', formData.title)
    if (formData.note) fd.append('note', formData.note)
    if (formData.color_hex) fd.append('color_hex', formData.color_hex)
    await onUpload(fd)
    setUploading(false)
  }

  function submitUrl(formData) {
    onSaveUrl({
      category: formData.category,
      title: formData.title || null,
      image_url: formData.image_url || null,
      color_hex: formData.color_hex || null,
      note: formData.note || null,
    })
  }

  const isEdit = !!item

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Edit Item' : 'Tambah Inspirasi'}
            </h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Mode tabs — only for new items */}
          {!isEdit && (
            <div className="flex items-center bg-gray-100 rounded-xl p-1 mb-5 gap-1">
              {[
                ['url', <Link size={13} />, 'Link URL'],
                ['upload', <Upload size={13} />, 'Upload Fail'],
                ['color', <Palette size={13} />, 'Warna Sahaja'],
              ].map(([m, icon, lbl]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${mode === m ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {icon} {lbl}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit(mode === 'upload' && !isEdit ? submitUpload : submitUrl)} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <select {...register('category')} className="input-field w-full">
                {CATEGORIES.filter(c => c.key !== 'ALL').map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label / Tajuk (pilihan)</label>
              <input {...register('title')} className="input-field w-full" placeholder="cth: Baju nikah putih lace" />
            </div>

            {/* Image source */}
            {(!isEdit || item?.image_url) && mode === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Link size={13} /> URL Gambar (pilihan)
                </label>
                <input
                  {...register('image_url')}
                  className="input-field w-full"
                  placeholder="https://i.pinimg.com/..."
                />
                <p className="text-xs text-gray-400 mt-1">Pinterest, Instagram, atau mana-mana URL gambar</p>
              </div>
            )}

            {!isEdit && mode === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1"><Upload size={13} /> Fail Gambar</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                >
                  {preview ? (
                    <img src={preview} className="max-h-40 mx-auto rounded-lg object-cover" alt="preview" />
                  ) : (
                    <>
                      <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">Klik untuk pilih gambar</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — maks 10MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
              </div>
            )}

            {/* Color hex */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Palette size={13} /> Warna (pilihan)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  {...register('color_hex')}
                  type="color"
                  className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer p-1"
                />
                <input
                  {...register('color_hex')}
                  className="input-field flex-1"
                  placeholder="#F5A623"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <StickyNote size={13} /> Nota (pilihan)
              </label>
              <textarea
                {...register('note')}
                className="input-field w-full resize-none"
                rows={2}
                placeholder="cth: Suka gaya renda di bahagian atas..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
              <button type="submit" className="btn-primary flex-1" disabled={uploading}>
                {uploading ? 'Memuat naik...' : isEdit ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40" onClick={onCancel} />
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center">
          <p className="font-semibold text-gray-900 mb-1">Padam inspirasi ini?</p>
          <p className="text-sm text-gray-500 mb-5">Tindakan ini tidak boleh dibatalkan.</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1">Batal</button>
            <button onClick={onConfirm} className="btn-danger flex-1">Padam</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MoodboardPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('ALL')
  const [modal, setModal] = useState(null) // null | { item? }
  const [deleteId, setDeleteId] = useState(null)

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings[0]
  const wid = wedding?.id

  const { data: items = [], isLoading } = useQuery(
    ['moodboard', wid],
    () => api.get(`/weddings/${wid}/moodboard`).then(r => r.data),
    { enabled: !!wid },
  )

  const saveMutation = useMutation(
    ({ id, data }) => id
      ? api.patch(`/weddings/${wid}/moodboard/${id}`, data)
      : api.post(`/weddings/${wid}/moodboard`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['moodboard', wid])
        setModal(null)
        toast.success(modal?.item ? 'Dikemaskini' : 'Inspirasi ditambah!')
      },
      onError: () => toast.error('Gagal simpan'),
    }
  )

  const uploadMutation = useMutation(
    (formData) => api.post(`/weddings/${wid}/moodboard/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['moodboard', wid])
        setModal(null)
        toast.success('Gambar dimuat naik!')
      },
      onError: () => toast.error('Gagal muat naik gambar'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/moodboard/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['moodboard', wid]); setDeleteId(null); toast.success('Dipadam') },
      onError: () => toast.error('Gagal padam'),
    }
  )

  const filtered = useMemo(
    () => activeTab === 'ALL' ? items : items.filter(i => i.category === activeTab),
    [items, activeTab]
  )

  // Responsive columns: 2 on small, 3 on md+
  const columns = splitColumns(filtered, 3)

  // Tab counts
  const counts = useMemo(() => {
    const c = { ALL: items.length }
    for (const item of items) c[item.category] = (c[item.category] ?? 0) + 1
    return c
  }, [items])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Moodboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kumpul inspirasi visual untuk majlis impian kamu</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Inspirasi
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const count = counts[cat.key] ?? 0
          if (cat.key !== 'ALL' && count === 0 && activeTab !== cat.key) return null
          return (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeTab === cat.key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {cat.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${activeTab === cat.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Image size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Tiada inspirasi lagi</p>
          <p className="text-sm mt-1">Tambah gambar dari Pinterest, Instagram, atau muat naik sendiri</p>
          <button onClick={() => setModal({})} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={15} /> Tambah Inspirasi
          </button>
        </div>
      )}

      {/* Masonry grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-start">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-4">
              {col.map(item => (
                <MoodCard
                  key={item.id}
                  item={item}
                  onEdit={(i) => setModal({ item: i })}
                  onDelete={(id) => setDeleteId(id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ItemModal
          item={modal.item}
          defaultCategory={activeTab !== 'ALL' ? activeTab : undefined}
          onClose={() => setModal(null)}
          onSaveUrl={(data) => saveMutation.mutate({ id: modal.item?.id ?? null, data })}
          onUpload={(fd) => uploadMutation.mutate(fd)}
        />
      )}

      {deleteId && (
        <DeleteConfirm
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
