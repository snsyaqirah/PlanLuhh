import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { MapPin, Calendar, Heart, MessageSquare, Phone, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '@/utils/api'

export default function InvitationPublicPage() {
  const { slug } = useParams()
  const [opened, setOpened] = useState(false)
  const [rsvpForm, setRsvpForm] = useState({ guest_name: '', phone: '', response: '', pax_count: 1, message: '' })
  const [guestbookForm, setGuestbookForm] = useState({ guest_name: '', message: '' })

  const { data, isLoading, error } = useQuery(
    ['invitation', slug],
    () => api.get(`/i/${slug}`).then(r => r.data),
    { retry: false }
  )

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" /></div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-gray-500">Invitation not found.</div>

  const { invitation, wedding, love_story, contacts, gallery } = data

  const submitRSVP = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/i/${slug}/rsvp`, rsvpForm)
      toast.success('RSVP submitted! Thank you.')
      setRsvpForm({ guest_name: '', phone: '', response: '', pax_count: 1, message: '' })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit RSVP')
    }
  }

  const submitGuestbook = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/i/${slug}/guestbook`, guestbookForm)
      toast.success('Ucapan dihantar! Terima kasih.')
      setGuestbookForm({ guest_name: '', message: '' })
    } catch {
      toast.error('Failed to submit')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Opener / Wax Seal Animation */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center shadow-2xl mb-8"
            >
              <Heart className="text-white" size={48} fill="white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-white font-script text-3xl mb-2"
            >
              {wedding.groom_name} & {wedding.bride_name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-stone-400 text-sm mb-8"
            >
              We joyfully invite you to celebrate with us
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={() => setOpened(true)}
              className="px-8 py-3 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-colors"
            >
              Open Invitation
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Invitation */}
      <div className="max-w-lg mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: opened ? 1 : 0 }}
          transition={{ delay: 0.3 }}
          className="relative h-96 bg-gradient-to-b from-rose-100 to-stone-50 flex flex-col items-center justify-center text-center p-8"
        >
          {wedding.cover_photo && (
            <img src={wedding.cover_photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="relative">
            <p className="text-rose-600 font-script text-2xl mb-2">The Wedding of</p>
            <h1 className="font-serif text-4xl text-gray-900 mb-1">{wedding.groom_name}</h1>
            <p className="text-rose-400 font-script text-3xl">&amp;</p>
            <h1 className="font-serif text-4xl text-gray-900 mt-1">{wedding.bride_name}</h1>
            {wedding.wedding_date && (
              <p className="mt-4 text-gray-600">
                {format(new Date(wedding.wedding_date), 'EEEE, d MMMM yyyy')}
              </p>
            )}
          </div>
        </motion.div>

        <div className="p-6 space-y-8">
          {/* Venue */}
          {wedding.venue_name && (
            <section className="text-center">
              <MapPin className="mx-auto text-rose-500 mb-2" size={24} />
              <h2 className="font-serif text-xl text-gray-900">{wedding.venue_name}</h2>
              {wedding.venue_address && <p className="text-gray-500 text-sm mt-1">{wedding.venue_address}</p>}
              {wedding.venue_lat && (
                <div className="flex gap-3 justify-center mt-3">
                  <a href={`https://waze.com/ul?ll=${wedding.venue_lat},${wedding.venue_lng}&navigate=yes`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <ExternalLink size={14} /> Waze
                  </a>
                  <a href={`https://maps.google.com/?q=${wedding.venue_lat},${wedding.venue_lng}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    <ExternalLink size={14} /> Google Maps
                  </a>
                </div>
              )}
            </section>
          )}

          {/* Gallery */}
          {gallery?.length > 0 && (
            <section>
              <h2 className="font-serif text-xl text-center text-gray-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-2 gap-2">
                {gallery.map(photo => (
                  <img key={photo.id} src={photo.image_url} alt={photo.caption} className="rounded-xl object-cover w-full aspect-square" />
                ))}
              </div>
            </section>
          )}

          {/* Love Story */}
          {invitation.show_love_story && love_story?.length > 0 && (
            <section>
              <h2 className="font-serif text-xl text-center text-gray-900 mb-6">Our Story</h2>
              <div className="relative border-l-2 border-rose-200 ml-4 space-y-6">
                {love_story.map(item => (
                  <div key={item.id} className="relative pl-6">
                    <div className="absolute -left-2.5 top-1 w-4 h-4 rounded-full bg-rose-400" />
                    {item.year && <span className="text-rose-500 text-xs font-medium">{item.year}</span>}
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RSVP */}
          {invitation.enable_rsvp && (
            <section className="card">
              <h2 className="font-serif text-xl text-gray-900 mb-4">RSVP</h2>
              <form onSubmit={submitRSVP} className="space-y-3">
                <input value={rsvpForm.guest_name} onChange={e => setRsvpForm(p => ({...p, guest_name: e.target.value}))}
                  className="input-field" placeholder="Your name" required />
                <input value={rsvpForm.phone} onChange={e => setRsvpForm(p => ({...p, phone: e.target.value}))}
                  className="input-field" placeholder="Phone number (optional)" />
                <div className="grid grid-cols-3 gap-2">
                  {['ATTENDING', 'NOT_ATTENDING', 'MAYBE'].map(r => (
                    <button key={r} type="button"
                      onClick={() => setRsvpForm(p => ({...p, response: r}))}
                      className={`py-2 rounded-lg text-sm font-medium border transition-colors ${rsvpForm.response === r ? 'bg-rose-500 text-white border-rose-500' : 'border-gray-200 text-gray-600 hover:border-rose-300'}`}
                    >
                      {r === 'ATTENDING' ? 'Hadir' : r === 'NOT_ATTENDING' ? 'Tidak' : 'Mungkin'}
                    </button>
                  ))}
                </div>
                {rsvpForm.response === 'ATTENDING' && (
                  <div>
                    <label className="text-sm text-gray-600">Pax</label>
                    <input type="number" min={1} max={invitation.rsvp_max_pax || 10}
                      value={rsvpForm.pax_count} onChange={e => setRsvpForm(p => ({...p, pax_count: +e.target.value}))}
                      className="input-field mt-1" />
                  </div>
                )}
                <button type="submit" disabled={!rsvpForm.response} className="btn-primary w-full">Send RSVP</button>
              </form>
            </section>
          )}

          {/* DuitNow */}
          {invitation.duitnow_qr_url && (
            <section className="card text-center">
              <h2 className="font-serif text-xl text-gray-900 mb-3">Salam Kaut Digital</h2>
              <img src={invitation.duitnow_qr_url} alt="DuitNow QR" className="mx-auto rounded-xl max-w-[200px]" />
            </section>
          )}

          {/* Contacts */}
          {contacts?.length > 0 && (
            <section>
              <h2 className="font-serif text-xl text-center text-gray-900 mb-4">Contact Us</h2>
              <div className="space-y-2">
                {contacts.map(c => (
                  <a key={c.id} href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-200 transition-colors">
                    <Phone size={18} className="text-rose-500" />
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.role && <p className="text-xs text-gray-500">{c.role}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Guestbook */}
          <section className="card">
            <h2 className="font-serif text-xl text-gray-900 mb-4">
              <MessageSquare className="inline mr-2 text-rose-500" size={20} />
              Tinggalkan Ucapan
            </h2>
            <form onSubmit={submitGuestbook} className="space-y-3">
              <input value={guestbookForm.guest_name} onChange={e => setGuestbookForm(p => ({...p, guest_name: e.target.value}))}
                className="input-field" placeholder="Nama anda" required />
              <textarea value={guestbookForm.message} onChange={e => setGuestbookForm(p => ({...p, message: e.target.value}))}
                className="input-field resize-none" rows={3} placeholder="Ucapan untuk pengantin..." required />
              <button type="submit" className="btn-primary w-full">Hantar Ucapan</button>
            </form>
          </section>

          <footer className="text-center text-gray-400 text-xs pb-8">
            Made with <Heart className="inline text-rose-400" size={12} fill="currentColor" /> using PlanLuhh
          </footer>
        </div>
      </div>
    </div>
  )
}
