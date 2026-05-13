import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Globe, Eye, Share2, CheckCircle2, Circle,
  Plus, X, Trash2, Edit2, Heart, Image, Phone,
  MessageSquare, QrCode, Gift, Music, Palette,
  Toggle, ExternalLink, Copy, Check,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/utils/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: 'general',   label: 'Tetapan Am',       icon: Palette },
  { key: 'lovestory', label: 'Kisah Cinta',       icon: Heart },
  { key: 'gallery',   label: 'Galeri Foto',       icon: Image },
  { key: 'contacts',  label: 'Hubungi Kami',      icon: Phone },
  { key: 'rsvp',      label: 'RSVP & Tetapan',   icon: CheckCircle2 },
  { key: 'duitnow',   label: 'DuitNow & Hadiah',  icon: QrCode },
  { key: 'message',   label: 'Mesej Khas',        icon: MessageSquare },
]

const THEMES = [
  { key: 'CLASSIC',    label: 'Classic Cream' },
  { key: 'MODERN',     label: 'Modern White' },
  { key: 'FLORAL',     label: 'Floral Rose' },
  { key: 'MINIMALIST', label: 'Minimalist' },
  { key: 'ROYAL',      label: 'Royal Gold' },
]

const LANGUAGES = [
  { key: 'MS',   label: 'Bahasa Melayu' },
  { key: 'EN',   label: 'English' },
  { key: 'DUAL', label: 'Dwibahasa (MS + EN)' },
]

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
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

// ─── Section: General ─────────────────────────────────────────────────────────

function GeneralSection({ inv, wid, onSave }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      theme: inv?.theme ?? 'CLASSIC',
      language: inv?.language ?? 'DUAL',
    },
  })
  useEffect(() => { if (inv) reset({ theme: inv.theme, language: inv.language }) }, [inv])

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(t => (
              <label key={t.key} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <input type="radio" value={t.key} {...register('theme')} className="accent-primary-600" />
                <span className="text-sm text-gray-700">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bahasa</label>
          <div className="space-y-2">
            {LANGUAGES.map(l => (
              <label key={l.key} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <input type="radio" value={l.key} {...register('language')} className="accent-primary-600" />
                <span className="text-sm text-gray-700">{l.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">Simpan Tetapan</button>
      </form>
    </div>
  )
}

// ─── Section: Love Story ──────────────────────────────────────────────────────

function LoveStorySection({ wid }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const { data: entries = [] } = useQuery(
    ['love-story', wid],
    () => api.get(`/weddings/${wid}/invitation/love-story`).then(r => r.data),
    { enabled: !!wid },
  )

  const addMutation = useMutation(
    (data) => api.post(`/weddings/${wid}/invitation/love-story`, data),
    {
      onSuccess: () => { qc.invalidateQueries(['love-story', wid]); setShowForm(false); reset(); toast.success('Ditambah!') },
      onError: () => toast.error('Gagal simpan'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/invitation/love-story/${id}`),
    {
      onSuccess: () => { qc.invalidateQueries(['love-story', wid]); setDeleteId(null); toast.success('Dipadam') },
    }
  )

  function onSubmit(data) {
    addMutation.mutate({ ...data, description: data.description || null, image_url: data.image_url || null, year: data.year || null })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {entries.map((e, idx) => (
          <div key={e.id} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-3 group">
            <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blush-600">{idx + 1}</div>
            <div className="flex-1 min-w-0">
              {e.year && <p className="text-xs text-gray-400 mb-0.5">{e.year}</p>}
              <p className="text-sm font-medium text-gray-800">{e.title}</p>
              {e.description && <p className="text-xs text-gray-500 mt-0.5">{e.description}</p>}
            </div>
            <button onClick={() => setDeleteId(e.id)} className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {entries.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Tiada kisah lagi</p>}
      </div>

      {showForm ? (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tahun (pilihan)</label>
              <input {...register('year')} className="input-field w-full text-sm" placeholder="2024" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tajuk *</label>
              <input {...register('title', { required: true })} className="input-field w-full text-sm" placeholder="Mula Kenal" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Huraian</label>
            <textarea {...register('description')} className="input-field w-full text-sm resize-none" rows={2} placeholder="Cerita ringkas..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">URL Gambar (pilihan)</label>
            <input {...register('image_url')} className="input-field w-full text-sm" placeholder="https://..." />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-secondary flex-1 text-sm">Batal</button>
            <button type="button" onClick={handleSubmit(onSubmit)} className="btn-primary flex-1 text-sm">Tambah</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl justify-center transition-colors">
          <Plus size={13} /> Tambah Kisah Baru
        </button>
      )}

      {deleteId && <DeleteConfirm onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}

// ─── Section: Gallery ─────────────────────────────────────────────────────────

function GallerySection({ wid }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const { data: photos = [] } = useQuery(
    ['gallery', wid],
    () => api.get(`/weddings/${wid}/invitation/gallery`).then(r => r.data),
    { enabled: !!wid },
  )

  const addMutation = useMutation(
    (data) => api.post(`/weddings/${wid}/invitation/gallery`, data),
    { onSuccess: () => { qc.invalidateQueries(['gallery', wid]); setShowForm(false); reset(); toast.success('Ditambah!') } }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/invitation/gallery/${id}`),
    { onSuccess: () => { qc.invalidateQueries(['gallery', wid]); setDeleteId(null); toast.success('Dipadam') } }
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {photos.map(p => (
          <div key={p.id} className="relative rounded-xl overflow-hidden group aspect-square bg-gray-100">
            <img src={p.image_url} alt={p.caption} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
            {p.caption && <p className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black/40 px-2 py-1">{p.caption}</p>}
            <button onClick={() => setDeleteId(p.id)}
              className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">URL Gambar *</label>
            <input {...register('image_url', { required: true })} className="input-field w-full text-sm" placeholder="https://i.pinimg.com/..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kapsyen (pilihan)</label>
            <input {...register('caption')} className="input-field w-full text-sm" placeholder="cth: Sesi pre-wedding..." />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-secondary flex-1 text-sm">Batal</button>
            <button type="button" onClick={handleSubmit(data => addMutation.mutate({ ...data, caption: data.caption || null }))} className="btn-primary flex-1 text-sm">Tambah</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl justify-center transition-colors">
          <Plus size={13} /> Tambah Gambar
        </button>
      )}

      {deleteId && <DeleteConfirm onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}

// ─── Section: Contacts ────────────────────────────────────────────────────────

function ContactsSection({ wid }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const { data: contacts = [] } = useQuery(
    ['contacts', wid],
    () => api.get(`/weddings/${wid}/invitation/contacts`).then(r => r.data),
    { enabled: !!wid },
  )

  const addMutation = useMutation(
    (data) => api.post(`/weddings/${wid}/invitation/contacts`, data),
    { onSuccess: () => { qc.invalidateQueries(['contacts', wid]); setShowForm(false); reset(); toast.success('Ditambah!') } }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/weddings/${wid}/invitation/contacts/${id}`),
    { onSuccess: () => { qc.invalidateQueries(['contacts', wid]); setDeleteId(null); toast.success('Dipadam') } }
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {contacts.map(c => (
          <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 group">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <Phone size={14} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{c.name}</p>
              <p className="text-xs text-gray-400">{c.role} · {c.phone} · {c.side === 'GROOM' ? 'Pihak Lelaki' : c.side === 'BRIDE' ? 'Pihak Perempuan' : ''}</p>
            </div>
            <button onClick={() => setDeleteId(c.id)} className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {contacts.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Tiada orang hubungi lagi</p>}
      </div>

      {showForm ? (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nama *</label>
              <input {...register('name', { required: true })} className="input-field w-full text-sm" placeholder="Nama" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">No. Telefon *</label>
              <input {...register('phone', { required: true })} className="input-field w-full text-sm" placeholder="+601x-xxxxxxx" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Peranan</label>
              <input {...register('role')} className="input-field w-full text-sm" placeholder="cth: Pengapit, Emak" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pihak</label>
              <select {...register('side')} className="input-field w-full text-sm">
                <option value="">—</option>
                <option value="GROOM">Pihak Lelaki</option>
                <option value="BRIDE">Pihak Perempuan</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); reset() }} className="btn-secondary flex-1 text-sm">Batal</button>
            <button type="button" onClick={handleSubmit(data => addMutation.mutate({ ...data, role: data.role || null, side: data.side || null }))} className="btn-primary flex-1 text-sm">Tambah</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 w-full py-2 border-2 border-dashed border-gray-200 rounded-xl justify-center transition-colors">
          <Plus size={13} /> Tambah Orang Hubungi
        </button>
      )}

      {deleteId && <DeleteConfirm onConfirm={() => deleteMutation.mutate(deleteId)} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}

// ─── Section: RSVP ───────────────────────────────────────────────────────────

function RSVPSection({ inv, onToggle, onSave }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { rsvp_max_pax: inv?.rsvp_max_pax ?? '' },
  })
  useEffect(() => { if (inv) reset({ rsvp_max_pax: inv.rsvp_max_pax ?? '' }) }, [inv])

  return (
    <div className="space-y-2">
      <ToggleSwitch checked={inv?.enable_rsvp ?? true} onChange={v => onToggle('enable_rsvp', v)} label="Aktifkan RSVP" sub="Tetamu boleh hantar RSVP melalui jemputan" />
      <ToggleSwitch checked={inv?.show_meal_preference ?? false} onChange={v => onToggle('show_meal_preference', v)} label="Pilihan Makanan" sub="Tunjuk pilihan makanan dalam borang RSVP" />
      <ToggleSwitch checked={inv?.enable_countdown ?? true} onChange={v => onToggle('enable_countdown', v)} label="Countdown" sub="Tunjuk kiraan masa ke hari majlis" />
      <ToggleSwitch checked={inv?.show_love_story ?? true} onChange={v => onToggle('show_love_story', v)} label="Kisah Cinta" sub="Tunjuk seksyen love story" />
      <ToggleSwitch checked={inv?.show_dress_code ?? true} onChange={v => onToggle('show_dress_code', v)} label="Dress Code" sub="Tunjuk kod pakaian" />
      <ToggleSwitch checked={inv?.show_gift_registry ?? false} onChange={v => onToggle('show_gift_registry', v)} label="Gift Registry" sub="Tunjuk senarai hadiah pilihan" />
      <ToggleSwitch checked={inv?.enable_music ?? false} onChange={v => onToggle('enable_music', v)} label="Muzik Latar" sub="Mainkan muzik apabila jemputan dibuka" />

      {inv?.enable_music && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Muzik</label>
          <input
            defaultValue={inv?.music_url ?? ''}
            onBlur={e => onSave({ music_url: e.target.value || null })}
            className="input-field w-full text-sm"
            placeholder="URL YouTube atau MP3..."
          />
        </div>
      )}

      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Had Pax RSVP</label>
        <input
          {...register('rsvp_max_pax')}
          type="number"
          min="1"
          className="input-field w-full text-sm"
          placeholder="Kosong = tiada had"
        />
        <button onClick={handleSubmit(d => onSave({ rsvp_max_pax: d.rsvp_max_pax ? Number(d.rsvp_max_pax) : null }))}
          className="btn-primary w-full mt-2 text-sm">Simpan Had Pax</button>
      </div>
    </div>
  )
}

// ─── Section: DuitNow & Hadiah ────────────────────────────────────────────────

function DuitNowSection({ inv, onSave }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL QR DuitNow</label>
        <input
          key={inv?.duitnow_qr_url}
          defaultValue={inv?.duitnow_qr_url ?? ''}
          onBlur={e => onSave({ duitnow_qr_url: e.target.value || null })}
          className="input-field w-full text-sm"
          placeholder="URL gambar QR DuitNow..."
        />
        <p className="text-xs text-gray-400 mt-1">Muat naik gambar QR ke Google Drive atau Imgur, paste link di sini</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL Gift Registry (Shopee/Amazon)</label>
        <input
          key={inv?.gift_registry_url}
          defaultValue={inv?.gift_registry_url ?? ''}
          onBlur={e => onSave({ gift_registry_url: e.target.value || null })}
          className="input-field w-full text-sm"
          placeholder="https://shopee.com.my/..."
        />
      </div>
    </div>
  )
}

// ─── Section: Custom Message ──────────────────────────────────────────────────

function MessageSection({ inv, onSave }) {
  const [val, setVal] = useState(inv?.custom_message ?? '')
  useEffect(() => { setVal(inv?.custom_message ?? '') }, [inv?.custom_message])

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mesej Peribadi kepada Tetamu
        </label>
        <textarea
          value={val}
          onChange={e => setVal(e.target.value)}
          className="input-field w-full resize-none text-sm"
          rows={5}
          placeholder="cth: Kehadiran tuan/puan amat kami hargai dan doakan agar urusan perjalanan tuan/puan dipermudahkan..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dress Code</label>
        <input
          key={inv?.dress_code_description}
          defaultValue={inv?.dress_code_description ?? ''}
          onBlur={e => onSave({ dress_code_description: e.target.value || null })}
          className="input-field w-full text-sm"
          placeholder="cth: Warna pastel, Baju Melayu/Kurung, formal..."
        />
      </div>
      <button onClick={() => onSave({ custom_message: val || null })} className="btn-primary w-full text-sm">Simpan Mesej</button>
    </div>
  )
}

// ─── Share Link ───────────────────────────────────────────────────────────────

function ShareLink({ slug }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/i/${slug}`

  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
      <input readOnly value={url} className="flex-1 text-xs text-gray-600 bg-transparent outline-none truncate" />
      <button onClick={copy} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
        {copied ? <><Check size={12} /> Disalin!</> : <><Copy size={12} /> Salin</>}
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvitationBuilderPage() {
  const qc = useQueryClient()
  const [activeSection, setActiveSection] = useState('general')

  const { data: weddings = [] } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings[0]
  const wid = wedding?.id

  const { data: inv, isLoading } = useQuery(
    ['invitation', wid],
    () => api.get(`/weddings/${wid}/invitation`).then(r => r.data).catch(() => null),
    { enabled: !!wid },
  )

  const createMutation = useMutation(
    () => api.post(`/weddings/${wid}/invitation`, {}),
    { onSuccess: () => { qc.invalidateQueries(['invitation', wid]); toast.success('Jemputan dibuat!') } }
  )

  const updateMutation = useMutation(
    (data) => api.patch(`/weddings/${wid}/invitation`, data),
    { onSuccess: () => { qc.invalidateQueries(['invitation', wid]); toast.success('Disimpan') }, onError: () => toast.error('Gagal simpan') }
  )

  const publishMutation = useMutation(
    () => api.post(`/weddings/${wid}/invitation/publish`),
    { onSuccess: () => { qc.invalidateQueries(['invitation', wid]); toast.success(inv?.is_published ? 'Jemputan ditarik balik' : 'Jemputan diterbitkan! 🎉') } }
  )

  function handleSave(data) { updateMutation.mutate(data) }
  function handleToggle(key, value) { updateMutation.mutate({ [key]: value }) }

  if (isLoading) return <div className="p-6 text-center text-gray-400 py-16">Memuatkan...</div>

  if (!inv) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20">
        <Mail size={48} className="mx-auto text-primary-300 mb-4" />
        <h1 className="text-2xl font-serif text-gray-900 mb-2">E-Jemputan Digital</h1>
        <p className="text-gray-500 mb-6">Cipta jemputan kahwin digital yang cantik. Boleh kongsi dengan semua tetamu.</p>
        <button onClick={() => createMutation.mutate()} className="btn-primary text-base px-8 py-3">
          Mula Bina Jemputan
        </button>
      </div>
    )
  }

  const activeComp = {
    general:   <GeneralSection inv={inv} wid={wid} onSave={handleSave} />,
    lovestory: <LoveStorySection wid={wid} />,
    gallery:   <GallerySection wid={wid} />,
    contacts:  <ContactsSection wid={wid} />,
    rsvp:      <RSVPSection inv={inv} onToggle={handleToggle} onSave={handleSave} />,
    duitnow:   <DuitNowSection inv={inv} onSave={handleSave} />,
    message:   <MessageSection inv={inv} onSave={handleSave} />,
  }[activeSection]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-gray-900">E-Jemputan Digital</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bina dan urus jemputan kahwin digital kamu</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/i/${inv.slug}`} target="_blank" rel="noreferrer"
            className="btn-secondary flex items-center gap-2 text-sm">
            <Eye size={15} /> Preview
          </a>
          <button
            onClick={() => publishMutation.mutate()}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-all ${
              inv.is_published
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'btn-primary'
            }`}
          >
            {inv.is_published ? <><CheckCircle2 size={15} /> Diterbitkan</> : <><Globe size={15} /> Terbitkan</>}
          </button>
        </div>
      </div>

      {/* Share link (when published) */}
      {inv.is_published && <ShareLink slug={inv.slug} />}

      {/* Not published badge */}
      {!inv.is_published && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Globe size={15} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">Jemputan belum diterbitkan — tetamu tidak boleh lihat lagi. Klik <strong>Terbitkan</strong> apabila sudah bersedia.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {SECTIONS.map(s => {
              const Icon = s.icon
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors border-b border-gray-50 last:border-0 ${
                    activeSection === s.key
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} className={activeSection === s.key ? 'text-primary-600' : 'text-gray-400'} />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5">
              {SECTIONS.find(s => s.key === activeSection)?.label}
            </h2>
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {activeComp}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
