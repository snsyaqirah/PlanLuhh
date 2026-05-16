import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { ALL_DESIGNS } from '@/data/invitationDesigns'
import {
  MapPin, Calendar, Heart, MessageSquare, Phone, ExternalLink,
  QrCode, CalendarCheck, X, Check, ChevronDown, ChevronLeft, ChevronRight,
  Music, Gift,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '@/utils/api'

function extractYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

// ─── Bottom Drawer ────────────────────────────────────────────────────────────
function Drawer({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── RSVP Form ────────────────────────────────────────────────────────────────
function RSVPDrawer({ open, onClose, slug, invitation }) {
  const [form, setForm] = useState({ guest_name: '', phone: '', response: '', pax_count: 1, message: '' })
  const [submitted, setSubmitted] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/i/${slug}/rsvp`, form)
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal hantar RSVP')
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="RSVP — Pengesahan Kehadiran">
      {submitted ? (
        <div className="text-center py-8 space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={32} className="text-green-600" />
          </div>
          <p className="font-semibold text-gray-900">Terima kasih!</p>
          <p className="text-gray-500 text-sm">RSVP anda telah diterima.</p>
          <button onClick={() => { setSubmitted(false); setForm({ guest_name: '', phone: '', response: '', pax_count: 1, message: '' }); onClose(); }}
            className="mt-2 px-6 py-2 bg-rose-500 text-white rounded-full text-sm font-medium">
            Tutup
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nama</label>
            <input value={form.guest_name} onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))}
              className="mt-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Nama penuh" required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">No. Telefon <span className="text-gray-400 normal-case font-normal">(opsional)</span></label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="mt-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="+6012-345 6789" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Kehadiran</label>
            <div className="grid grid-cols-3 gap-2">
              {[['ATTENDING', 'Hadir ✅'], ['MAYBE', 'Mungkin 🤔'], ['NOT_ATTENDING', 'Tidak ❌']].map(([val, label]) => (
                <button key={val} type="button"
                  onClick={() => setForm(p => ({ ...p, response: val }))}
                  className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${form.response === val ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'border-gray-200 text-gray-600 hover:border-rose-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {form.response === 'ATTENDING' && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bilangan Tetamu (Pax)</label>
              <div className="mt-1 flex items-center gap-3">
                <button type="button" onClick={() => setForm(p => ({ ...p, pax_count: Math.max(1, p.pax_count - 1) }))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 text-gray-600 text-xl font-medium flex items-center justify-center hover:border-rose-300">−</button>
                <span className="text-2xl font-semibold text-gray-900 w-8 text-center">{form.pax_count}</span>
                <button type="button" onClick={() => setForm(p => ({ ...p, pax_count: Math.min(invitation.rsvp_max_pax || 10, p.pax_count + 1) }))}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 text-gray-600 text-xl font-medium flex items-center justify-center hover:border-rose-300">+</button>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ucapan <span className="text-gray-400 normal-case font-normal">(opsional)</span></label>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="mt-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              rows={2} placeholder="Pesan untuk pengantin..." />
          </div>
          <button type="submit" disabled={!form.response || !form.guest_name}
            className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors">
            Hantar RSVP
          </button>
        </form>
      )}
    </Drawer>
  )
}

// ─── Guestbook / Wishes Drawer ────────────────────────────────────────────────
function WishesDrawer({ open, onClose, slug }) {
  const [form, setForm] = useState({ guest_name: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const { data: wishes } = useQuery(
    ['guestbook', slug],
    () => api.get(`/i/${slug}/guestbook`).then(r => r.data),
    { enabled: open }
  )

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/i/${slug}/guestbook`, form)
      setSubmitted(true)
    } catch {
      toast.error('Gagal hantar ucapan')
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Buku Ucapan 💌">
      <div className="space-y-5">
        {submitted ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-green-600 font-semibold">✨ Ucapan dihantar!</p>
            <p className="text-gray-500 text-sm">Terima kasih atas ucapan anda.</p>
            <button onClick={() => { setSubmitted(false); setForm({ guest_name: '', message: '' }) }}
              className="text-rose-500 text-sm underline">Tulis lagi</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input value={form.guest_name} onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Nama anda" required />
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              rows={3} placeholder="Ucapan bahagia untuk pengantin... 🌸" required />
            <button type="submit"
              className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
              Hantar Ucapan
            </button>
          </form>
        )}

        {wishes?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Ucapan Tetamu</p>
            <div className="space-y-3">
              {wishes.map(w => (
                <div key={w.id} className="bg-rose-50/50 rounded-2xl p-4">
                  <p className="font-medium text-gray-900 text-sm">{w.guest_name}</p>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">{w.message}</p>
                  <p className="text-gray-400 text-xs mt-2">{format(new Date(w.created_at), 'd MMM yyyy')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

// ─── Location Drawer ──────────────────────────────────────────────────────────
function VenueCard({ label, name, address, lat, lng }) {
  if (!name) return null
  const q = encodeURIComponent(address || name)
  const wazeUrl = lat ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes` : `https://waze.com/ul?q=${q}`
  const mapsUrl = lat ? `https://maps.google.com/?q=${lat},${lng}` : `https://maps.google.com/?q=${q}`
  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide">{label}</p>}
      <div className="bg-rose-50 rounded-2xl p-4">
        <p className="font-semibold text-gray-900 text-sm">{name}</p>
        {address && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{address}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href={wazeUrl} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 bg-[#33CCFF] text-white rounded-xl font-medium text-xs hover:opacity-90 transition-opacity">
          <ExternalLink size={13} /> Waze
        </a>
        <a href={mapsUrl} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 bg-[#4285F4] text-white rounded-xl font-medium text-xs hover:opacity-90 transition-opacity">
          <ExternalLink size={13} /> Google Maps
        </a>
      </div>
    </div>
  )
}

function LocationDrawer({ open, onClose, wedding }) {
  const venues = [
    wedding.venue_nikah && { label: 'Akad Nikah', name: wedding.venue_nikah },
    wedding.venue_sanding_perempuan && { label: 'Sanding Pihak Perempuan', name: wedding.venue_sanding_perempuan },
    wedding.venue_sanding_lelaki && { label: 'Sanding Pihak Lelaki', name: wedding.venue_sanding_lelaki },
    wedding.venue_name && { label: wedding.venue_nikah || wedding.venue_sanding_perempuan ? 'Venue Utama' : null, name: wedding.venue_name, address: wedding.venue_address, lat: wedding.venue_lat, lng: wedding.venue_lng },
  ].filter(Boolean)

  const hasSpecific = wedding.venue_nikah || wedding.venue_sanding_perempuan || wedding.venue_sanding_lelaki

  return (
    <Drawer open={open} onClose={onClose} title="Lokasi Majlis 📍">
      <div className="space-y-5">
        {hasSpecific ? venues.map((v, i) => (
          <VenueCard key={i} {...v} />
        )) : (
          <VenueCard name={wedding.venue_name} address={wedding.venue_address} lat={wedding.venue_lat} lng={wedding.venue_lng} />
        )}
      </div>
    </Drawer>
  )
}

// ─── Contact Drawer ───────────────────────────────────────────────────────────
function ContactDrawer({ open, onClose, contacts }) {
  return (
    <Drawer open={open} onClose={onClose} title="Hubungi Kami 📞">
      <div className="space-y-3">
        {contacts?.map(c => (
          <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100">
            <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-rose-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
              {c.role && <p className="text-xs text-gray-400">{c.role}</p>}
              <p className="text-xs text-gray-500 mt-0.5">{c.phone}</p>
            </div>
            <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
              className="shrink-0 px-3 py-1.5 bg-[#25D366] text-white text-xs rounded-full font-medium hover:opacity-90">
              WhatsApp
            </a>
          </div>
        ))}
      </div>
    </Drawer>
  )
}

// ─── DuitNow QR Drawer ────────────────────────────────────────────────────────
function DuitNowDrawer({ open, onClose, invitation }) {
  return (
    <Drawer open={open} onClose={onClose} title="Salam Kaut Digital 💝">
      <div className="text-center space-y-4 py-2">
        <p className="text-gray-500 text-sm">Imbas QR untuk bagi salam kaut kepada pengantin.</p>
        <div className="bg-gray-50 rounded-2xl p-6 inline-block mx-auto">
          <img src={invitation.duitnow_qr_url} alt="DuitNow QR" className="mx-auto max-w-[220px] rounded-xl" />
        </div>
        <p className="text-xs text-gray-400">DuitNow / Bank Transfer</p>
      </div>
    </Drawer>
  )
}

// ─── Calendar Drawer ──────────────────────────────────────────────────────────
function makeGoogleCalUrl(title, dateStr, venue, names) {
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(`Majlis perkahwinan ${names}`)}&location=${encodeURIComponent(venue || '')}`
}

function CalendarEventRow({ label, date, venue, names }) {
  if (!date) return null
  const dateStr = date.replace(/-/g, '')
  const displayDate = format(new Date(date), 'EEEE, d MMMM yyyy')
  const googleUrl = makeGoogleCalUrl(`${label} — ${names}`, dateStr, venue, names)
  return (
    <div className="space-y-2">
      <div className="bg-rose-50 rounded-2xl p-3">
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide">{label}</p>
        <p className="font-medium text-gray-900 text-sm mt-0.5">{displayDate}</p>
        {venue && <p className="text-gray-400 text-xs mt-0.5">{venue}</p>}
      </div>
      <a href={googleUrl} target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#4285F4] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
        <Calendar size={15} /> Tambah ke Google Calendar
      </a>
    </div>
  )
}

function CalendarDrawer({ open, onClose, wedding }) {
  const names = `${wedding.groom_name} & ${wedding.bride_name}`
  const hasSpecific = wedding.tarikh_nikah || wedding.tarikh_sanding_perempuan || wedding.tarikh_sanding_lelaki

  return (
    <Drawer open={open} onClose={onClose} title="Simpan ke Kalendar 📅">
      <div className="space-y-4">
        {hasSpecific ? (
          <>
            <CalendarEventRow label="Akad Nikah" date={wedding.tarikh_nikah} venue={wedding.venue_nikah} names={names} />
            <CalendarEventRow label="Sanding Pihak Perempuan" date={wedding.tarikh_sanding_perempuan} venue={wedding.venue_sanding_perempuan} names={names} />
            <CalendarEventRow label="Sanding Pihak Lelaki" date={wedding.tarikh_sanding_lelaki} venue={wedding.venue_sanding_lelaki} names={names} />
          </>
        ) : wedding.wedding_date ? (
          <CalendarEventRow label="Majlis Perkahwinan" date={wedding.wedding_date} venue={wedding.venue_name} names={names} />
        ) : null}
        <p className="text-center text-xs text-gray-400 pt-1">
          Untuk iPhone / iCal — tambah secara manual ke aplikasi Kalendar anda.
        </p>
      </div>
    </Drawer>
  )
}

// ─── Music Drawer ─────────────────────────────────────────────────────────────
function MusicDrawer({ open, onClose, invitation }) {
  const videoId = extractYouTubeId(invitation.music_url)
  return (
    <Drawer open={open} onClose={onClose} title="Muzik Majlis 🎵">
      <div className="space-y-4">
        {videoId ? (
          <div className="rounded-2xl overflow-hidden bg-black aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : invitation.music_url ? (
          <a href={invitation.music_url} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-rose-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
            <Music size={18} /> Buka Muzik
          </a>
        ) : null}
        <p className="text-center text-xs text-gray-400">
          Muzik latar majlis perkahwinan kami 🎶
        </p>
      </div>
    </Drawer>
  )
}

// ─── Gift Registry Drawer ─────────────────────────────────────────────────────
function GiftDrawer({ open, onClose, invitation }) {
  const { data: items = [] } = useQuery(
    ['public-gifts', invitation.id],
    () => api.get(`/i/${invitation.slug}/gifts`).then(r => r.data),
    { enabled: open, retry: false }
  )

  return (
    <Drawer open={open} onClose={onClose} title="Senarai Hadiah 🎁">
      <div className="space-y-4">
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.claimed_count >= item.target_qty
                      ? <span className="text-gray-400">Telah ditempah ✓</span>
                      : <span className="text-rose-500">{item.claimed_count}/{item.target_qty} ditempah</span>
                    }
                  </p>
                </div>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer"
                    className="shrink-0 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium hover:bg-gray-200 transition-colors">
                    Lihat
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : invitation.gift_registry_url ? (
          <a href={invitation.gift_registry_url} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-rose-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
            <Gift size={18} /> Lihat Senarai Hadiah
          </a>
        ) : (
          <p className="text-center text-gray-400 text-sm py-4">Tiada senarai hadiah buat masa ini.</p>
        )}
      </div>
    </Drawer>
  )
}

// ─── Custom Pages Full-Screen Viewer ─────────────────────────────────────────
function CustomPagesViewer({ pages }) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent(c => Math.min(pages.length - 1, c + 1)), [pages.length])

  function handleTap(e) {
    const x = e.clientX
    const half = window.innerWidth / 2
    if (x < half) prev()
    else next()
  }

  return (
    <div className="relative w-full" style={{ maxWidth: 480, margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full cursor-pointer"
          onClick={handleTap}
        >
          <img
            src={pages[current].image_url}
            alt={`Halaman ${current + 1}`}
            className="w-full object-contain select-none"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {pages.length > 1 && (
        <div className="flex items-center justify-between px-3 mt-4">
          <button
            onClick={prev}
            disabled={current === 0}
            className="p-2 rounded-full bg-white/80 backdrop-blur shadow border border-gray-100 text-gray-600 disabled:opacity-30 hover:bg-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page dots */}
          <div className="flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-rose-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current === pages.length - 1}
            className="p-2 rounded-full bg-white/80 backdrop-blur shadow border border-gray-100 text-gray-600 disabled:opacity-30 hover:bg-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-2">
        {current + 1} / {pages.length} · Ketik kiri/kanan untuk tukar halaman
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvitationPublicPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const isPreview = searchParams.get('preview') === '1'
  const [opened, setOpened] = useState(false)
  const [activeDrawer, setActiveDrawer] = useState(null)

  const { data, isLoading, error } = useQuery(
    ['invitation', slug, isPreview],
    () => api.get(`/i/${slug}${isPreview ? '?preview=1' : ''}`).then(r => r.data),
    { retry: false }
  )

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" />
    </div>
  )
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 bg-stone-50">
      <div className="text-center space-y-2">
        <p className="text-4xl">💌</p>
        <p className="font-medium text-gray-700">Jemputan tidak dijumpai</p>
        <p className="text-sm text-gray-400">Sila semak semula pautan anda.</p>
      </div>
    </div>
  )

  const { invitation, wedding, love_story, contacts, gallery, custom_pages = [] } = data
  const useCustom = invitation.use_custom_design && custom_pages.length > 0

  // Opener background: custom page 1 → preset design → cover photo → default gradient
  const openerBg = useCustom
    ? custom_pages[0].image_url
    : invitation.design_id
      ? ALL_DESIGNS.find(d => d.id === invitation.design_id)?.src
      : wedding.cover_photo || null

  const hasLocation = wedding.venue_name || wedding.venue_nikah || wedding.venue_sanding_perempuan
  const hasCalendar = wedding.wedding_date || wedding.tarikh_nikah || wedding.tarikh_sanding_perempuan

  // Build floating menu items based on what's available
  const menuItems = [
    invitation.enable_rsvp && { key: 'rsvp', icon: CalendarCheck, label: 'RSVP', color: 'text-rose-500' },
    { key: 'wishes', icon: MessageSquare, label: 'Ucapan', color: 'text-violet-500' },
    hasLocation && { key: 'location', icon: MapPin, label: 'Lokasi', color: 'text-blue-500' },
    contacts?.length > 0 && { key: 'contact', icon: Phone, label: 'Hubungi', color: 'text-green-500' },
    invitation.enable_music && invitation.music_url && { key: 'music', icon: Music, label: 'Muzik', color: 'text-pink-500' },
    invitation.show_gift_registry && { key: 'gift', icon: Gift, label: 'Hadiah', color: 'text-amber-500' },
    invitation.duitnow_qr_url && { key: 'qr', icon: QrCode, label: 'DuitNow', color: 'text-teal-500' },
    hasCalendar && { key: 'calendar', icon: Calendar, label: 'Kalendar', color: 'text-indigo-500' },
  ].filter(Boolean)

  const open = (key) => setActiveDrawer(key)
  const close = () => setActiveDrawer(null)

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* ─── Opener ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Background — design image / custom page / fallback gradient */}
            {openerBg ? (
              <>
                <div className="absolute inset-0 bg-black/10" />
                <motion.img
                  src={openerBg}
                  initial={{ scale: 1.06, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark gradient overlay so text is readable */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.7) 100%)' }} />
              </>
            ) : (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1010 50%, #1a0a0a 100%)' }} />
            )}

            {/* Content */}
            <div className="relative flex flex-col items-center text-center px-8">
              {/* Decorative ring */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: openerBg ? 0.35 : 0.15 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute w-72 h-72 rounded-full border border-white/60 pointer-events-none"
              />

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-white/70 text-xs tracking-[0.3em] uppercase mb-4"
              >
                Walimatul Urus
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-white text-4xl leading-tight drop-shadow-lg"
                style={{ fontFamily: "'Great Vibes', cursive", textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
              >
                {wedding.groom_name}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="text-white/80 text-2xl my-1 drop-shadow"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                &amp;
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="text-white text-4xl leading-tight drop-shadow-lg"
                style={{ fontFamily: "'Great Vibes', cursive", textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
              >
                {wedding.bride_name}
              </motion.p>

              {wedding.wedding_date && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="text-white/60 text-xs tracking-widest mt-3 uppercase"
                >
                  {format(new Date(wedding.wedding_date), 'd MMMM yyyy')}
                </motion.p>
              )}

              {/* Open button — round, like invait.my */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.7, type: 'spring', damping: 18 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setOpened(true)}
                className="mt-10 w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 font-medium text-sm tracking-wide text-white border border-white/40 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
              >
                <Heart size={22} fill="currentColor" className="text-rose-300" />
                <span className="text-[11px] tracking-[0.12em]">Buka</span>
              </motion.button>
            </div>

            {isPreview && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-400 text-amber-900 text-xs font-semibold rounded-full">
                Preview Mode
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Invitation Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-lg mx-auto"
      >
        {useCustom ? (
          /* ── Custom design: full-page slide viewer ── */
          <div className="pt-4 px-3 pb-4">
            <CustomPagesViewer pages={custom_pages} />
          </div>
        ) : (
          /* ── Preset design: original hero ── */
          <div className="relative min-h-[420px] flex flex-col items-center justify-center text-center px-8 py-16 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #fff1f2 0%, #fafaf9 100%)' }}>
            {wedding.cover_photo && (
              <img src={wedding.cover_photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            )}
            <div className="relative space-y-3">
              <p className="text-rose-400 text-xs tracking-[0.25em] uppercase">Dengan penuh rasa kesyukuran</p>
              <div>
                <h1 className="text-4xl text-gray-900 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {wedding.groom_name}
                </h1>
                <p className="text-rose-400 text-3xl my-1" style={{ fontFamily: "'Great Vibes', cursive" }}>&amp;</p>
                <h1 className="text-4xl text-gray-900 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {wedding.bride_name}
                </h1>
              </div>
              {wedding.wedding_date && (
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="h-px w-8 bg-rose-200" />
                    <p className="text-sm">{format(new Date(wedding.wedding_date), "EEEE, d MMMM yyyy")}</p>
                    <div className="h-px w-8 bg-rose-200" />
                  </div>
                  {wedding.venue_name && (
                    <p className="text-gray-400 text-xs">{wedding.venue_name}</p>
                  )}
                </div>
              )}
            </div>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-4 text-gray-300"
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>
        )}

        <div className="px-6 py-8 space-y-10">

          {/* Love Story */}
          {invitation.show_love_story && love_story?.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <p className="text-xs text-rose-400 tracking-[0.2em] uppercase mb-1">Perjalanan Kami</p>
                <h2 className="text-2xl text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Our Story</h2>
              </div>
              <div className="relative border-l-2 border-rose-100 ml-4 space-y-8 pb-2">
                {love_story.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-7"
                  >
                    <div className="absolute -left-2 top-1.5 w-4 h-4 rounded-full bg-rose-400 ring-4 ring-stone-50" />
                    {item.year && <span className="text-rose-400 text-xs font-semibold tracking-wide">{item.year}</span>}
                    <h3 className="font-semibold text-gray-900 mt-0.5">{item.title}</h3>
                    {item.description && <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.description}</p>}
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} className="mt-3 rounded-2xl w-full object-cover max-h-48" />
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {gallery?.length > 0 && (
            <section>
              <div className="text-center mb-6">
                <p className="text-xs text-rose-400 tracking-[0.2em] uppercase mb-1">Kenangan Bersama</p>
                <h2 className="text-2xl text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Galeri</h2>
              </div>
              <div className="columns-2 gap-2 space-y-2">
                {gallery.map((photo, i) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="break-inside-avoid rounded-2xl overflow-hidden"
                  >
                    <img src={photo.image_url} alt={photo.caption} className="w-full object-cover" />
                    {photo.caption && <p className="text-xs text-gray-400 text-center py-1 bg-white">{photo.caption}</p>}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Custom message */}
          {invitation.custom_message && (
            <section className="text-center py-6 px-4 bg-rose-50/60 rounded-3xl">
              <p className="text-gray-600 leading-relaxed italic text-sm" style={{ fontFamily: "'Lora', serif" }}>
                "{invitation.custom_message}"
              </p>
            </section>
          )}

          <footer className="text-center text-gray-300 text-xs pb-4 pt-2">
            Made with <Heart className="inline text-rose-300" size={10} fill="currentColor" /> using PlanLuhh
          </footer>
        </div>
      </motion.div>

      {/* ─── Floating EQ Music Button ────────────────────────────────────── */}
      <AnimatePresence>
        {opened && invitation.enable_music && invitation.music_url && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ delay: 1.3, type: 'spring' }}
            onClick={() => open('music')}
            className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center border border-white/80"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-end gap-0.5 h-5 pb-0.5">
              {[0.7, 1, 0.5, 0.85].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-rose-500 rounded-full"
                  animate={{ scaleY: [h, 1, h * 0.6, 0.9, h] }}
                  transition={{ duration: 0.7 + i * 0.12, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 }}
                  style={{ height: 20, transformOrigin: 'bottom' }}
                />
              ))}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Floating Bottom Menu ─────────────────────────────────────────── */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ delay: 1, type: 'spring', damping: 25 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)]"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-2xl shadow-gray-900/15 px-2 py-2 flex items-center gap-0 border border-white/80 overflow-x-auto"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)' }}>
              {menuItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => open(item.key)}
                  className="flex flex-col items-center px-2.5 py-2 rounded-full hover:bg-gray-50 active:scale-95 transition-all group shrink-0"
                >
                  <item.icon size={19} className={`${item.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[9px] text-gray-400 mt-0.5 font-medium tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Drawers ──────────────────────────────────────────────────────── */}
      <RSVPDrawer open={activeDrawer === 'rsvp'} onClose={close} slug={slug} invitation={invitation} />
      <WishesDrawer open={activeDrawer === 'wishes'} onClose={close} slug={slug} />
      <LocationDrawer open={activeDrawer === 'location'} onClose={close} wedding={wedding} />
      <ContactDrawer open={activeDrawer === 'contact'} onClose={close} contacts={contacts} />
      {invitation.enable_music && invitation.music_url && (
        <MusicDrawer open={activeDrawer === 'music'} onClose={close} invitation={invitation} />
      )}
      {invitation.show_gift_registry && (
        <GiftDrawer open={activeDrawer === 'gift'} onClose={close} invitation={invitation} />
      )}
      {invitation.duitnow_qr_url && (
        <DuitNowDrawer open={activeDrawer === 'qr'} onClose={close} invitation={invitation} />
      )}
      <CalendarDrawer open={activeDrawer === 'calendar'} onClose={close} wedding={wedding} />
    </div>
  )
}
