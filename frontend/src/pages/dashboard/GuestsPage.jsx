import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Search, Download, X, Edit2, Trash2,
  Crown, ChevronDown, FileText, FileSpreadsheet, Filter,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ───────────────────────────────────────────────────────────────

const RSVP_CONFIG = {
  PENDING:       { label: 'Pending',       cls: 'bg-gray-100 text-gray-600' },
  ATTENDING:     { label: 'Hadir',         cls: 'bg-emerald-100 text-emerald-700' },
  NOT_ATTENDING: { label: 'Tidak Hadir',   cls: 'bg-red-100 text-red-700' },
  MAYBE:         { label: 'Maybe',         cls: 'bg-amber-100 text-amber-700' },
}

const SIDE_CONFIG = {
  GROOM: { label: 'Pihak Lelaki', cls: 'bg-blue-100 text-blue-700' },
  BRIDE: { label: 'Pihak Perempuan', cls: 'bg-blush-100 text-blush-600' },
  BOTH:  { label: 'Kedua-dua', cls: 'bg-violet-100 text-violet-700' },
}

const MEAL_LABELS = {
  NORMAL:      'Normal',
  VEGETARIAN:  'Vegetarian',
  VEGAN:       'Vegan',
  HALAL:       'Halal Only',
  OTHER:       'Other',
}

// ─── Small components ─────────────────────────────────────────────────────────

function Badge({ cfg }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 ${color}`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Guest Modal ──────────────────────────────────────────────────────────────

function GuestModal({ guest, onClose, onSave, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: guest?.name ?? '',
      phone: guest?.phone ?? '',
      email: guest?.email ?? '',
      side: guest?.side ?? 'BOTH',
      pax_count: guest?.pax_count ?? 1,
      rsvp_status: guest?.rsvp_status ?? 'PENDING',
      meal_preference: guest?.meal_preference ?? 'NORMAL',
      allergies: guest?.allergies ?? '',
      notes: guest?.notes ?? '',
      is_vip: guest?.is_vip ?? false,
    },
  })

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{guest ? 'Edit Guest' : 'Add Guest'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Nama Tetamu <span className="text-red-500">*</span></label>
            <input
              {...register('name', { required: 'Nama diperlukan' })}
              className={inputCls}
              placeholder="Ahmad bin Abdullah"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>No. Telefon</label>
              <input {...register('phone')} className={inputCls} placeholder="+60 12-345 6789" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input {...register('email')} type="email" className={inputCls} placeholder="tetamu@email.com" />
            </div>
          </div>

          {/* Side + Pax */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Pihak</label>
              <select {...register('side')} className={inputCls}>
                <option value="GROOM">Pihak Lelaki</option>
                <option value="BRIDE">Pihak Perempuan</option>
                <option value="BOTH">Kedua-dua</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Jangkaan Pax</label>
              <input
                {...register('pax_count', { valueAsNumber: true, min: 1 })}
                type="number"
                min="1"
                className={inputCls}
              />
            </div>
          </div>

          {/* RSVP + Meal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Status RSVP</label>
              <select {...register('rsvp_status')} className={inputCls}>
                <option value="PENDING">Pending</option>
                <option value="ATTENDING">Hadir</option>
                <option value="NOT_ATTENDING">Tidak Hadir</option>
                <option value="MAYBE">Maybe</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Pilihan Makanan</label>
              <select {...register('meal_preference')} className={inputCls}>
                {Object.entries(MEAL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className={labelCls}>Alahan / Pantang</label>
            <input {...register('allergies')} className={inputCls} placeholder="Kacang, seafood…" />
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Nota</label>
            <textarea
              {...register('notes')}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Nota tambahan…"
            />
          </div>

          {/* VIP */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('is_vip')} type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
            <span className="text-sm text-gray-700 flex items-center gap-1">
              <Crown size={13} className="text-amber-500" /> Tetamu VIP
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : guest ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
      >
        <Trash2 size={32} className="mx-auto text-red-400 mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">Padam tetamu?</h3>
        <p className="text-sm text-gray-500 mb-5">
          <strong>{name}</strong> akan dipadamkan. Tindakan ini tidak boleh dibuat alik.
        </p>
        <div className="flex gap-2 justify-center">
          <button onClick={onCancel} className="btn-secondary">Batal</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger">
            {loading ? 'Deleting…' : 'Padam'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GuestsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterSide, setFilterSide] = useState('ALL')
  const [filterRsvp, setFilterRsvp] = useState('ALL')
  const [modalGuest, setModalGuest] = useState(null)   // null=closed, false=new, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null)

  // fetch wedding
  const { data: weddings } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings?.[0]
  const weddingId = wedding?.id

  // fetch guests
  const { data: guests = [], isLoading } = useQuery(
    ['guests', weddingId],
    () => api.get(`/weddings/${weddingId}/guests`).then(r => r.data),
    { enabled: !!weddingId },
  )

  // mutations
  const addMutation = useMutation(
    (data) => api.post(`/weddings/${weddingId}/guests`, data),
    {
      onSuccess: () => { qc.invalidateQueries(['guests', weddingId]); qc.invalidateQueries(['stats', weddingId]); toast.success('Tetamu ditambah!'); setModalGuest(null) },
      onError: () => toast.error('Gagal tambah tetamu'),
    },
  )

  const editMutation = useMutation(
    ({ id, data }) => api.patch(`/weddings/${weddingId}/guests/${id}`, data),
    {
      onSuccess: () => { qc.invalidateQueries(['guests', weddingId]); qc.invalidateQueries(['stats', weddingId]); toast.success('Maklumat dikemaskini!'); setModalGuest(null) },
      onError: () => toast.error('Gagal kemaskini'),
    },
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${weddingId}/guests/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['guests', weddingId]); qc.invalidateQueries(['stats', weddingId]); toast.success('Tetamu dipadamkan'); setDeleteTarget(null) },
      onError: () => toast.error('Gagal padam'),
    },
  )

  const rsvpMutation = useMutation(
    ({ id, rsvp_status }) => api.patch(`/weddings/${weddingId}/guests/${id}`, { rsvp_status }),
    {
      onSuccess: () => { qc.invalidateQueries(['guests', weddingId]); qc.invalidateQueries(['stats', weddingId]) },
      onError: () => toast.error('Gagal kemaskini RSVP'),
    },
  )

  // computed stats
  const totalPax = guests.reduce((s, g) => s + (g.pax_count || 0), 0)
  const attending = guests.filter(g => g.rsvp_status === 'ATTENDING')
  const attendingPax = attending.reduce((s, g) => s + (g.pax_count || 0), 0)
  const notAttending = guests.filter(g => g.rsvp_status === 'NOT_ATTENDING').length
  const pending = guests.filter(g => g.rsvp_status === 'PENDING').length

  // filtered + searched list
  const filtered = useMemo(() => {
    return guests.filter(g => {
      const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.phone || '').includes(search)
      const matchSide = filterSide === 'ALL' || g.side === filterSide
      const matchRsvp = filterRsvp === 'ALL' || g.rsvp_status === filterRsvp
      return matchSearch && matchSide && matchRsvp
    })
  }, [guests, search, filterSide, filterRsvp])

  const handleSave = (data) => {
    const payload = { ...data, pax_count: Number(data.pax_count) }
    if (modalGuest && modalGuest.id) {
      editMutation.mutate({ id: modalGuest.id, data: payload })
    } else {
      addMutation.mutate(payload)
    }
  }

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/weddings/${weddingId}/guests/export/${type}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `senarai_tetamu.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export gagal')
    }
  }

  const mutLoading = addMutation.isLoading || editMutation.isLoading

  if (!weddingId && !isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Users size={40} className="mx-auto mb-3 text-gray-300" />
        <p>Sila isikan Wedding Settings dahulu.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold text-gray-900">Senarai Tetamu</h1>
            <p className="text-sm text-gray-500">Urus dan jejak tetamu jemputan</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('excel')} className="btn-secondary flex items-center gap-1.5 text-sm">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-1.5 text-sm">
            <FileText size={15} /> PDF
          </button>
          <button onClick={() => setModalGuest(false)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={15} /> Tambah Tetamu
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Jangkaan Pax" value={totalPax} sub={`${guests.length} tetamu`} color="border-blue-400" />
        <StatCard label="Hadir" value={attendingPax} sub={`${attending.length} tetamu confirmed`} color="border-emerald-400" />
        <StatCard label="Tidak Hadir" value={notAttending} sub="tetamu" color="border-red-400" />
        <StatCard label="Pending RSVP" value={pending} sub="belum jawab" color="border-amber-400" />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau telefon…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterSide}
            onChange={e => setFilterSide(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="ALL">Semua Pihak</option>
            <option value="GROOM">Pihak Lelaki</option>
            <option value="BRIDE">Pihak Perempuan</option>
            <option value="BOTH">Kedua-dua</option>
          </select>
          <select
            value={filterRsvp}
            onChange={e => setFilterRsvp(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            <option value="ALL">Semua RSVP</option>
            <option value="PENDING">Pending</option>
            <option value="ATTENDING">Hadir</option>
            <option value="NOT_ATTENDING">Tidak Hadir</option>
            <option value="MAYBE">Maybe</option>
          </select>
        </div>
        {(filterSide !== 'ALL' || filterRsvp !== 'ALL' || search) && (
          <button
            onClick={() => { setSearch(''); setFilterSide('ALL'); setFilterRsvp('ALL') }}
            className="text-xs text-primary-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Memuatkan…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Users size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">
              {guests.length === 0 ? 'Belum ada tetamu. Tambah tetamu pertama anda!' : 'Tiada tetamu sepadan dengan carian.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pihak</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pax</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">RSVP</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Telefon</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Makanan</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((g, i) => (
                  <motion.tr
                    key={g.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Name + VIP */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {g.is_vip && <Crown size={13} className="text-amber-500 flex-shrink-0" />}
                        <span className="font-medium text-gray-900 truncate max-w-[180px]">{g.name}</span>
                      </div>
                      {g.notes && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{g.notes}</p>}
                    </td>

                    {/* Side */}
                    <td className="px-4 py-3">
                      <Badge cfg={SIDE_CONFIG[g.side]} />
                    </td>

                    {/* Pax */}
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{g.pax_count}</td>

                    {/* RSVP — inline select */}
                    <td className="px-4 py-3">
                      <select
                        value={g.rsvp_status}
                        onChange={e => rsvpMutation.mutate({ id: g.id, rsvp_status: e.target.value })}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 ${RSVP_CONFIG[g.rsvp_status].cls}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="ATTENDING">Hadir</option>
                        <option value="NOT_ATTENDING">Tidak Hadir</option>
                        <option value="MAYBE">Maybe</option>
                      </select>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {g.phone || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Meal */}
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {g.meal_preference ? MEAL_LABELS[g.meal_preference] : '—'}
                      {g.allergies && <span className="text-xs text-red-400 ml-1">⚠ {g.allergies}</span>}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModalGuest(g)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(g)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Table footer count */}
            <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/40 text-xs text-gray-400">
              Menunjukkan {filtered.length} daripada {guests.length} tetamu
              {filtered.length !== guests.length && ' (ditapis)'}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalGuest !== null && (
          <GuestModal
            guest={modalGuest || null}
            onClose={() => setModalGuest(null)}
            onSave={handleSave}
            loading={mutLoading}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            name={deleteTarget.name}
            onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteMutation.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
