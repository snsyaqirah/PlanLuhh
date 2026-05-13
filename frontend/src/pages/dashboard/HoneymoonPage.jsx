import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Plus, Trash2, Edit2, Check, X, MapPin, Calendar, Wallet } from 'lucide-react'
import api from '../../utils/api'

const CATEGORIES = [
  { value: 'FLIGHT', label: '✈️ Penerbangan' },
  { value: 'HOTEL', label: '🏨 Hotel' },
  { value: 'TRANSPORT', label: '🚗 Transport' },
  { value: 'ACTIVITIES', label: '🎯 Aktiviti' },
  { value: 'FOOD', label: '🍜 Makan' },
  { value: 'SHOPPING', label: '🛍️ Shopping' },
  { value: 'INSURANCE', label: '🛡️ Insurans' },
  { value: 'OTHER', label: '📦 Lain-lain' },
]
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

function TripDetailsCard({ honeymoon, wid, onSaved }) {
  const [editing, setEditing] = useState(!honeymoon)
  const [form, setForm] = useState({
    destination: honeymoon?.destination || '',
    start_date: honeymoon?.start_date || '',
    end_date: honeymoon?.end_date || '',
    budget_total: honeymoon?.budget_total || '',
    notes: honeymoon?.notes || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = useMutation(
    (data) => api.put(`/weddings/${wid}/honeymoon`, data),
    { onSuccess: (res) => { onSaved(res.data); setEditing(false) } }
  )

  if (!editing && honeymoon) {
    return (
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={16} className="text-primary-600" /> Destinasi
          </h2>
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-600 p-1"><Edit2 size={14} /></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Destinasi</p>
            <p className="font-medium text-gray-900">{honeymoon.destination || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Tarikh Pergi</p>
            <p className="font-medium text-gray-900">
              {honeymoon.start_date ? new Date(honeymoon.start_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Tarikh Balik</p>
            <p className="font-medium text-gray-900">
              {honeymoon.end_date ? new Date(honeymoon.end_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Bajet</p>
            <p className="font-medium text-gray-900">{honeymoon.budget_total ? `RM ${honeymoon.budget_total}` : '—'}</p>
          </div>
        </div>
        {honeymoon.notes && <p className="text-sm text-gray-500 mt-3 italic">{honeymoon.notes}</p>}
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <MapPin size={16} className="text-primary-600" /> {honeymoon ? 'Edit' : 'Tetapkan'} Destinasi
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Destinasi</label>
          <input className="input-field" placeholder="cth. Tokyo, Japan" value={form.destination} onChange={e => set('destination', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tarikh Pergi</label>
          <input type="date" className="input-field" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tarikh Balik</label>
          <input type="date" className="input-field" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bajet (RM)</label>
          <input className="input-field" placeholder="5000" value={form.budget_total} onChange={e => set('budget_total', e.target.value)} />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">Nota</label>
        <input className="input-field" placeholder="cth. bulan madu pertama, musim bunga..." value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="flex gap-3">
        {honeymoon && <button onClick={() => setEditing(false)} className="btn-secondary">Batal</button>}
        <button onClick={() => save.mutate(form)} disabled={save.isLoading} className="btn-primary">
          {save.isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}

function AddItemModal({ onClose, onSave }) {
  const [form, setForm] = useState({ category: 'FLIGHT', item_name: '', cost: '', booking_reference: '', notes: '', is_booked: false })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Tambah Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kategori</label>
            <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Item *</label>
            <input className="input-field" placeholder="cth. Tiket AirAsia KUL-NRT" value={form.item_name} onChange={e => set('item_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kos (RM)</label>
            <input className="input-field" placeholder="800" value={form.cost} onChange={e => set('cost', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">No. Tempahan</label>
            <input className="input-field" placeholder="cth. ABCD12" value={form.booking_reference} onChange={e => set('booking_reference', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nota</label>
            <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="booked" checked={form.is_booked} onChange={e => set('is_booked', e.target.checked)} className="rounded" />
            <label htmlFor="booked" className="text-sm text-gray-700">Sudah ditempah</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button onClick={() => form.item_name && onSave(form)} className="btn-primary flex-1">Simpan</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function HoneymoonPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [activeCat, setActiveCat] = useState('ALL')
  const [honeymoon, setHoneymoon] = useState(null)
  const [honeymoonLoaded, setHoneymoonLoaded] = useState(false)

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  useQuery(
    ['honeymoon', wid],
    () => api.get(`/weddings/${wid}/honeymoon`).then(r => r.data),
    {
      enabled: !!wid,
      onSuccess: (data) => { setHoneymoon(data); setHoneymoonLoaded(true) },
      onError: () => setHoneymoonLoaded(true),
      retry: false,
    },
  )

  const { data: items = [] } = useQuery(
    ['honeymoon-items', wid],
    () => api.get(`/weddings/${wid}/honeymoon/items`).then(r => r.data),
    { enabled: !!wid && !!honeymoon },
  )

  const addItem = useMutation(
    (data) => api.post(`/weddings/${wid}/honeymoon/items`, data),
    { onSuccess: () => { qc.invalidateQueries(['honeymoon-items', wid]); setShowAdd(false) } }
  )

  const toggleBooked = useMutation(
    ({ id, is_booked }) => api.patch(`/weddings/${wid}/honeymoon/items/${id}`, { is_booked }),
    {
      onMutate: async ({ id, is_booked }) => {
        await qc.cancelQueries(['honeymoon-items', wid])
        const prev = qc.getQueryData(['honeymoon-items', wid])
        qc.setQueryData(['honeymoon-items', wid], old => old.map(i => i.id === id ? { ...i, is_booked } : i))
        return { prev }
      },
      onError: (_e, _v, ctx) => qc.setQueryData(['honeymoon-items', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['honeymoon-items', wid]),
    }
  )

  const deleteItem = useMutation(
    (id) => api.delete(`/weddings/${wid}/honeymoon/items/${id}`),
    { onSuccess: () => qc.invalidateQueries(['honeymoon-items', wid]) }
  )

  const totalBudget = items.reduce((s, i) => s + (parseFloat(i.cost) || 0), 0)
  const bookedCount = items.filter(i => i.is_booked).length
  const catCounts = useMemo(() => {
    const m = {}
    items.forEach(i => { m[i.category] = (m[i.category] || 0) + 1 })
    return m
  }, [items])

  const filtered = activeCat === 'ALL' ? items : items.filter(i => i.category === activeCat)
  const activeCats = CATEGORIES.filter(c => catCounts[c.value] > 0)

  if (!wid || !honeymoonLoaded) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Honeymoon</h1>
          <p className="text-sm text-gray-500 mt-1">Rancang bulan madu impian bersama.</p>
        </div>
        {honeymoon && (
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Tambah Item
          </button>
        )}
      </div>

      {/* Trip Details */}
      <TripDetailsCard honeymoon={honeymoon} wid={wid} onSaved={setHoneymoon} />

      {/* Stats */}
      {honeymoon && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            <p className="text-xs text-gray-500 mt-1">Jumlah Item</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-emerald-600">{bookedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Sudah Ditempah</p>
          </div>
          <div className="card text-center">
            <p className="text-lg font-bold text-primary-600">RM {totalBudget.toLocaleString('ms-MY', { minimumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500 mt-1">
              Jumlah Kos
              {honeymoon.budget_total && (
                <span className="ml-1 text-gray-400">/ RM {parseFloat(honeymoon.budget_total).toLocaleString('ms-MY', { minimumFractionDigits: 0 })}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      {honeymoon && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setActiveCat('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCat === 'ALL' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Semua ({items.length})
            </button>
            {activeCats.map(c => (
              <button
                key={c.value}
                onClick={() => setActiveCat(c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCat === c.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {c.label} ({catCounts[c.value]})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Plane size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm">
                {items.length === 0 ? 'Belum ada item. Tambah perancangan perjalanan anda.' : 'Tiada item dalam kategori ini.'}
              </p>
              {items.length === 0 && (
                <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 mx-auto">
                  <Plus size={14} className="inline mr-1" /> Tambah Item
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors group ${item.is_booked ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}
                >
                  <button
                    onClick={() => toggleBooked.mutate({ id: item.id, is_booked: !item.is_booked })}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.is_booked ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}
                  >
                    {item.is_booked && <Check size={10} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{CAT_MAP[item.category]?.split(' ')[0]}</span>
                      <span className={`font-medium text-sm ${item.is_booked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.item_name}</span>
                    </div>
                    {(item.booking_reference || item.notes) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.booking_reference && <span className="mr-2">📋 {item.booking_reference}</span>}
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {item.cost && <span className="text-sm font-medium text-gray-700">RM {parseFloat(item.cost).toLocaleString()}</span>}
                    <button
                      onClick={() => deleteItem.mutate(item.id)}
                      className="p-1.5 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddItemModal
            onClose={() => setShowAdd(false)}
            onSave={(data) => addItem.mutate(data)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
