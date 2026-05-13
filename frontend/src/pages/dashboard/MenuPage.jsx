import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UtensilsCrossed, Plus, X, Trash2, Edit2,
  CheckCircle2, Circle, Leaf, Filter,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'MAIN_COURSE', label: 'Hidangan Utama',   malay: 'Nasi & Lauk Utama',  cls: 'bg-orange-100 text-orange-700',  border: 'border-orange-200' },
  { key: 'SIDE_DISH',   label: 'Lauk Pauk',        malay: 'Lauk pelengkap',      cls: 'bg-amber-100 text-amber-700',    border: 'border-amber-200' },
  { key: 'APPETIZER',   label: 'Pembuka Selera',   malay: 'Appetizer & starters', cls: 'bg-lime-100 text-lime-700',      border: 'border-lime-200' },
  { key: 'DESSERT',     label: 'Pencuci Mulut',    malay: 'Kek & kuih',          cls: 'bg-pink-100 text-pink-700',      border: 'border-pink-200' },
  { key: 'BEVERAGE',    label: 'Minuman',          malay: 'Air & minuman',       cls: 'bg-blue-100 text-blue-700',      border: 'border-blue-200' },
  { key: 'OTHER',       label: 'Lain-lain',        malay: '',                    cls: 'bg-gray-100 text-gray-600',      border: 'border-gray-200' },
]

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]))

const MODES = [
  { key: 'CATERER', label: 'Katering',  sub: 'Menu diuruskan oleh pihak katering' },
  { key: 'REWANG',  label: 'Rewang',    sub: 'Masak sendiri — rekod kuantiti setiap hidangan' },
]

// ─── Menu Item Card ───────────────────────────────────────────────────────────

function MenuCard({ item, onEdit, onDelete, onToggleConfirm, showQty }) {
  const catCfg = CAT_MAP[item.category] ?? CAT_MAP.OTHER

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      className={`bg-white rounded-xl border shadow-sm p-3 group transition-all ${item.is_confirmed ? 'border-emerald-200' : 'border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggleConfirm(item.id, !item.is_confirmed)} className="mt-0.5 flex-shrink-0 transition-colors">
          {item.is_confirmed
            ? <CheckCircle2 size={18} className="text-emerald-500" />
            : <Circle size={18} className="text-gray-300 hover:text-primary-400" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${item.is_confirmed ? 'text-gray-700' : 'text-gray-800'}`}>
            {item.item_name}
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {item.is_vegetarian && (
              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                <Leaf size={10} /> Vegetarian
              </span>
            )}
            {showQty && item.quantity && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{item.quantity}</span>
            )}
            {item.notes && (
              <span className="text-xs text-gray-400 truncate">{item.notes}</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Item Modal ───────────────────────────────────────────────────────────────

function ItemModal({ item, defaultCategory, mode, onClose, onSave }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      item_name:      item?.item_name    ?? '',
      category:       item?.category     ?? defaultCategory ?? 'MAIN_COURSE',
      is_vegetarian:  item?.is_vegetarian ?? false,
      is_halal:       item?.is_halal      ?? true,
      is_confirmed:   item?.is_confirmed  ?? false,
      quantity:       item?.quantity      ?? '',
      notes:          item?.notes         ?? '',
    },
  })

  function onSubmit(data) {
    onSave({
      ...data,
      quantity: data.quantity || null,
      notes:    data.notes    || null,
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
            <h2 className="text-lg font-semibold text-gray-900">{item ? 'Edit Hidangan' : 'Tambah Hidangan'}</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Hidangan *</label>
              <input {...register('item_name', { required: 'Nama diperlukan' })} className="input-field w-full"
                placeholder="cth: Nasi Minyak, Rendang Daging, Air Sirap Bandung" />
              {errors.item_name && <p className="text-xs text-red-500 mt-1">{errors.item_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select {...register('category')} className="input-field w-full">
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>

            {mode === 'REWANG' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kuantiti</label>
                <input {...register('quantity')} className="input-field w-full" placeholder="cth: 50 kg, 200 pinggan, 10 periuk" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <input {...register('notes')} className="input-field w-full" placeholder="cth: Pedas sederhana, alergen kacang..." />
            </div>

            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_vegetarian')} className="rounded" />
                <span className="text-sm text-gray-700 flex items-center gap-1"><Leaf size={13} className="text-emerald-500" /> Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_halal')} className="rounded" />
                <span className="text-sm text-gray-700">Halal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_confirmed')} className="rounded" />
                <span className="text-sm text-gray-700">Disahkan</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
              <button type="submit" className="btn-primary flex-1">{item ? 'Simpan' : 'Tambah'}</button>
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
          <p className="font-semibold text-gray-900 mb-1">Padam hidangan ini?</p>
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

export default function MenuPage() {
  const qc = useQueryClient()
  const [mode, setMode] = useState('CATERER')
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL')

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  const { data: items = [], isLoading } = useQuery(
    ['menu', wid],
    () => api.get(`/weddings/${wid}/menu`).then(r => r.data),
    { enabled: !!wid },
  )

  const saveMutation = useMutation(
    ({ id, data }) => id
      ? api.patch(`/weddings/${wid}/menu/${id}`, data)
      : api.post(`/weddings/${wid}/menu`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['menu', wid])
        setModal(null)
        toast.success(modal?.item ? 'Dikemaskini' : 'Hidangan ditambah!')
      },
      onError: () => toast.error('Gagal simpan'),
    }
  )

  const confirmMutation = useMutation(
    ({ id, is_confirmed }) => api.patch(`/weddings/${wid}/menu/${id}`, { is_confirmed }),
    {
      onMutate: async ({ id, is_confirmed }) => {
        await qc.cancelQueries(['menu', wid])
        const prev = qc.getQueryData(['menu', wid])
        qc.setQueryData(['menu', wid], old => old.map(i => i.id === id ? { ...i, is_confirmed } : i))
        return { prev }
      },
      onError: (_e, _v, ctx) => qc.setQueryData(['menu', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['menu', wid]),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/menu/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['menu', wid]); setDeleteId(null); toast.success('Dipadam') },
      onError: () => toast.error('Gagal padam'),
    }
  )

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return items
    if (activeTab === 'CONFIRMED') return items.filter(i => i.is_confirmed)
    if (activeTab === 'PENDING') return items.filter(i => !i.is_confirmed)
    return items.filter(i => i.category === activeTab)
  }, [items, activeTab])

  // Group by category for display
  const grouped = useMemo(() => {
    const map = new Map()
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category).push(item)
    }
    return map
  }, [filtered])

  const confirmed = items.filter(i => i.is_confirmed).length
  const total = items.length

  // Category tabs: only show categories that have items
  const catCounts = useMemo(() => {
    const c = { ALL: items.length, CONFIRMED: confirmed, PENDING: total - confirmed }
    for (const i of items) c[i.category] = (c[i.category] ?? 0) + 1
    return c
  }, [items, confirmed, total])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Menu Majlis</h1>
          <p className="text-sm text-gray-500 mt-0.5">Senarai hidangan untuk majlis perkahwinan</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Hidangan
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="flex bg-white rounded-xl p-1 gap-1 shadow-sm border border-gray-100">
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === m.key ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">{MODES.find(m => m.key === mode)?.sub}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Jumlah Hidangan', val: total, cls: 'border-l-primary-400' },
          { label: 'Disahkan',        val: confirmed, cls: 'border-l-emerald-400' },
          { label: 'Belum Pasti',     val: total - confirmed, cls: 'border-l-amber-400' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 border-l-4 ${s.cls}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'ALL', label: 'Semua' },
          { key: 'CONFIRMED', label: '✓ Disahkan' },
          { key: 'PENDING', label: 'Belum Pasti' },
          ...CATEGORIES,
        ].map(tab => {
          const count = catCounts[tab.key] ?? 0
          if (!['ALL', 'CONFIRMED', 'PENDING'].includes(tab.key) && count === 0) return null
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              }`}>
              {tab.label}
              <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Menu list */}
      {isLoading ? (
        <p className="text-center py-12 text-gray-400">Memuatkan...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Tiada hidangan lagi</p>
          <p className="text-sm mt-1">Tambah hidangan seperti Nasi Minyak, Rendang, Kuih Muih...</p>
          <button onClick={() => setModal({})} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={15} /> Tambah Hidangan
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {[...grouped.entries()].map(([cat, catItems]) => {
            const catCfg = CAT_MAP[cat] ?? CAT_MAP.OTHER
            return (
              <div key={cat}>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 ${catCfg.cls}`}>
                  {catCfg.label}
                  <span className="opacity-60">{catItems.length}</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {catItems.map(item => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        showQty={mode === 'REWANG'}
                        onEdit={i => setModal({ item: i })}
                        onDelete={setDeleteId}
                        onToggleConfirm={(id, val) => confirmMutation.mutate({ id, is_confirmed: val })}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <button onClick={() => setModal({ defaultCategory: cat })}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 mt-2 pt-2 border-t border-dashed border-gray-100 w-full transition-colors">
                  <Plus size={13} /> Tambah ke {catCfg.label}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {modal !== null && (
        <ItemModal
          item={modal.item}
          defaultCategory={modal.defaultCategory}
          mode={mode}
          onClose={() => setModal(null)}
          onSave={data => saveMutation.mutate({ id: modal.item?.id ?? null, data })}
        />
      )}

      {deleteId && (
        <DeleteConfirm onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  )
}
