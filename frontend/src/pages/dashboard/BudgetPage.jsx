import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, Plus, Pencil, Trash2, FileDown, X, Loader2,
  ChevronDown, ChevronUp, TrendingUp, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/utils/api'

const CATEGORIES = [
  'CATERING', 'PELAMIN', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'MAKEUP',
  'ATTIRE', 'DECORATION', 'INVITATION', 'ENTERTAINMENT',
  'TRANSPORTATION', 'VENUE', 'HONEYMOON', 'MISCELLANEOUS',
]

const CATEGORY_LABELS = {
  CATERING: 'Catering',
  PELAMIN: 'Pelamin',
  PHOTOGRAPHY: 'Photography',
  VIDEOGRAPHY: 'Videography',
  MAKEUP: 'Makeup & Beauty',
  ATTIRE: 'Attire & Accessories',
  DECORATION: 'Decoration',
  INVITATION: 'Invitation',
  ENTERTAINMENT: 'Entertainment',
  TRANSPORTATION: 'Transportation',
  VENUE: 'Venue',
  HONEYMOON: 'Honeymoon',
  MISCELLANEOUS: 'Miscellaneous',
}

const CATEGORY_COLORS = {
  CATERING: 'bg-orange-100 text-orange-700',
  PELAMIN: 'bg-pink-100 text-pink-700',
  PHOTOGRAPHY: 'bg-blue-100 text-blue-700',
  VIDEOGRAPHY: 'bg-indigo-100 text-indigo-700',
  MAKEUP: 'bg-rose-100 text-rose-700',
  ATTIRE: 'bg-purple-100 text-purple-700',
  DECORATION: 'bg-emerald-100 text-emerald-700',
  INVITATION: 'bg-teal-100 text-teal-700',
  ENTERTAINMENT: 'bg-yellow-100 text-yellow-700',
  TRANSPORTATION: 'bg-gray-100 text-gray-700',
  VENUE: 'bg-cyan-100 text-cyan-700',
  HONEYMOON: 'bg-fuchsia-100 text-fuchsia-700',
  MISCELLANEOUS: 'bg-slate-100 text-slate-700',
}

const itemSchema = z.object({
  category: z.string().min(1, 'Required'),
  item_name: z.string().min(1, 'Required'),
  estimated_amount: z.string().optional(),
  actual_amount: z.string().optional(),
  paid_amount: z.string().optional(),
  payment_due_date: z.string().optional(),
  notes: z.string().optional(),
})

const fmt = (val) => {
  const n = parseFloat(val)
  if (!val || isNaN(n)) return '—'
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const sumOf = (items, field) =>
  items.reduce((acc, i) => acc + (parseFloat(i[field]) || 0), 0)

function BudgetModal({ open, onClose, initial, weddingId, queryClient }) {
  const isEdit = !!initial
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: initial
      ? {
          category: initial.category,
          item_name: initial.item_name,
          estimated_amount: initial.estimated_amount || '',
          actual_amount: initial.actual_amount || '',
          paid_amount: initial.paid_amount || '',
          payment_due_date: initial.payment_due_date || '',
          notes: initial.notes || '',
        }
      : { category: '', item_name: '', estimated_amount: '', actual_amount: '', paid_amount: '', payment_due_date: '', notes: '' },
  })

  const onSubmit = async (data) => {
    const clean = {
      ...data,
      estimated_amount: data.estimated_amount || undefined,
      actual_amount: data.actual_amount || undefined,
      paid_amount: data.paid_amount || undefined,
      payment_due_date: data.payment_due_date || undefined,
      notes: data.notes || undefined,
    }
    try {
      if (isEdit) {
        await api.patch(`/weddings/${weddingId}/budget/${initial.id}`, clean)
        toast.success('Item updated')
      } else {
        await api.post(`/weddings/${weddingId}/budget`, clean)
        toast.success('Item added')
      }
      queryClient.invalidateQueries(['budget', weddingId])
      reset()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Budget Item' : 'Add Budget Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('category')} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
              <input {...register('item_name')} className="input-field" placeholder="e.g. Nasi Minyak" />
              {errors.item_name && <p className="text-red-500 text-xs mt-1">{errors.item_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated (RM)</label>
              <input {...register('estimated_amount')} type="number" step="0.01" min="0" className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual (RM)</label>
              <input {...register('actual_amount')} type="number" step="0.01" min="0" className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid (RM)</label>
              <input {...register('paid_amount')} type="number" step="0.01" min="0" className="input-field" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due Date</label>
              <input {...register('payment_due_date')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input {...register('notes')} className="input-field" placeholder="Optional notes" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" />Saving...</> : isEdit ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function CategoryGroup({ category, items, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(true)
  const estimated = sumOf(items, 'estimated_amount')
  const actual = sumOf(items, 'actual_amount')
  const paid = sumOf(items, 'paid_amount')

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`badge ${CATEGORY_COLORS[category]}`}>{CATEGORY_LABELS[category]}</span>
          <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-500 hidden sm:block">Est: <span className="text-gray-700 font-medium">{fmt(estimated)}</span></span>
          <span className="text-gray-500 hidden sm:block">Actual: <span className="text-gray-700 font-medium">{fmt(actual)}</span></span>
          <span className="text-emerald-600 hidden sm:block">Paid: <span className="font-medium">{fmt(paid)}</span></span>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Item</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Estimated</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Actual</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Paid</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Due</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className={`border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-primary-50/30 transition-colors`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.item_name}</p>
                      {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(item.estimated_amount)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(item.actual_amount)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">{fmt(item.paid_amount)}</td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">{item.payment_due_date || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => onEdit(item)} className="text-gray-400 hover:text-primary-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function BudgetPage() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [setBudgetOpen, setSetBudgetOpen] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [exporting, setExporting] = useState(null)

  const { data: weddings } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings?.[0]
  const weddingId = wedding?.id

  const { data: items = [], isLoading } = useQuery(
    ['budget', weddingId],
    () => api.get(`/weddings/${weddingId}/budget`).then(r => r.data),
    { enabled: !!weddingId }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${weddingId}/budget/${id}`),
    {
      onSuccess: () => {
        toast.success('Item deleted')
        queryClient.invalidateQueries(['budget', weddingId])
      },
      onError: () => toast.error('Failed to delete'),
    }
  )

  const updateBudgetTotal = useMutation(
    (total) => api.patch(`/weddings/${weddingId}`, { budget_total: total }),
    {
      onSuccess: () => {
        toast.success('Budget ceiling updated')
        queryClient.invalidateQueries('weddings')
        setSetBudgetOpen(false)
      },
      onError: () => toast.error('Failed to update budget'),
    }
  )

  const grouped = useMemo(() => {
    const g = {}
    for (const item of items) {
      if (!g[item.category]) g[item.category] = []
      g[item.category].push(item)
    }
    return g
  }, [items])

  const totalEstimated = sumOf(items, 'estimated_amount')
  const totalActual = sumOf(items, 'actual_amount')
  const totalPaid = sumOf(items, 'paid_amount')
  const budgetCeiling = parseFloat(wedding?.budget_total) || 0
  const remaining = budgetCeiling - totalEstimated
  const usagePercent = budgetCeiling > 0 ? Math.min(100, Math.round((totalEstimated / budgetCeiling) * 100)) : 0
  const isOverBudget = budgetCeiling > 0 && totalEstimated > budgetCeiling

  const handleExport = async (type) => {
    setExporting(type)
    try {
      const res = await api.get(`/weddings/${weddingId}/budget/export/${type}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `budget.${type === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(null)
    }
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setModalOpen(true)
  }

  const handleAddNew = () => {
    setEditItem(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditItem(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wallet className="text-primary-600" size={26} />
          <div>
            <h1 className="text-2xl font-serif text-gray-900">Budget Tracker</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track every ringgit for your big day</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={!!exporting || !weddingId}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {exporting === 'excel' ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting || !weddingId}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {exporting === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            PDF
          </button>
          <button onClick={handleAddNew} disabled={!weddingId} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Budget Ceiling', value: budgetCeiling > 0 ? fmt(budgetCeiling) : 'Not set', action: () => { setBudgetInput(budgetCeiling || ''); setSetBudgetOpen(true) }, color: 'bg-primary-50 text-primary-700', sub: 'Click to edit' },
          { label: 'Total Estimated', value: fmt(totalEstimated), color: 'bg-blue-50 text-blue-700', sub: `${items.length} items` },
          { label: 'Total Actual', value: fmt(totalActual), color: 'bg-amber-50 text-amber-700', sub: 'Confirmed costs' },
          { label: 'Total Paid', value: fmt(totalPaid), color: 'bg-emerald-50 text-emerald-700', sub: `${items.filter(i => i.paid_amount).length} paid` },
        ].map(card => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card cursor-pointer hover:shadow-md transition-shadow ${card.action ? '' : ''}`}
            onClick={card.action}
          >
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color.split(' ')[1]}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Budget Usage Bar */}
      {budgetCeiling > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={isOverBudget ? 'text-red-500' : 'text-primary-600'} />
              <span className="text-sm font-medium text-gray-700">Budget Usage</span>
              {isOverBudget && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle size={12} /> Over by {fmt(totalEstimated - budgetCeiling)}
                </span>
              )}
            </div>
            <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-primary-600'}`}>{usagePercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-3 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-primary-600'}`}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Estimated: {fmt(totalEstimated)}</span>
            <span>Remaining: {fmt(Math.abs(remaining))} {remaining < 0 ? 'over' : 'left'}</span>
          </div>
        </div>
      )}

      {/* Items by Category */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <Wallet className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">No budget items yet</p>
          <p className="text-sm text-gray-400 mt-1">Start adding items to track your wedding budget</p>
          <button onClick={handleAddNew} disabled={!weddingId} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus size={16} /> Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {CATEGORIES.filter(c => grouped[c]).map(category => (
            <CategoryGroup
              key={category}
              category={category}
              items={grouped[category]}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Set Budget Ceiling Modal */}
      <AnimatePresence>
        {setBudgetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Set Budget Ceiling</h2>
                <button onClick={() => setSetBudgetOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (RM)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                className="input-field mb-4"
                placeholder="e.g. 50000"
              />
              <div className="flex gap-3">
                <button onClick={() => setSetBudgetOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={() => updateBudgetTotal.mutate(parseFloat(budgetInput))}
                  disabled={updateBudgetTotal.isLoading || !budgetInput}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {updateBudgetTotal.isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <BudgetModal
            open={modalOpen}
            onClose={handleModalClose}
            initial={editItem}
            weddingId={weddingId}
            queryClient={queryClient}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
