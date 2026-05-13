import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Plus, Search, X, Edit2, Trash2, CheckCircle,
  Phone, Mail, Instagram, Globe, FileCheck, GitCompare, Filter,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS = {
  CATERING:       'Katering',
  PELAMIN:        'Pelamin',
  PHOTOGRAPHY:    'Photography',
  VIDEOGRAPHY:    'Videography',
  MAKEUP:         'MUA / Make Up',
  ATTIRE:         'Baju Sanding',
  DECORATION:     'Dekorasi',
  ENTERTAINMENT:  'Entertainment / DJ',
  TRANSPORTATION: 'Pengangkutan',
  VENUE:          'Venue',
  CAKE:           'Kek Kahwin',
  FLORIST:        'Florist / Bunga',
  OTHER:          'Lain-lain',
}

const STATUS_CONFIG = {
  PROSPECT:     { label: 'Prospect',        cls: 'bg-gray-100 text-gray-600',      dot: 'bg-gray-400' },
  CONTACTED:    { label: 'Contacted',       cls: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  BOOKED:       { label: 'Booked',          cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  DEPOSIT_PAID: { label: 'Deposit Dibayar', cls: 'bg-teal-100 text-teal-700',      dot: 'bg-teal-500' },
  FULLY_PAID:   { label: 'Fully Paid',      cls: 'bg-green-100 text-green-700',    dot: 'bg-green-600' },
  COMPLETED:    { label: 'Completed',       cls: 'bg-primary-100 text-primary-700', dot: 'bg-primary-600' },
  CANCELLED:    { label: 'Cancelled',       cls: 'bg-red-100 text-red-600',        dot: 'bg-red-400' },
}

const CONFIRMED_STATUSES = new Set(['BOOKED', 'DEPOSIT_PAID', 'FULLY_PAID', 'COMPLETED'])

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PROSPECT
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 border-l-4 ${color}`}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function VendorModal({ vendor, onClose, onSave, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: vendor?.name ?? '',
      category: vendor?.category ?? 'CATERING',
      vendor_status: vendor?.vendor_status ?? 'PROSPECT',
      phone: vendor?.phone ?? '',
      email: vendor?.email ?? '',
      instagram: vendor?.instagram ?? '',
      website: vendor?.website ?? '',
      price: vendor?.price ?? '',
      deposit_paid: vendor?.deposit_paid ?? '',
      balance_due: vendor?.balance_due ?? '',
      payment_due_date: vendor?.payment_due_date ?? '',
      contract_signed: vendor?.contract_signed ?? false,
      notes: vendor?.notes ?? '',
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-semibold text-gray-900">{vendor ? 'Edit Vendor' : 'Tambah Vendor'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-5 space-y-5">
          {/* Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nama Vendor <span className="text-red-500">*</span></label>
              <input {...register('name', { required: 'Nama diperlukan' })} className={inputCls} placeholder="Nama syarikat / individu" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Kategori <span className="text-red-500">*</span></label>
              <select {...register('category')} className={inputCls}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select {...register('vendor_status')} className={inputCls}>
              {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Maklumat Hubungan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>No. Telefon</label>
                <input {...register('phone')} className={inputCls} placeholder="+60 12-345 6789" />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input {...register('email')} type="email" className={inputCls} placeholder="vendor@email.com" />
              </div>
              <div>
                <label className={labelCls}>Instagram</label>
                <input {...register('instagram')} className={inputCls} placeholder="@username" />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input {...register('website')} className={inputCls} placeholder="https://…" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kewangan (disimpan secara selamat)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Quotation / Harga (RM)</label>
                <input {...register('price')} className={inputCls} placeholder="5000.00" />
              </div>
              <div>
                <label className={labelCls}>Deposit Dibayar (RM)</label>
                <input {...register('deposit_paid')} className={inputCls} placeholder="1000.00" />
              </div>
              <div>
                <label className={labelCls}>Baki (RM)</label>
                <input {...register('balance_due')} className={inputCls} placeholder="4000.00" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className={labelCls}>Due Date Bayaran</label>
                <input {...register('payment_due_date')} type="date" className={inputCls} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input {...register('contract_signed')} type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-400" />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <FileCheck size={14} className="text-emerald-500" /> Kontrak ditandatangani
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Nota / Remarks</label>
            <textarea {...register('notes')} rows={3} className={`${inputCls} resize-none`} placeholder="Pakej termasuk, syarat, catatan…" />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : vendor ? 'Save Changes' : 'Tambah Vendor'}
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
        <h3 className="font-semibold text-gray-900 mb-1">Padam vendor?</h3>
        <p className="text-sm text-gray-500 mb-5"><strong>{name}</strong> akan dipadamkan.</p>
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

// ─── Compare Panel ────────────────────────────────────────────────────────────

function ComparePanel({ vendors, onClose }) {
  const rows = [
    { label: 'Kategori',  fn: v => CATEGORY_LABELS[v.category] },
    { label: 'Status',    fn: v => STATUS_CONFIG[v.vendor_status]?.label },
    { label: 'Harga',     fn: v => v.price ? `RM ${Number(v.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : '—' },
    { label: 'Deposit',   fn: v => v.deposit_paid ? `RM ${Number(v.deposit_paid).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : '—' },
    { label: 'Baki',      fn: v => v.balance_due ? `RM ${Number(v.balance_due).toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : '—' },
    { label: 'Telefon',   fn: v => v.phone || '—' },
    { label: 'Email',     fn: v => v.email || '—' },
    { label: 'Instagram', fn: v => v.instagram || '—' },
    { label: 'Kontrak',   fn: v => v.contract_signed ? '✅ Ditandatangani' : '❌ Belum' },
    { label: 'Nota',      fn: v => v.notes || '—' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <GitCompare size={18} className="text-primary-600" />
            <h2 className="font-semibold text-gray-900">Bandingkan Vendor</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide w-28">Perkara</th>
                {vendors.map(v => (
                  <th key={v.id} className="px-3 py-2 text-left align-top">
                    <div className="font-semibold text-gray-900">{v.name}</div>
                    <div className="mt-1"><StatusBadge status={v.vendor_status} /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(r => (
                <tr key={r.label} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-500 whitespace-nowrap">{r.label}</td>
                  {vendors.map(v => (
                    <td key={v.id} className="px-3 py-2.5 text-gray-800">{r.fn(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [modalVendor, setModalVendor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [compareIds, setCompareIds] = useState([])
  const [showCompare, setShowCompare] = useState(false)

  const { data: weddings } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings?.[0]
  const weddingId = wedding?.id

  const { data: vendors = [], isLoading } = useQuery(
    ['vendors', weddingId],
    () => api.get(`/weddings/${weddingId}/vendors`).then(r => r.data),
    { enabled: !!weddingId },
  )

  const addMutation = useMutation(
    (data) => api.post(`/weddings/${weddingId}/vendors`, data),
    {
      onSuccess: () => { qc.invalidateQueries(['vendors', weddingId]); qc.invalidateQueries(['stats', weddingId]); toast.success('Vendor ditambah!'); setModalVendor(null) },
      onError: () => toast.error('Gagal tambah vendor'),
    },
  )

  const editMutation = useMutation(
    ({ id, data }) => api.patch(`/weddings/${weddingId}/vendors/${id}`, data),
    {
      onSuccess: () => { qc.invalidateQueries(['vendors', weddingId]); qc.invalidateQueries(['stats', weddingId]); toast.success('Vendor dikemaskini!'); setModalVendor(null) },
      onError: () => toast.error('Gagal kemaskini'),
    },
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${weddingId}/vendors/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['vendors', weddingId]); qc.invalidateQueries(['stats', weddingId]); toast.success('Vendor dipadamkan'); setDeleteTarget(null) },
      onError: () => toast.error('Gagal padam'),
    },
  )

  const statusMutation = useMutation(
    ({ id, vendor_status }) => api.patch(`/weddings/${weddingId}/vendors/${id}`, { vendor_status }),
    { onSuccess: () => { qc.invalidateQueries(['vendors', weddingId]); qc.invalidateQueries(['stats', weddingId]) } },
  )

  const confirmed = vendors.filter(v => CONFIRMED_STATUSES.has(v.vendor_status))
  const totalCategories = Object.keys(CATEGORY_LABELS).length

  const filtered = useMemo(() => {
    return vendors.filter(v => {
      if (tab === 'confirmed' && !CONFIRMED_STATUSES.has(v.vendor_status)) return false
      if (filterCat !== 'ALL' && v.category !== filterCat) return false
      if (filterStatus !== 'ALL' && v.vendor_status !== filterStatus) return false
      if (search) {
        const q = search.toLowerCase()
        return v.name.toLowerCase().includes(q) || (v.phone || '').includes(q) || (v.notes || '').toLowerCase().includes(q)
      }
      return true
    })
  }, [vendors, tab, filterCat, filterStatus, search])

  const toggleCompare = (id) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const compareVendors = vendors.filter(v => compareIds.includes(v.id))

  const handleSave = (data) => {
    const payload = {}
    for (const [k, v] of Object.entries(data)) {
      payload[k] = v === '' ? null : v
    }
    if (modalVendor && modalVendor.id) {
      editMutation.mutate({ id: modalVendor.id, data: payload })
    } else {
      addMutation.mutate(payload)
    }
  }

  const mutLoading = addMutation.isLoading || editMutation.isLoading

  if (!weddingId && !isLoading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
        <p>Sila isikan Wedding Settings dahulu.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-semibold text-gray-900">Vendors</h1>
            <p className="text-sm text-gray-500">Urus semua vendor perkahwinan anda</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {compareIds.length >= 2 && (
            <button
              onClick={() => setShowCompare(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm text-primary-600"
            >
              <GitCompare size={15} /> Bandingkan ({compareIds.length})
            </button>
          )}
          <button onClick={() => setModalVendor(false)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={15} /> Tambah Vendor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Jumlah Vendor" value={vendors.length} color="border-violet-400" />
        <StatCard label="Confirmed" value={confirmed.length} color="border-emerald-400" />
        <StatCard label="Kategori Confirmed" value={`${new Set(confirmed.map(v => v.category)).size} / ${totalCategories}`} color="border-primary-400" />
        <StatCard label="Prospect / Contacted" value={vendors.filter(v => v.vendor_status === 'PROSPECT' || v.vendor_status === 'CONTACTED').length} color="border-amber-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[['all', 'Semua'], ['confirmed', 'Confirmed']].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {lbl}
            {val === 'confirmed' && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                {confirmed.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama vendor…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={13} /></button>}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="ALL">Semua Kategori</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <option value="ALL">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
        {(filterCat !== 'ALL' || filterStatus !== 'ALL' || search) && (
          <button onClick={() => { setSearch(''); setFilterCat('ALL'); setFilterStatus('ALL') }} className="text-xs text-primary-600 hover:underline">
            Clear filters
          </button>
        )}
        {compareIds.length > 0 && (
          <button onClick={() => setCompareIds([])} className="text-xs text-gray-400 hover:text-red-500 ml-auto">
            Batal compare ({compareIds.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Memuatkan…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">
              {vendors.length === 0 ? 'Belum ada vendor. Tambah vendor pertama anda!' : 'Tiada vendor sepadan.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="w-10 px-3 py-3 text-xs text-gray-400 font-medium">≡</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Harga</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Hubungan</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Kontrak</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((v, i) => {
                  const isSelected = compareIds.includes(v.id)
                  return (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`transition-colors ${isSelected ? 'bg-primary-50/40' : 'hover:bg-gray-50/50'}`}
                    >
                      {/* Compare checkbox */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(v.id)}
                          disabled={!isSelected && compareIds.length >= 3}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-400 disabled:opacity-30"
                          title="Pilih untuk bandingkan (max 3)"
                        />
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 max-w-[180px] truncate">{v.name}</div>
                        {v.notes && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{v.notes}</p>}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {CATEGORY_LABELS[v.category]}
                        </span>
                      </td>

                      {/* Status — inline select */}
                      <td className="px-4 py-3">
                        <select
                          value={v.vendor_status}
                          onChange={e => statusMutation.mutate({ id: v.id, vendor_status: e.target.value })}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 ${STATUS_CONFIG[v.vendor_status]?.cls}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 hidden md:table-cell font-medium text-gray-700">
                        {v.price
                          ? `RM ${Number(v.price).toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
                          : <span className="text-gray-300">—</span>
                        }
                      </td>

                      {/* Contact icons */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          {v.phone && (
                            <a href={`tel:${v.phone}`} className="text-gray-400 hover:text-gray-700" title={v.phone}>
                              <Phone size={14} />
                            </a>
                          )}
                          {v.email && (
                            <a href={`mailto:${v.email}`} className="text-gray-400 hover:text-gray-700" title={v.email}>
                              <Mail size={14} />
                            </a>
                          )}
                          {v.instagram && (
                            <a href={`https://instagram.com/${v.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500" title={v.instagram}>
                              <Instagram size={14} />
                            </a>
                          )}
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500" title={v.website}>
                              <Globe size={14} />
                            </a>
                          )}
                          {!v.phone && !v.email && !v.instagram && !v.website && <span className="text-gray-300">—</span>}
                        </div>
                      </td>

                      {/* Contract */}
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {v.contract_signed
                          ? <CheckCircle size={16} className="mx-auto text-emerald-500" />
                          : <span className="text-gray-200">—</span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setModalVendor(v)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/40 text-xs text-gray-400">
              Menunjukkan {filtered.length} daripada {vendors.length} vendor
              {compareIds.length > 0 && ` · ${compareIds.length} dipilih untuk bandingkan`}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalVendor !== null && (
          <VendorModal
            vendor={modalVendor || null}
            onClose={() => setModalVendor(null)}
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
        {showCompare && compareVendors.length >= 2 && (
          <ComparePanel vendors={compareVendors} onClose={() => setShowCompare(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
