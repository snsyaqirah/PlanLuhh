import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, Gift, PackageCheck, Heart, X, Check, Edit2 } from 'lucide-react'
import api from '../../utils/api'

const GIFT_TYPE_LABEL = {
  PHYSICAL: 'Hadiah Fizikal',
  CASH: 'Wang Tunai',
  EWALLET: 'eWallet',
  REGISTRY_ITEM: 'Item Registry',
}
const GIFT_TYPE_COLOR = {
  PHYSICAL: 'bg-violet-100 text-violet-700',
  CASH: 'bg-emerald-100 text-emerald-700',
  EWALLET: 'bg-blue-100 text-blue-700',
  REGISTRY_ITEM: 'bg-primary-100 text-primary-700',
}

function RegistryItemModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || { item_name: '', item_link: '', target_quantity: 1, is_visible: true, notes: '' })
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
          <h3 className="font-semibold text-gray-900">{initial ? 'Edit Item' : 'Tambah Item Registry'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Item *</label>
            <input className="input-field" placeholder="cth. KitchenAid Stand Mixer" value={form.item_name} onChange={e => set('item_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Link (Shopee / Amazon / Lazada)</label>
            <input className="input-field" placeholder="https://..." value={form.item_link || ''} onChange={e => set('item_link', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Kuantiti</label>
            <input type="number" className="input-field" min={1} value={form.target_quantity} onChange={e => set('target_quantity', parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nota</label>
            <input className="input-field" placeholder="Pilihan warna, saiz, dll..." value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_visible" checked={form.is_visible} onChange={e => set('is_visible', e.target.checked)} className="rounded" />
            <label htmlFor="is_visible" className="text-sm text-gray-700">Tunjuk dalam E-Invitation</label>
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

function GiftReceivedModal({ registryItems, onClose, onSave }) {
  const [form, setForm] = useState({
    donor_name: '', description: '', amount: '', gift_type: 'PHYSICAL',
    registry_item_id: null, thank_you_sent: false, notes: '', date_received: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Rekod Hadiah Diterima</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Pemberi</label>
            <input className="input-field" placeholder="cth. Pak Long & Family" value={form.donor_name} onChange={e => set('donor_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Hadiah</label>
            <select className="input-field" value={form.gift_type} onChange={e => set('gift_type', e.target.value)}>
              {Object.entries(GIFT_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Penerangan / Nama Hadiah</label>
            <input className="input-field" placeholder="cth. Blender Philips" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nilai (RM)</label>
            <input className="input-field" placeholder="cth. 250" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>
          {form.gift_type === 'REGISTRY_ITEM' && registryItems.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Item Registry</label>
              <select className="input-field" value={form.registry_item_id || ''} onChange={e => set('registry_item_id', e.target.value || null)}>
                <option value="">— Pilih item —</option>
                {registryItems.map(i => <option key={i.id} value={i.id}>{i.item_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tarikh Terima</label>
            <input type="date" className="input-field" value={form.date_received} onChange={e => set('date_received', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nota</label>
            <input className="input-field" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ty" checked={form.thank_you_sent} onChange={e => set('thank_you_sent', e.target.checked)} className="rounded" />
            <label htmlFor="ty" className="text-sm text-gray-700">Ucapan terima kasih sudah dihantar</label>
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

export default function GiftRegistryPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('registry')
  const [showRegistryModal, setShowRegistryModal] = useState(false)
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  const { data: registry = [] } = useQuery(
    ['gift-registry', wid],
    () => api.get(`/weddings/${wid}/gifts/registry`).then(r => r.data),
    { enabled: !!wid },
  )

  const { data: received = [] } = useQuery(
    ['gifts-received', wid],
    () => api.get(`/weddings/${wid}/gifts/received`).then(r => r.data),
    { enabled: !!wid },
  )

  const createRegistry = useMutation(
    (data) => api.post(`/weddings/${wid}/gifts/registry`, data),
    { onSuccess: () => { qc.invalidateQueries(['gift-registry', wid]); setShowRegistryModal(false) } }
  )

  const updateRegistry = useMutation(
    ({ id, data }) => api.patch(`/weddings/${wid}/gifts/registry/${id}`, data),
    { onSuccess: () => { qc.invalidateQueries(['gift-registry', wid]); setEditingItem(null) } }
  )

  const deleteRegistry = useMutation(
    (id) => api.delete(`/weddings/${wid}/gifts/registry/${id}`),
    { onSuccess: () => qc.invalidateQueries(['gift-registry', wid]) }
  )

  const addGift = useMutation(
    (data) => api.post(`/weddings/${wid}/gifts/received`, data),
    { onSuccess: () => { qc.invalidateQueries(['gifts-received', wid]); setShowGiftModal(false) } }
  )

  const toggleTY = useMutation(
    ({ id, thank_you_sent }) => api.patch(`/weddings/${wid}/gifts/received/${id}`, { thank_you_sent }),
    {
      onMutate: async ({ id, thank_you_sent }) => {
        await qc.cancelQueries(['gifts-received', wid])
        const prev = qc.getQueryData(['gifts-received', wid])
        qc.setQueryData(['gifts-received', wid], old => old.map(g => g.id === id ? { ...g, thank_you_sent } : g))
        return { prev }
      },
      onError: (_e, _v, ctx) => qc.setQueryData(['gifts-received', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['gifts-received', wid]),
    }
  )

  const deleteGift = useMutation(
    (id) => api.delete(`/weddings/${wid}/gifts/received/${id}`),
    { onSuccess: () => qc.invalidateQueries(['gifts-received', wid]) }
  )

  const totalReceived = received.length
  const thankyouDone = received.filter(g => g.thank_you_sent).length
  const totalRegistryClaimed = registry.reduce((s, i) => s + i.claimed_count, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Gift Registry</h1>
          <p className="text-sm text-gray-500 mt-1">Urus senarai hadiah & rekod hadiah diterima.</p>
        </div>
        <button
          onClick={() => tab === 'registry' ? setShowRegistryModal(true) : setShowGiftModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> {tab === 'registry' ? 'Tambah Item' : 'Rekod Hadiah'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{registry.length}</p>
          <p className="text-xs text-gray-500 mt-1">Item Registry</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-emerald-600">{totalReceived}</p>
          <p className="text-xs text-gray-500 mt-1">Hadiah Diterima</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">{totalReceived - thankyouDone}</p>
          <p className="text-xs text-gray-500 mt-1">Thank You Belum Hantar</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[['registry', 'Senarai Registry'], ['received', 'Hadiah Diterima']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${tab === val ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Registry Tab */}
      {tab === 'registry' && (
        <div>
          {registry.length === 0 ? (
            <div className="card text-center py-16">
              <Gift size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500 font-medium mb-1">Belum ada item registry</p>
              <p className="text-sm text-gray-400 mb-4">Tambah item yang anda inginkan sebagai hadiah perkahwinan.</p>
              <button onClick={() => setShowRegistryModal(true)} className="btn-primary mx-auto">
                <Plus size={14} className="inline mr-1" /> Tambah Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {registry.map(item => (
                <motion.div key={item.id} layout className="card group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.item_name}</p>
                      {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingItem(item)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><Edit2 size={13} /></button>
                      <button onClick={() => deleteRegistry.mutate(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Dituntut</span>
                        <span>{item.claimed_count} / {item.target_quantity}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${Math.min((item.claimed_count / item.target_quantity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!item.is_visible && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Tersembunyi</span>}
                      {item.item_link && (
                        <a href={item.item_link} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-primary-600">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received Tab */}
      {tab === 'received' && (
        <div>
          {received.length === 0 ? (
            <div className="card text-center py-16">
              <PackageCheck size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-500 font-medium mb-1">Belum ada hadiah direkod</p>
              <p className="text-sm text-gray-400 mb-4">Rekod semua hadiah yang diterima semasa majlis.</p>
              <button onClick={() => setShowGiftModal(true)} className="btn-primary mx-auto">
                <Plus size={14} className="inline mr-1" /> Rekod Hadiah
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Pemberi</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Penerangan</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Jenis</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Nilai</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Tarikh</th>
                    <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Thank You</th>
                    <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody>
                  {received.map(g => (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 pr-4 font-medium text-gray-900">{g.donor_name || '—'}</td>
                      <td className="py-3 pr-4 text-gray-600">{g.description || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${GIFT_TYPE_COLOR[g.gift_type] || 'bg-gray-100 text-gray-600'}`}>
                          {GIFT_TYPE_LABEL[g.gift_type] || g.gift_type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{g.amount ? `RM ${g.amount}` : '—'}</td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        {g.date_received ? new Date(g.date_received).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => toggleTY.mutate({ id: g.id, thank_you_sent: !g.thank_you_sent })}
                          className={`p-1.5 rounded-lg transition-colors ${g.thank_you_sent ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}
                        >
                          <Check size={14} />
                        </button>
                      </td>
                      <td className="py-3">
                        <button onClick={() => deleteGift.mutate(g.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showRegistryModal && (
          <RegistryItemModal
            onClose={() => setShowRegistryModal(false)}
            onSave={(data) => createRegistry.mutate(data)}
          />
        )}
        {editingItem && (
          <RegistryItemModal
            initial={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={(data) => updateRegistry.mutate({ id: editingItem.id, data })}
          />
        )}
        {showGiftModal && (
          <GiftReceivedModal
            registryItems={registry}
            onClose={() => setShowGiftModal(false)}
            onSave={(data) => addGift.mutate(data)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
