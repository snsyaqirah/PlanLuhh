import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scroll, Plus, X, Trash2, Edit2, Clock, User,
  StickyNote, GripVertical, Download,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAJLIS = [
  { key: 'AKAD_NIKAH',         label: 'Akad Nikah',             color: 'border-primary-300',  dot: 'bg-primary-500',  badge: 'bg-primary-50 text-primary-700' },
  { key: 'SANDING_PEREMPUAN',  label: 'Sanding Pihak Perempuan', color: 'border-blush-300',    dot: 'bg-blush-400',    badge: 'bg-blush-50 text-blush-600' },
  { key: 'SANDING_LELAKI',     label: 'Sanding Pihak Lelaki',   color: 'border-violet-300',   dot: 'bg-violet-500',   badge: 'bg-violet-50 text-violet-700' },
]

const PRESET_ACTIVITIES = [
  'Ketibaan tetamu',
  'Perarakan masuk pengantin',
  'Akad nikah / Ijab Kabul',
  'Persandingan di pelamin',
  'Sesi salam & restu',
  'Makan beradab',
  'Potong kek',
  'Sesi bergambar rasmi',
  'Hiburan / Persembahan',
  'Jamuan terbuka',
  'Perarakan keluar pengantin',
  'Penutup majlis',
]

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PTG' : 'PGI'}`
}

// ─── Entry Row ────────────────────────────────────────────────────────────────

function EntryRow({ entry, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-3 group"
    >
      {/* Time column */}
      <div className="w-20 flex-shrink-0 text-right">
        {entry.start_time ? (
          <>
            <p className="text-xs font-semibold text-gray-700">{formatTime(entry.start_time)}</p>
            {entry.end_time && <p className="text-xs text-gray-400">{formatTime(entry.end_time)}</p>}
          </>
        ) : (
          <p className="text-xs text-gray-300 italic">—</p>
        )}
      </div>

      {/* Divider line */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-gray-300 mt-1" />
        <div className="w-px flex-1 bg-gray-100 min-h-[20px]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{entry.activity}</p>
        {entry.pic && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <User size={10} /> {entry.pic}
          </p>
        )}
        {entry.notes && (
          <p className="text-xs text-gray-400 flex items-start gap-1 mt-0.5">
            <StickyNote size={10} className="flex-shrink-0 mt-0.5" /> {entry.notes}
          </p>
        )}
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => onEdit(entry)} className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(entry.id)} className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Entry Modal ──────────────────────────────────────────────────────────────

function EntryModal({ entry, activeMajlis, onClose, onSave }) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      majlis:     entry?.majlis     ?? activeMajlis ?? 'AKAD_NIKAH',
      activity:   entry?.activity   ?? '',
      start_time: entry?.start_time ?? '',
      end_time:   entry?.end_time   ?? '',
      pic:        entry?.pic        ?? '',
      notes:      entry?.notes      ?? '',
      sort_order: entry?.sort_order ?? 0,
    },
  })

  function onSubmit(data) {
    onSave({
      ...data,
      start_time: data.start_time || null,
      end_time:   data.end_time   || null,
      pic:        data.pic        || null,
      notes:      data.notes      || null,
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{entry ? 'Edit Sesi' : 'Tambah Sesi'}</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Majlis</label>
              <select {...register('majlis')} className="input-field w-full">
                {MAJLIS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktiviti / Sesi *</label>
              <input {...register('activity', { required: true })} className="input-field w-full" placeholder="cth: Perarakan masuk pengantin" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_ACTIVITIES.map(a => (
                  <button key={a} type="button"
                    onClick={() => setValue('activity', a)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600 rounded-full transition-colors">
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masa Mula</label>
                <input type="time" {...register('start_time')} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masa Tamat</label>
                <input type="time" {...register('end_time')} className="input-field w-full" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIC / Tanggungjawab</label>
              <input {...register('pic')} className="input-field w-full" placeholder="cth: MC, Pengapit, Keluarga" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <textarea {...register('notes')} className="input-field w-full resize-none" rows={2} placeholder="cth: Pastikan bunga sudah siap..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
              <input type="number" {...register('sort_order', { valueAsNumber: true })} className="input-field w-full" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
              <button type="submit" className="btn-primary flex-1">{entry ? 'Simpan' : 'Tambah'}</button>
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
          <p className="font-semibold text-gray-900 mb-1">Padam sesi ini?</p>
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

export default function RundownPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('AKAD_NIKAH')
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  const { data: entries = [], isLoading } = useQuery(
    ['rundown', wid],
    () => api.get(`/weddings/${wid}/rundown`).then(r => r.data),
    { enabled: !!wid },
  )

  const saveMutation = useMutation(
    ({ id, data }) => id
      ? api.patch(`/weddings/${wid}/rundown/${id}`, data)
      : api.post(`/weddings/${wid}/rundown`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['rundown', wid])
        setModal(null)
        toast.success(modal?.entry ? 'Dikemaskini' : 'Sesi ditambah!')
      },
      onError: () => toast.error('Gagal simpan'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/rundown/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['rundown', wid]); setDeleteId(null); toast.success('Dipadam') },
      onError: () => toast.error('Gagal padam'),
    }
  )

  const byMajlis = useMemo(() => {
    const map = {}
    for (const m of MAJLIS) map[m.key] = []
    for (const e of entries) {
      if (map[e.majlis]) map[e.majlis].push(e)
    }
    return map
  }, [entries])

  const activeEntries = byMajlis[activeTab] ?? []
  const activeMajlisCfg = MAJLIS.find(m => m.key === activeTab)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Aturcara Majlis</h1>
          <p className="text-sm text-gray-500 mt-0.5">Skrip minit-seminit untuk setiap majlis</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Sesi
        </button>
      </div>

      {/* Majlis tabs */}
      <div className="flex gap-2">
        {MAJLIS.map(m => {
          const count = byMajlis[m.key]?.length ?? 0
          return (
            <button
              key={m.key}
              onClick={() => setActiveTab(m.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-xs font-medium transition-all ${
                activeTab === m.key
                  ? `${m.color} bg-white shadow-sm text-gray-800`
                  : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${m.dot}`} />
              <span className="text-center leading-tight">{m.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === m.key ? m.badge : 'bg-gray-100 text-gray-400'}`}>
                {count} sesi
              </span>
            </button>
          )
        })}
      </div>

      {/* Entries */}
      {isLoading ? (
        <p className="text-center py-12 text-gray-400">Memuatkan...</p>
      ) : activeEntries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Scroll size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Belum ada aturcara untuk {activeMajlisCfg?.label}</p>
          <p className="text-sm mt-1">Tambah sesi seperti perarakan, persandingan, makan beradab...</p>
          <button onClick={() => setModal({})} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={15} /> Tambah Sesi
          </button>
        </div>
      ) : (
        <div className={`rounded-2xl border-2 ${activeMajlisCfg?.color} p-4 space-y-3`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-700">{activeMajlisCfg?.label}</p>
            <span className="text-xs text-gray-400">{activeEntries.length} sesi</span>
          </div>
          <AnimatePresence>
            {activeEntries.map(entry => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onEdit={e => setModal({ entry: e })}
                onDelete={setDeleteId}
              />
            ))}
          </AnimatePresence>
          <button
            onClick={() => setModal({})}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 w-full pt-2 border-t border-dashed border-gray-200 transition-colors"
          >
            <Plus size={13} /> Tambah sesi baru
          </button>
        </div>
      )}

      {modal !== null && (
        <EntryModal
          entry={modal.entry}
          activeMajlis={activeTab}
          onClose={() => setModal(null)}
          onSave={data => saveMutation.mutate({ id: modal.entry?.id ?? null, data })}
        />
      )}

      {deleteId && (
        <DeleteConfirm onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
