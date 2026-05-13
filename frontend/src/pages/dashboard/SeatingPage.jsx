import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Users, LayoutGrid, AlertTriangle, X, UserMinus } from 'lucide-react'
import api from '../../utils/api'

const RSVP_FILTER = ['ATTENDING', 'PENDING', 'MAYBE']

function TableCard({ table, assignedGuests, onDelete, onUnassign, allUnassigned, onAssign }) {
  const [open, setOpen] = useState(false)
  const pax = assignedGuests.reduce((s, g) => s + (g.pax_count || 1), 0)
  const over = pax > table.capacity

  return (
    <div className={`card border-2 transition-colors ${over ? 'border-red-300' : 'border-transparent'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">
            Meja {table.table_number}
            {table.table_name && <span className="text-gray-500 font-normal ml-1">— {table.table_name}</span>}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-medium ${over ? 'text-red-600' : 'text-gray-500'}`}>
              {pax} / {table.capacity} pax
            </span>
            {over && <AlertTriangle size={12} className="text-red-500" />}
          </div>
        </div>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-400 transition-colors p-1">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Capacity bar */}
      <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-red-400' : 'bg-primary-500'}`}
          style={{ width: `${Math.min((pax / table.capacity) * 100, 100)}%` }}
        />
      </div>

      {/* Assigned guests */}
      <div className="space-y-1 mb-3 min-h-[40px]">
        {assignedGuests.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">Tiada tetamu</p>
        ) : (
          assignedGuests.map(g => (
            <div key={g.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2 py-1.5">
              <span className="text-gray-700 font-medium truncate">{g.name}</span>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <span className="text-gray-400">{g.pax_count || 1} pax</span>
                <button onClick={() => onUnassign(g.id)} className="text-gray-300 hover:text-red-400">
                  <UserMinus size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add guest */}
      {allUnassigned.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="w-full text-xs text-primary-600 hover:text-primary-700 border border-dashed border-primary-300 rounded-lg py-1.5 flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Tambah tetamu
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-20 max-h-48 overflow-y-auto"
              >
                <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
                <p className="text-xs text-gray-500 mb-2 pr-4">Pilih tetamu:</p>
                {allUnassigned.map(g => (
                  <button
                    key={g.id}
                    onClick={() => { onAssign(g.id, table.id); setOpen(false) }}
                    className="w-full text-left text-xs px-2 py-1.5 hover:bg-primary-50 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-gray-800">{g.name}</span>
                    <span className="text-gray-400 ml-2">{g.pax_count || 1} pax</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function AddTableModal({ onClose, onSave, nextNumber }) {
  const [form, setForm] = useState({ table_number: nextNumber, table_name: '', capacity: 10 })
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
          <h3 className="font-semibold text-gray-900">Tambah Meja</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombor Meja</label>
            <input type="number" className="input-field" value={form.table_number} onChange={e => set('table_number', parseInt(e.target.value) || 1)} min={1} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Meja (pilihan)</label>
            <input type="text" className="input-field" placeholder="cth. VIP, Keluarga Lelaki..." value={form.table_name} onChange={e => set('table_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kapasiti (pax)</label>
            <input type="number" className="input-field" value={form.capacity} onChange={e => set('capacity', parseInt(e.target.value) || 10)} min={1} max={50} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button onClick={() => onSave(form)} className="btn-primary flex-1">Simpan</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function SeatingPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [guestFilter, setGuestFilter] = useState('ATTENDING')

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  const { data: tables = [], isLoading: tablesLoading } = useQuery(
    ['seating-tables', wid],
    () => api.get(`/weddings/${wid}/seating-tables`).then(r => r.data),
    { enabled: !!wid },
  )

  const { data: guests = [] } = useQuery(
    ['guests', wid],
    () => api.get(`/weddings/${wid}/guests`).then(r => r.data),
    { enabled: !!wid },
  )

  const createTable = useMutation(
    (data) => api.post(`/weddings/${wid}/seating-tables`, data),
    { onSuccess: () => { qc.invalidateQueries(['seating-tables', wid]); setShowAdd(false) } }
  )

  const deleteTable = useMutation(
    (id) => api.delete(`/weddings/${wid}/seating-tables/${id}`),
    { onSuccess: () => { qc.invalidateQueries(['seating-tables', wid]); qc.invalidateQueries(['guests', wid]) } }
  )

  const assignGuest = useMutation(
    ({ guestId, tableId }) => api.patch(`/weddings/${wid}/guests/${guestId}/assign-table`, null, { params: { table_id: tableId } }),
    { onSuccess: () => qc.invalidateQueries(['guests', wid]) }
  )

  const unassignGuest = useMutation(
    (guestId) => api.patch(`/weddings/${wid}/guests/${guestId}/assign-table`),
    { onSuccess: () => qc.invalidateQueries(['guests', wid]) }
  )

  const filteredGuests = useMemo(() => guests.filter(g => g.rsvp_status === guestFilter), [guests, guestFilter])
  const unassigned = useMemo(() => filteredGuests.filter(g => !g.table_id), [filteredGuests])
  const allUnassigned = useMemo(() => guests.filter(g => !g.table_id), [guests])

  const guestsByTable = useMemo(() => {
    const map = {}
    tables.forEach(t => { map[t.id] = [] })
    guests.forEach(g => { if (g.table_id && map[g.table_id]) map[g.table_id].push(g) })
    return map
  }, [guests, tables])

  const totalCapacity = tables.reduce((s, t) => s + t.capacity, 0)
  const totalAssigned = guests.filter(g => g.table_id).reduce((s, g) => s + (g.pax_count || 1), 0)
  const nextNumber = tables.length ? Math.max(...tables.map(t => t.table_number)) + 1 : 1

  if (!wid || tablesLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Susunan Tempat Duduk</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tables.length} meja · Kapasiti {totalCapacity} pax · {totalAssigned} tetamu ditetapkan
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Tambah Meja
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
          <p className="text-xs text-gray-500 mt-1">Jumlah Meja</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
          <p className="text-xs text-gray-500 mt-1">Kapasiti Total</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{totalAssigned}</p>
          <p className="text-xs text-gray-500 mt-1">Sudah Ditetapkan</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{allUnassigned.length}</p>
          <p className="text-xs text-gray-500 mt-1">Belum Ditetapkan</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tables grid */}
        <div className="flex-1 min-w-0">
          {tables.length === 0 ? (
            <div className="card text-center py-16">
              <LayoutGrid size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500 font-medium mb-1">Belum ada meja</p>
              <p className="text-sm text-gray-400 mb-4">Tambah meja untuk mula susun tempat duduk tetamu.</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary mx-auto">
                <Plus size={14} className="inline mr-1" /> Tambah Meja
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(t => (
                <TableCard
                  key={t.id}
                  table={t}
                  assignedGuests={guestsByTable[t.id] || []}
                  onDelete={() => deleteTable.mutate(t.id)}
                  onUnassign={(guestId) => unassignGuest.mutate(guestId)}
                  allUnassigned={allUnassigned}
                  onAssign={(guestId, tableId) => assignGuest.mutate({ guestId, tableId })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Unassigned sidebar */}
        <div className="w-64 shrink-0">
          <div className="card sticky top-6">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900">Belum Ada Meja</h3>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 mb-3">
              {[['ATTENDING', 'Hadir'], ['PENDING', 'Belum']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setGuestFilter(val)}
                  className={`flex-1 py-1 text-xs rounded-lg font-medium transition-colors ${guestFilter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {unassigned.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                {filteredGuests.length === 0 ? 'Tiada tetamu dalam kategori ini.' : 'Semua tetamu sudah ada meja!'}
              </p>
            ) : (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {unassigned.map(g => (
                  <div key={g.id} className="flex items-center justify-between text-xs bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                    <span className="text-gray-700 font-medium truncate">{g.name}</span>
                    <span className="text-amber-600 ml-1 shrink-0">{g.pax_count || 1}px</span>
                  </div>
                ))}
              </div>
            )}

            {unassigned.length > 0 && (
              <p className="text-xs text-gray-400 text-center mt-2">{unassigned.length} belum ditetapkan</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <AddTableModal
            onClose={() => setShowAdd(false)}
            onSave={(data) => createTable.mutate(data)}
            nextNumber={nextNumber}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
