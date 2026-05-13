import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Plus, X, Trash2, Edit2, Clock,
  MapPin, User, FileText, AlertCircle,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPES = {
  ENGAGEMENT:   { label: 'Pertunangan',          cls: 'bg-blush-100 text-blush-600' },
  REHEARSAL:    { label: 'Latihan / Rehearsal',  cls: 'bg-amber-100 text-amber-700' },
  WEDDING_DAY:  { label: 'Hari Majlis',          cls: 'bg-primary-100 text-primary-700' },
  POST_WEDDING: { label: 'Selepas Majlis',        cls: 'bg-emerald-100 text-emerald-700' },
  OTHER:        { label: 'Lain-lain',            cls: 'bg-gray-100 text-gray-600' },
}

const QUICK_TYPES = [
  'Kursus Pra-Perkahwinan',
  'Pergi Pejabat Agama',
  'Sesi Fitting Baju',
  'Sesi Ukur Cincin',
  'Sesi MUA Trial',
  'Sesi Photo Pre-Wedding',
  'Majlis Akad Nikah',
  'Majlis Sanding Pihak Perempuan',
  'Majlis Sanding Pihak Lelaki',
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PTG' : 'PGI'}`
}

function isPast(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr + 'T23:59:59') < new Date()
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({ event, onEdit, onDelete }) {
  const typeCfg = EVENT_TYPES[event.event_type] ?? EVENT_TYPES.OTHER
  const past = isPast(event.event_date)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 group ${past ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeCfg.cls}`}>
              {typeCfg.label}
            </span>
            {past && (
              <span className="text-xs text-gray-400 italic">Selesai</span>
            )}
          </div>
          <p className="font-semibold text-gray-900">{event.event_name}</p>

          <div className="mt-2 space-y-1">
            {event.event_date && (
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <CalendarDays size={13} className="text-gray-400 flex-shrink-0" />
                {formatDate(event.event_date)}
              </p>
            )}
            {(event.start_time || event.end_time) && (
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400 flex-shrink-0" />
                {formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ''}
              </p>
            )}
            {event.location && (
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                {event.location}
              </p>
            )}
            {event.responsible_person && (
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <User size={13} className="text-gray-400 flex-shrink-0" />
                {event.responsible_person}
              </p>
            )}
            {event.description && (
              <p className="text-xs text-gray-400 flex items-start gap-1.5 mt-1">
                <FileText size={12} className="flex-shrink-0 mt-0.5" />
                {event.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(event)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(event.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Event Modal ──────────────────────────────────────────────────────────────

function EventModal({ event, onClose, onSave }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      event_name: event?.event_name ?? '',
      event_type: event?.event_type ?? 'OTHER',
      event_date: event?.event_date ?? '',
      start_time: event?.start_time ?? '',
      end_time: event?.end_time ?? '',
      location: event?.location ?? '',
      responsible_person: event?.responsible_person ?? '',
      description: event?.description ?? '',
    },
  })

  function onSubmit(data) {
    const clean = { ...data }
    for (const k of ['event_date', 'start_time', 'end_time', 'location', 'responsible_person', 'description']) {
      if (!clean[k]) clean[k] = null
    }
    onSave(clean)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{event ? 'Edit Event' : 'Tambah Event'}</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Event *</label>
              <input {...register('event_name', { required: true })} className="input-field w-full" placeholder="cth: Sesi Fitting Baju" />
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_TYPES.map(qt => (
                  <button key={qt} type="button"
                    onClick={() => setValue('event_name', qt)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600 rounded-full transition-colors">
                    {qt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
              <select {...register('event_type')} className="input-field w-full">
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh</label>
                <input type="date" {...register('event_date')} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mula</label>
                <input type="time" {...register('start_time')} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamat</label>
                <input type="time" {...register('end_time')} className="input-field w-full" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
              <input {...register('location')} className="input-field w-full" placeholder="cth: Klinik Kesihatan Cheras" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggungjawab / PIC</label>
              <input {...register('responsible_person')} className="input-field w-full" placeholder="cth: Pengantin Perempuan" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <textarea {...register('description')} className="input-field w-full resize-none" rows={2} placeholder="Butiran tambahan..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
              <button type="submit" className="btn-primary flex-1">{event ? 'Simpan' : 'Tambah'}</button>
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
          <p className="font-semibold text-gray-900 mb-1">Padam event ini?</p>
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

export default function SchedulePage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  const { data: events = [], isLoading } = useQuery(
    ['schedule', wid],
    () => api.get(`/weddings/${wid}/schedule`).then(r => r.data),
    { enabled: !!wid },
  )

  const saveMutation = useMutation(
    ({ id, data }) => id
      ? api.patch(`/weddings/${wid}/schedule/${id}`, data)
      : api.post(`/weddings/${wid}/schedule`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['schedule', wid])
        setModal(null)
        toast.success(modal?.event ? 'Dikemaskini' : 'Event ditambah!')
      },
      onError: () => toast.error('Gagal simpan'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/schedule/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['schedule', wid]); setDeleteId(null); toast.success('Dipadam') },
      onError: () => toast.error('Gagal padam'),
    }
  )

  const filtered = useMemo(() => {
    if (filter === 'ALL') return events
    return events.filter(e => e.event_type === filter)
  }, [events, filter])

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map()
    for (const e of filtered) {
      const key = e.event_date ?? '__nodate__'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(e)
    }
    return map
  }, [filtered])

  const upcoming = events.filter(e => e.event_date && !isPast(e.event_date)).length
  const past = events.filter(e => isPast(e.event_date)).length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Jadual & Temujanji</h1>
          <p className="text-sm text-gray-500 mt-0.5">Rekod semua appointment dan event pra-majlis</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Jumlah Event', val: events.length, cls: 'border-l-primary-400' },
          { label: 'Akan Datang', val: upcoming, cls: 'border-l-amber-400' },
          { label: 'Selesai', val: past, cls: 'border-l-emerald-400' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 border-l-4 ${s.cls}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[['ALL', 'Semua'], ...Object.entries(EVENT_TYPES).map(([k, v]) => [k, v.label])].map(([k, lbl]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === k ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <p className="text-center py-12 text-gray-400">Memuatkan...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Tiada event lagi</p>
          <button onClick={() => setModal({})} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={15} /> Tambah Event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {dateKey === '__nodate__' ? 'Tarikh belum ditetapkan' : formatDate(dateKey)}
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {dayEvents.map(e => (
                    <EventCard key={e.id} event={e} onEdit={ev => setModal({ event: ev })} onDelete={setDeleteId} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <EventModal
          event={modal.event}
          onClose={() => setModal(null)}
          onSave={data => saveMutation.mutate({ id: modal.event?.id ?? null, data })}
        />
      )}

      {deleteId && (
        <DeleteConfirm onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
