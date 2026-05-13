import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, CheckCircle, XCircle, HelpCircle, MessageSquare, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../utils/api'

const RESPONSE_LABEL = { ATTENDING: 'Hadir', NOT_ATTENDING: 'Tidak Hadir', MAYBE: 'Mungkin' }
const RESPONSE_CLS = {
  ATTENDING: 'bg-emerald-100 text-emerald-700',
  NOT_ATTENDING: 'bg-red-100 text-red-700',
  MAYBE: 'bg-amber-100 text-amber-700',
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ResponseBadge({ response }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESPONSE_CLS[response] || 'bg-gray-100 text-gray-600'}`}>
      {RESPONSE_LABEL[response] || response}
    </span>
  )
}

function RSVPTable({ responses }) {
  const [expanded, setExpanded] = useState(null)

  if (!responses.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Users size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">Belum ada respons RSVP lagi.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left">
            <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Nama</th>
            <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">No. Tel</th>
            <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Respons</th>
            <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Pax</th>
            <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Pilihan Makan</th>
            <th className="pb-3 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Tarikh</th>
            <th className="pb-3 font-medium text-gray-500 text-xs uppercase tracking-wide"></th>
          </tr>
        </thead>
        <tbody>
          {responses.map(r => (
            <>
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 pr-4 font-medium text-gray-900">{r.guest_name}</td>
                <td className="py-3 pr-4 text-gray-600">{r.phone || '—'}</td>
                <td className="py-3 pr-4"><ResponseBadge response={r.response} /></td>
                <td className="py-3 pr-4 text-gray-700">{r.pax_count}</td>
                <td className="py-3 pr-4 text-gray-600">{r.meal_preference || '—'}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs">
                  {new Date(r.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-3">
                  {(r.allergies || r.message) && (
                    <button
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expanded === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </td>
              </tr>
              <AnimatePresence>
                {expanded === r.id && (
                  <motion.tr
                    key={`${r.id}-exp`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="pb-3 pt-0 px-2">
                      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                        {r.allergies && <p><span className="font-medium text-gray-700">Alahan:</span> {r.allergies}</p>}
                        {r.message && <p><span className="font-medium text-gray-700">Mesej:</span> {r.message}</p>}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GuestbookSection({ wid }) {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('ALL')

  const { data: entries = [] } = useQuery(
    ['guestbook-admin', wid],
    () => api.get(`/weddings/${wid}/invitation/guestbook`).then(r => r.data),
    { enabled: !!wid },
  )

  const approveMutation = useMutation(
    (id) => api.patch(`/weddings/${wid}/invitation/guestbook/${id}/approve`),
    {
      onMutate: async (id) => {
        await qc.cancelQueries(['guestbook-admin', wid])
        const prev = qc.getQueryData(['guestbook-admin', wid])
        qc.setQueryData(['guestbook-admin', wid], old => old.map(e => e.id === id ? { ...e, is_approved: !e.is_approved } : e))
        return { prev }
      },
      onError: (_e, _v, ctx) => qc.setQueryData(['guestbook-admin', wid], ctx.prev),
      onSettled: () => qc.invalidateQueries(['guestbook-admin', wid]),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/invitation/guestbook/${id}`),
    { onSuccess: () => qc.invalidateQueries(['guestbook-admin', wid]) }
  )

  const approvedCount = entries.filter(e => e.is_approved).length
  const pendingCount = entries.filter(e => !e.is_approved).length

  const visible = entries.filter(e => {
    if (filter === 'APPROVED') return e.is_approved
    if (filter === 'PENDING') return !e.is_approved
    return true
  })

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary-600" />
          <h2 className="font-semibold text-gray-900">Buku Tetamu</h2>
        </div>
        <div className="flex gap-1">
          {[['ALL', 'Semua'], ['APPROVED', `Diluluskan (${approvedCount})`], ['PENDING', `Belum (${pendingCount})`]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!visible.length ? (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Tiada ucapan lagi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(e => (
            <motion.div
              key={e.id}
              layout
              className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${e.is_approved ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 bg-gray-50/50'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{e.guest_name}</span>
                  {e.is_approved ? (
                    <span className="text-xs text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Diluluskan</span>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Belum Dilulus</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(e.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 italic">"{e.message}"</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => approveMutation.mutate(e.id)}
                  title={e.is_approved ? 'Batalkan kelulusan' : 'Luluskan'}
                  className={`p-1.5 rounded-lg transition-colors ${e.is_approved ? 'text-emerald-600 hover:bg-emerald-100' : 'text-gray-400 hover:bg-gray-200 hover:text-emerald-600'}`}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(e.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RSVPDashboardPage() {
  const qc = useQueryClient()
  const [responseFilter, setResponseFilter] = useState('ALL')

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wid = weddings[0]?.id

  const { data: invitation } = useQuery(
    ['invitation', wid],
    () => api.get(`/weddings/${wid}/invitation`).then(r => r.data),
    { enabled: !!wid, retry: false },
  )

  const { data: responses = [], isLoading } = useQuery(
    ['rsvp', wid],
    () => api.get(`/weddings/${wid}/invitation/rsvp`).then(r => r.data),
    { enabled: !!wid && !!invitation },
  )

  const attending = responses.filter(r => r.response === 'ATTENDING')
  const notAttending = responses.filter(r => r.response === 'NOT_ATTENDING')
  const maybe = responses.filter(r => r.response === 'MAYBE')
  const totalPax = attending.reduce((sum, r) => sum + r.pax_count, 0)

  const filtered = responses.filter(r => {
    if (responseFilter === 'ALL') return true
    return r.response === responseFilter
  })

  if (!wid || isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="p-6 max-w-md mx-auto mt-20 text-center">
        <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Jemputan</h2>
        <p className="text-sm text-gray-500">Bina e-jemputan dahulu di bahagian E-Invitation untuk mengaktifkan RSVP.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-gray-900">RSVP Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {invitation.enable_rsvp ? 'RSVP sedang aktif.' : 'RSVP tidak aktif — aktifkan di E-Invitation.'}{' '}
          {invitation.rsvp_max_pax ? `Had: ${invitation.rsvp_max_pax} pax.` : ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Jumlah Respons" value={responses.length} color="bg-primary-600" />
        <StatCard
          icon={CheckCircle}
          label="Hadir"
          value={attending.length}
          sub={`${totalPax} pax dijangka`}
          color="bg-emerald-500"
        />
        <StatCard icon={XCircle} label="Tidak Hadir" value={notAttending.length} color="bg-red-400" />
        <StatCard icon={HelpCircle} label="Mungkin" value={maybe.length} color="bg-amber-400" />
      </div>

      {/* RSVP Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary-600" />
            <h2 className="font-semibold text-gray-900">Senarai Respons</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{responses.length}</span>
          </div>
          <div className="flex gap-1">
            {[
              ['ALL', 'Semua'],
              ['ATTENDING', 'Hadir'],
              ['NOT_ATTENDING', 'Tidak Hadir'],
              ['MAYBE', 'Mungkin'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setResponseFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${responseFilter === val ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <RSVPTable responses={filtered} />
      </div>

      {/* Guestbook Moderation */}
      <GuestbookSection wid={wid} />
    </div>
  )
}
