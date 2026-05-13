import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gift, Plus, X, Trash2, Edit2, AlertTriangle,
  CheckCircle2, ShoppingBag, Sparkles, Package,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDES = [
  { key: 'LELAKI',    label: 'Dari Pihak Lelaki',    sub: 'ke Pihak Perempuan', color: 'border-blue-200',  dot: 'bg-blue-500',  badge: 'bg-blue-50 text-blue-700' },
  { key: 'PEREMPUAN', label: 'Dari Pihak Perempuan', sub: 'ke Pihak Lelaki',    color: 'border-blush-200', dot: 'bg-blush-400', badge: 'bg-blush-50 text-blush-600' },
]

const CATEGORIES = {
  WANG_HANTARAN: { label: 'Wang Hantaran', cls: 'bg-emerald-100 text-emerald-700' },
  MAS_KAHWIN:    { label: 'Mas Kahwin',    cls: 'bg-amber-100 text-amber-700' },
  BARANG_KEMAS:  { label: 'Barang Kemas',  cls: 'bg-yellow-100 text-yellow-700' },
  PAKAIAN:       { label: 'Pakaian',       cls: 'bg-violet-100 text-violet-700' },
  KOSMETIK:      { label: 'Kosmetik',      cls: 'bg-pink-100 text-pink-700' },
  MAKANAN:       { label: 'Makanan',       cls: 'bg-orange-100 text-orange-700' },
  AKSESORI:      { label: 'Aksesori',      cls: 'bg-cyan-100 text-cyan-700' },
  LAIN_LAIN:     { label: 'Lain-lain',     cls: 'bg-gray-100 text-gray-600' },
}

const STATUSES = {
  BELUM_BELI:  { label: 'Belum Beli',  cls: 'bg-gray-100 text-gray-500',      Icon: ShoppingBag },
  DAH_BELI:    { label: 'Dah Beli',    cls: 'bg-blue-100 text-blue-700',       Icon: Package },
  SUDAH_GUBAH: { label: 'Sudah Gubah', cls: 'bg-amber-100 text-amber-700',     Icon: Sparkles },
  SIAP:        { label: 'Siap ✓',      cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
}

function fmt(val) {
  if (!val) return ''
  return `RM ${Number(val).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ item, onEdit, onDelete, onStatusChange }) {
  const catCfg = CATEGORIES[item.category] ?? CATEGORIES.LAIN_LAIN
  const statusCfg = STATUSES[item.item_status] ?? STATUSES.BELUM_BELI
  const { Icon } = statusCfg

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catCfg.cls}`}>{catCfg.label}</span>
            {item.dulang_number && (
              <span className="text-xs text-gray-400 font-medium">Dulang {item.dulang_number}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-800">{item.name}</p>
          {item.estimated_cost && <p className="text-xs text-gray-500 mt-0.5">{fmt(item.estimated_cost)}</p>}
          {item.notes && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.notes}</p>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(item.id)} className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
      <div className="mt-2 flex gap-1 flex-wrap">
        {Object.entries(STATUSES).map(([key, cfg]) => {
          const { Icon: BtnIcon } = cfg
          return (
            <button key={key} onClick={() => onStatusChange(item.id, key)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${
                item.item_status === key ? `${cfg.cls} border-transparent font-semibold` : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
              }`}>
              <BtnIcon size={10} /> {cfg.label}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Item Modal ───────────────────────────────────────────────────────────────

function ItemModal({ item, defaultSide, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      side:           item?.side           ?? defaultSide ?? 'LELAKI',
      name:           item?.name           ?? '',
      category:       item?.category       ?? 'LAIN_LAIN',
      dulang_number:  item?.dulang_number  ?? '',
      item_status:    item?.item_status    ?? 'BELUM_BELI',
      estimated_cost: item?.estimated_cost ?? '',
      notes:          item?.notes          ?? '',
    },
  })

  function onSubmit(data) {
    onSave({
      ...data,
      dulang_number:  data.dulang_number  ? Number(data.dulang_number)  : null,
      estimated_cost: data.estimated_cost ? Number(data.estimated_cost) : null,
      notes:          data.notes || null,
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
            <h2 className="text-lg font-semibold text-gray-900">{item ? 'Edit Item' : 'Tambah Hantaran'}</h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Pihak</label>
              <select {...register('side')} className="input-field w-full">
                {SIDES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang *</label>
              <input {...register('name', { required: 'Nama diperlukan' })} className="input-field w-full" placeholder="cth: Cincin Berlian, Baju Kurung Songket" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select {...register('category')} className="input-field w-full">
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Dulang</label>
                <input type="number" min="1" {...register('dulang_number')} className="input-field w-full" placeholder="1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('item_status')} className="input-field w-full">
                {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anggaran Kos (RM)</label>
              <input type="number" step="0.01" min="0" {...register('estimated_cost')} className="input-field w-full" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
              <textarea {...register('notes')} className="input-field w-full resize-none" rows={2} placeholder="cth: Beli di Habib Jewels..." />
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
          <p className="font-semibold text-gray-900 mb-1">Padam item ini?</p>
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

// ─── Side Panel ───────────────────────────────────────────────────────────────

function SidePanel({ sideCfg, items, onAdd, onEdit, onDelete, onStatusChange }) {
  const dulangNums = new Set(items.filter(i => i.dulang_number).map(i => i.dulang_number))
  const dulangCount = dulangNums.size
  const isOdd = dulangCount === 0 || dulangCount % 2 !== 0
  const totalCost = items.reduce((sum, i) => sum + (Number(i.estimated_cost) || 0), 0)
  const siap = items.filter(i => i.item_status === 'SIAP').length

  const grouped = useMemo(() => {
    const withDulang = new Map()
    const noDulang = []
    for (const item of items) {
      if (item.dulang_number) {
        if (!withDulang.has(item.dulang_number)) withDulang.set(item.dulang_number, [])
        withDulang.get(item.dulang_number).push(item)
      } else {
        noDulang.push(item)
      }
    }
    return { withDulang: [...withDulang.entries()].sort(([a], [b]) => a - b), noDulang }
  }, [items])

  return (
    <div className={`rounded-2xl border-2 ${sideCfg.color} p-5 space-y-4`}>
      <div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${sideCfg.dot}`} />
          <h3 className="font-semibold text-gray-800">{sideCfg.label}</h3>
        </div>
        <p className="text-xs text-gray-400 ml-5">{sideCfg.sub}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { val: items.length, lbl: 'Item' },
          { val: dulangCount, lbl: 'Dulang', warn: dulangCount > 0 && !isOdd },
          { val: siap, lbl: 'Siap', green: true },
        ].map(s => (
          <div key={s.lbl} className="bg-white rounded-xl p-2.5 text-center border border-gray-100 relative">
            <p className={`text-lg font-bold ${s.green ? 'text-emerald-600' : s.warn ? 'text-amber-600' : 'text-gray-900'}`}>{s.val}</p>
            <p className="text-xs text-gray-400">{s.lbl}</p>
            {s.warn && <AlertTriangle size={12} className="text-amber-500 absolute -top-1 -right-1" />}
          </div>
        ))}
      </div>

      {dulangCount > 0 && !isOdd && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Bilangan dulang ({dulangCount}) adalah genap — tradisi adat: gunakan nombor ganjil
          </p>
        </div>
      )}

      {totalCost > 0 && (
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-0.5">Anggaran Kos Keseluruhan</p>
          <p className="text-base font-bold text-gray-800">{fmt(totalCost)}</p>
        </div>
      )}

      {grouped.withDulang.map(([num, dulangItems]) => (
        <div key={num}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dulang {num}</p>
          <div className="space-y-2">
            <AnimatePresence>
              {dulangItems.map(item => (
                <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {grouped.noDulang.length > 0 && (
        <div>
          {grouped.withDulang.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tiada Dulang</p>}
          <div className="space-y-2">
            <AnimatePresence>
              {grouped.noDulang.map(item => (
                <ItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {items.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Tiada item lagi</p>}

      <button onClick={() => onAdd(sideCfg.key)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 w-full pt-3 border-t border-dashed border-gray-200 transition-colors">
        <Plus size={13} /> Tambah item
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HantaranPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  const { data: items = [], isLoading } = useQuery(
    ['hantaran', wid],
    () => api.get(`/weddings/${wid}/hantaran`).then(r => r.data),
    { enabled: !!wid },
  )

  const saveMutation = useMutation(
    ({ id, data }) => id
      ? api.patch(`/weddings/${wid}/hantaran/${id}`, data)
      : api.post(`/weddings/${wid}/hantaran`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['hantaran', wid])
        setModal(null)
        toast.success(modal?.item ? 'Dikemaskini' : 'Item ditambah!')
      },
      onError: () => toast.error('Gagal simpan'),
    }
  )

  const statusMutation = useMutation(
    ({ id, item_status }) => api.patch(`/weddings/${wid}/hantaran/${id}`, { item_status }),
    {
      onMutate: async ({ id, item_status }) => {
        await qc.cancelQueries(['hantaran', wid])
        const prev = qc.getQueryData(['hantaran', wid])
        qc.setQueryData(['hantaran', wid], old => old.map(i => i.id === id ? { ...i, item_status } : i))
        return { prev }
      },
      onError: (_e, _v, ctx) => qc.setQueryData(['hantaran', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['hantaran', wid]),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/hantaran/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['hantaran', wid]); setDeleteId(null); toast.success('Dipadam') },
      onError: () => toast.error('Gagal padam'),
    }
  )

  const lelakiItems = useMemo(() => items.filter(i => i.side === 'LELAKI'), [items])
  const perempuanItems = useMemo(() => items.filter(i => i.side === 'PEREMPUAN'), [items])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Hantaran Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track barang dulang kedua-dua pihak</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Item
        </button>
      </div>

      {isLoading ? (
        <p className="text-center py-16 text-gray-400">Memuatkan...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SIDES.map(sideCfg => (
            <SidePanel
              key={sideCfg.key}
              sideCfg={sideCfg}
              items={sideCfg.key === 'LELAKI' ? lelakiItems : perempuanItems}
              onAdd={(side) => setModal({ defaultSide: side })}
              onEdit={(item) => setModal({ item })}
              onDelete={setDeleteId}
              onStatusChange={(id, item_status) => statusMutation.mutate({ id, item_status })}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <ItemModal
          item={modal.item}
          defaultSide={modal.defaultSide}
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
