import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, CheckCircle2, Circle, ChevronDown, ChevronUp,
  AlertTriangle, Plus, X, Trash2, Edit2, StickyNote,
  Calendar, Bell, Users, User,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── helpers ─────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  return diff
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ done, total, color = 'bg-primary-600' }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-16 text-right">{done}/{total} ({pct}%)</span>
    </div>
  )
}

// ─── Expiry warning badge ─────────────────────────────────────────────────────

function ExpiryBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  if (days === null) return null
  if (days < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
      <AlertTriangle size={11} /> Tamat tempoh
    </span>
  )
  if (days <= 30) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
      <AlertTriangle size={11} /> {days}h lagi
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
      <Calendar size={11} /> {formatDate(dateStr)}
    </span>
  )
}

// ─── Checklist Item Row ───────────────────────────────────────────────────────

function ItemRow({ item, onToggle, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingExpiry, setEditingExpiry] = useState(false)
  const [notesVal, setNotesVal] = useState(item.notes || '')
  const [expiryVal, setExpiryVal] = useState(item.expiry_date || '')

  const hasReminder = !!item.reminder_note
  const isHIV = item.title.toLowerCase().includes('hiv')

  function saveNotes() {
    onUpdate(item.id, { notes: notesVal || null })
    setEditingNotes(false)
  }

  function saveExpiry() {
    onUpdate(item.id, { expiry_date: expiryVal || null })
    setEditingExpiry(false)
  }

  return (
    <div className={`border rounded-xl transition-all ${item.is_completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => onToggle(item.id, !item.is_completed)}
          className="mt-0.5 flex-shrink-0 text-primary-600 hover:text-primary-700 transition-colors"
        >
          {item.is_completed
            ? <CheckCircle2 size={20} className="text-emerald-500" />
            : <Circle size={20} className="text-gray-300" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {item.title}
          </p>

          {/* Expiry badge for HIV test */}
          {(isHIV || item.expiry_date) && (
            <div className="mt-1">
              <ExpiryBadge dateStr={item.expiry_date} />
            </div>
          )}

          {/* Reminder note */}
          {hasReminder && !item.is_completed && (
            <p className="mt-1 text-xs text-amber-700 flex items-center gap-1">
              <Bell size={10} /> {item.reminder_note}
            </p>
          )}

          {/* Notes preview */}
          {item.notes && !expanded && (
            <p className="mt-1 text-xs text-gray-400 truncate">{item.notes}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {!item.is_preset && (
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-100">
              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <StickyNote size={11} /> Nota
                  </span>
                  {!editingNotes && (
                    <button onClick={() => setEditingNotes(true)} className="text-xs text-primary-600 hover:underline">
                      {item.notes ? 'Edit' : 'Tambah nota'}
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="flex gap-2">
                    <textarea
                      value={notesVal}
                      onChange={e => setNotesVal(e.target.value)}
                      rows={2}
                      className="input-field text-xs flex-1 resize-none"
                      placeholder="Tambah nota..."
                    />
                    <div className="flex flex-col gap-1">
                      <button onClick={saveNotes} className="text-xs btn-primary px-2 py-1">Simpan</button>
                      <button onClick={() => { setEditingNotes(false); setNotesVal(item.notes || '') }} className="text-xs btn-secondary px-2 py-1">Batal</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">{item.notes || <span className="italic text-gray-300">Tiada nota</span>}</p>
                )}
              </div>

              {/* Expiry date (special for HIV) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                    <Calendar size={11} /> {isHIV ? 'Tarikh tamat sijil' : 'Tarikh luput'}
                  </span>
                  {!editingExpiry && (
                    <button onClick={() => setEditingExpiry(true)} className="text-xs text-primary-600 hover:underline">
                      {item.expiry_date ? 'Edit' : 'Tetapkan tarikh'}
                    </button>
                  )}
                </div>
                {editingExpiry ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={expiryVal}
                      onChange={e => setExpiryVal(e.target.value)}
                      className="input-field text-xs"
                    />
                    <button onClick={saveExpiry} className="text-xs btn-primary px-2 py-1">Simpan</button>
                    <button onClick={() => { setEditingExpiry(false); setExpiryVal(item.expiry_date || '') }} className="text-xs btn-secondary px-2 py-1">Batal</button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    {item.expiry_date ? formatDate(item.expiry_date) : <span className="italic text-gray-300">Tiada tarikh</span>}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section block ────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, color, items, onToggle, onUpdate, onDelete }) {
  const done = items.filter(i => i.is_completed).length
  return (
    <div className={`rounded-2xl border-2 ${color} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-gray-600" />
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="ml-auto text-xs font-medium text-gray-500">{done}/{items.length}</span>
      </div>
      <ProgressBar done={done} total={items.length} />
      <div className="mt-4 space-y-2">
        {items.map(item => (
          <ItemRow
            key={item.id}
            item={item}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        {items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Tiada item</p>
        )}
      </div>
    </div>
  )
}

// ─── Add Item Modal ───────────────────────────────────────────────────────────

function AddModal({ onClose, onSave, weddingId }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { title: '', side: 'BOTH', reminder_note: '' },
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Tambah Dokumen</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokumen *</label>
              <input
                {...register('title', { required: 'Nama diperlukan' })}
                className="input-field w-full"
                placeholder="cth: Surat Pengesahan Doktor"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pihak</label>
              <select {...register('side')} className="input-field w-full">
                <option value="BOTH">Kedua-dua Pihak</option>
                <option value="BRIDE">Pihak Perempuan</option>
                <option value="GROOM">Pihak Lelaki</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peringatan (pilihan)</label>
              <input
                {...register('reminder_note')}
                className="input-field w-full"
                placeholder="cth: Perlu diperbaharui setiap tahun"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
              <button type="submit" className="btn-primary flex-1">Tambah</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsHubPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings[0]
  const wid = wedding?.id

  const { data: items = [], isLoading } = useQuery(
    ['documents', wid],
    () => api.get(`/weddings/${wid}/documents`).then(r => r.data),
    { enabled: !!wid },
  )

  // Seed default items on first load when list is empty
  const seedMutation = useMutation(
    () => api.post(`/weddings/${wid}/documents/seed`),
    { onSuccess: () => qc.invalidateQueries(['documents', wid]) },
  )

  useEffect(() => {
    if (wid && !isLoading && items.length === 0) {
      seedMutation.mutate()
    }
  }, [wid, isLoading, items.length])

  const toggleMutation = useMutation(
    ({ id, is_completed }) => api.patch(`/weddings/${wid}/documents/${id}`, { is_completed }),
    {
      onMutate: async ({ id, is_completed }) => {
        await qc.cancelQueries(['documents', wid])
        const prev = qc.getQueryData(['documents', wid])
        qc.setQueryData(['documents', wid], old =>
          old.map(i => i.id === id ? { ...i, is_completed } : i)
        )
        return { prev }
      },
      onError: (_err, _v, ctx) => qc.setQueryData(['documents', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['documents', wid]),
    }
  )

  const updateMutation = useMutation(
    ({ id, data }) => api.patch(`/weddings/${wid}/documents/${id}`, data),
    {
      onSuccess: () => qc.invalidateQueries(['documents', wid]),
      onError: () => toast.error('Gagal kemaskini'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/documents/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['documents', wid]); toast.success('Item dipadam') },
      onError: () => toast.error('Gagal padam'),
    }
  )

  const addMutation = useMutation(
    (data) => api.post(`/weddings/${wid}/documents`, data),
    {
      onSuccess: () => { qc.invalidateQueries(['documents', wid]); setShowAdd(false); toast.success('Dokumen ditambah') },
      onError: () => toast.error('Gagal tambah item'),
    }
  )

  function handleToggle(id, is_completed) {
    toggleMutation.mutate({ id, is_completed })
  }

  function handleUpdate(id, data) {
    updateMutation.mutate({ id, data })
  }

  function handleDelete(id) {
    deleteMutation.mutate(id)
  }

  function handleAdd(formData) {
    addMutation.mutate({
      title: formData.title,
      side: formData.side,
      reminder_note: formData.reminder_note || null,
      is_preset: false,
    })
  }

  const bothItems = useMemo(() => items.filter(i => i.side === 'BOTH'), [items])
  const brideItems = useMemo(() => items.filter(i => i.side === 'BRIDE'), [items])
  const groomItems = useMemo(() => items.filter(i => i.side === 'GROOM'), [items])

  const totalDone = items.filter(i => i.is_completed).length
  const total = items.length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Dokumen & Senarai Semak</h1>
          <p className="text-sm text-gray-500 mt-0.5">Senarai dokumen yang perlu disediakan sebelum majlis</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Overall progress */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-primary-600" />
          <h2 className="font-semibold text-gray-800">Kemajuan Keseluruhan</h2>
        </div>
        <ProgressBar done={totalDone} total={total} />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Memuatkan...</div>
      ) : (
        <div className="space-y-5">
          <Section
            title="Kedua-dua Pihak"
            icon={Users}
            color="border-primary-200"
            items={bothItems}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
          <Section
            title="Pihak Perempuan"
            icon={User}
            color="border-blush-200"
            items={brideItems}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
          <Section
            title="Pihak Lelaki"
            icon={User}
            color="border-violet-200"
            items={groomItems}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      )}

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
          weddingId={wid}
        />
      )}
    </div>
  )
}
