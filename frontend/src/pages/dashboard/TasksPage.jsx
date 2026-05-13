import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, CheckCircle2, Circle, Plus, X, Trash2,
  Edit2, ChevronDown, ChevronUp, Calendar, AlertCircle,
  Clock, Filter,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES = [
  {
    key: 'PHASE_1_RESEARCH',
    label: 'Fasa 1 — Cari & Rancang',
    sub: '6–12 bulan sebelum',
    color: 'border-blue-200',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700',
  },
  {
    key: 'PHASE_2_BOOKING',
    label: 'Fasa 2 — Tempahan',
    sub: '3–6 bulan sebelum',
    color: 'border-violet-200',
    dot: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700',
  },
  {
    key: 'PHASE_3_PREPARATION',
    label: 'Fasa 3 — Persediaan',
    sub: '1–3 bulan sebelum',
    color: 'border-amber-200',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'PHASE_4_FINAL',
    label: 'Fasa 4 — Semakan Akhir',
    sub: '1–4 minggu sebelum',
    color: 'border-orange-200',
    dot: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700',
  },
  {
    key: 'BIG_DAY',
    label: 'Hari Besar',
    sub: 'Hari majlis',
    color: 'border-primary-200',
    dot: 'bg-primary-600',
    badge: 'bg-primary-50 text-primary-700',
  },
  {
    key: 'POST_WEDDING',
    label: 'Selepas Majlis',
    sub: 'Lepas selesai',
    color: 'border-emerald-200',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
  },
]

function dueDateStatus(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 7) return 'soon'
  return 'ok'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ done, total, dotCls }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${dotCls} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-400 w-20 text-right shrink-0">
        {done}/{total} ({pct}%)
      </span>
    </div>
  )
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const dueStatus = dueDateStatus(task.due_date)

  const dueCls = {
    overdue: 'text-red-600',
    today:   'text-amber-600',
    soon:    'text-amber-500',
    ok:      'text-gray-400',
  }[dueStatus] ?? 'text-gray-400'

  const dueIcon = dueStatus === 'overdue' || dueStatus === 'today'
    ? <AlertCircle size={11} />
    : <Calendar size={11} />

  return (
    <div className={`flex items-start gap-3 py-2.5 px-1 group rounded-lg hover:bg-gray-50 transition-colors ${task.is_completed ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(task.id, !task.is_completed)}
        className="mt-0.5 flex-shrink-0 transition-colors"
      >
        {task.is_completed
          ? <CheckCircle2 size={18} className="text-emerald-500" />
          : <Circle size={18} className="text-gray-300 hover:text-primary-400" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
        )}
        {task.due_date && (
          <p className={`text-xs mt-0.5 flex items-center gap-1 ${dueCls}`}>
            {dueIcon}
            {dueStatus === 'overdue' ? 'Terlepas — ' : dueStatus === 'today' ? 'Hari ini — ' : ''}
            {formatDate(task.due_date)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Phase Section ────────────────────────────────────────────────────────────

function PhaseSection({ phase, tasks, filter, onToggle, onEdit, onDelete, onAdd }) {
  const [collapsed, setCollapsed] = useState(false)

  const visible = useMemo(() => {
    const filtered = filter === 'pending'
      ? tasks.filter(t => !t.is_completed)
      : filter === 'done'
      ? tasks.filter(t => t.is_completed)
      : tasks
    return filtered
  }, [tasks, filter])

  const done = tasks.filter(t => t.is_completed).length

  return (
    <div className={`rounded-2xl border-2 ${phase.color} overflow-hidden`}>
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${phase.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{phase.label}</p>
          <p className="text-xs text-gray-400">{phase.sub}</p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar done={done} total={tasks.length} dotCls={phase.dot} />
          {collapsed ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />}
        </div>
      </button>

      {/* Task list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0 border-t border-gray-100 space-y-0.5">
              {visible.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-3">
                  {filter !== 'all' ? 'Tiada item untuk paparan ini' : 'Tiada tugasan lagi'}
                </p>
              )}
              {visible.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              <button
                onClick={() => onAdd(phase.key)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 mt-2 pt-2 border-t border-dashed border-gray-100 w-full transition-colors"
              >
                <Plus size={13} /> Tambah tugasan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

function TaskModal({ task, defaultPhase, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      phase: task?.phase ?? defaultPhase ?? 'PHASE_1_RESEARCH',
      due_date: task?.due_date ?? '',
    },
  })

  function onSubmit(data) {
    onSave({
      ...data,
      description: data.description || null,
      due_date: data.due_date || null,
    })
  }

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
            <h2 className="text-lg font-semibold text-gray-900">
              {task ? 'Edit Tugasan' : 'Tambah Tugasan'}
            </h2>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tugasan *</label>
              <input
                {...register('title', { required: 'Nama diperlukan' })}
                className="input-field w-full"
                placeholder="cth: Tempah photographer"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Huraian (pilihan)</label>
              <textarea
                {...register('description')}
                className="input-field w-full resize-none"
                rows={2}
                placeholder="Butiran tambahan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fasa</label>
              <select {...register('phase')} className="input-field w-full">
                {PHASES.map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1"><Calendar size={13} /> Tarikh akhir (pilihan)</span>
              </label>
              <input
                {...register('due_date')}
                type="date"
                className="input-field w-full"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
              <button type="submit" className="btn-primary flex-1">{task ? 'Simpan' : 'Tambah'}</button>
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
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40"
          onClick={onCancel}
        />
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center"
        >
          <p className="font-semibold text-gray-900 mb-1">Padam tugasan?</p>
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

export default function TasksPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | { task?, defaultPhase? }
  const [deleteId, setDeleteId] = useState(null)
  const [filter, setFilter] = useState('all') // all | pending | done

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings[0]
  const wid = wedding?.id

  const { data: tasks = [], isLoading } = useQuery(
    ['tasks', wid],
    () => api.get(`/weddings/${wid}/tasks`).then(r => r.data),
    { enabled: !!wid },
  )

  const seedMutation = useMutation(
    () => api.post(`/weddings/${wid}/tasks/seed`),
    { onSuccess: () => qc.invalidateQueries(['tasks', wid]) },
  )

  useEffect(() => {
    if (wid && !isLoading && tasks.length === 0) {
      seedMutation.mutate()
    }
  }, [wid, isLoading, tasks.length])

  const toggleMutation = useMutation(
    ({ id, is_completed }) => api.patch(`/weddings/${wid}/tasks/${id}`, { is_completed }),
    {
      onMutate: async ({ id, is_completed }) => {
        await qc.cancelQueries(['tasks', wid])
        const prev = qc.getQueryData(['tasks', wid])
        qc.setQueryData(['tasks', wid], old => old.map(t => t.id === id ? { ...t, is_completed } : t))
        return { prev }
      },
      onError: (_e, _v, ctx) => qc.setQueryData(['tasks', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['tasks', wid]),
    }
  )

  const saveMutation = useMutation(
    ({ id, data }) => id
      ? api.patch(`/weddings/${wid}/tasks/${id}`, data)
      : api.post(`/weddings/${wid}/tasks`, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(['tasks', wid])
        setModal(null)
        toast.success(modal?.task ? 'Tugasan dikemaskini' : 'Tugasan ditambah')
      },
      onError: () => toast.error('Gagal simpan'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/tasks/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['tasks', wid]); setDeleteId(null); toast.success('Tugasan dipadam') },
      onError: () => toast.error('Gagal padam'),
    }
  )

  function handleToggle(id, is_completed) {
    toggleMutation.mutate({ id, is_completed })
  }

  function handleSave(formData) {
    saveMutation.mutate({ id: modal?.task?.id ?? null, data: formData })
  }

  const tasksByPhase = useMemo(() => {
    const map = {}
    for (const p of PHASES) map[p.key] = []
    for (const t of tasks) {
      const key = t.phase ?? 'PHASE_1_RESEARCH'
      if (map[key]) map[key].push(t)
      else map['PHASE_1_RESEARCH'].push(t)
    }
    return map
  }, [tasks])

  const totalDone = tasks.filter(t => t.is_completed).length
  const total = tasks.length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Senarai Semak</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ikut fasa dari mula rancang sampai selesai majlis</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {[['all', 'Semua'], ['pending', 'Belum'], ['done', 'Selesai']].map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === val ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
          <button
            onClick={() => setModal({})}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare size={18} className="text-primary-600" />
          <h2 className="font-semibold text-gray-800">Kemajuan Keseluruhan</h2>
          <span className="ml-auto text-sm font-semibold text-primary-600">{total === 0 ? 0 : Math.round((totalDone / total) * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${total === 0 ? 0 : (totalDone / total) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <span className="text-xs font-medium text-gray-400 shrink-0">{totalDone}/{total}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Memuatkan...</div>
      ) : (
        <div className="space-y-4">
          {PHASES.map(phase => (
            <PhaseSection
              key={phase.key}
              phase={phase}
              tasks={tasksByPhase[phase.key] ?? []}
              filter={filter}
              onToggle={handleToggle}
              onEdit={(task) => setModal({ task })}
              onDelete={(id) => setDeleteId(id)}
              onAdd={(phaseKey) => setModal({ defaultPhase: phaseKey })}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <TaskModal
          task={modal.task}
          defaultPhase={modal.defaultPhase}
          onClose={() => setModal(null)}
          onSave={handleSave}
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
