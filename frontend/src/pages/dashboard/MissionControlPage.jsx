import { useQuery, useMutation, useQueryClient } from 'react-query'
import { motion } from 'framer-motion'
import {
  Users, Wallet, CheckSquare, ShoppingBag, Heart,
  CalendarDays, MapPin, Save, Loader2, BookDown,
} from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

function RSVPCard({ attending, total, delay = 0 }) {
  const pct = total > 0 ? Math.round((attending / total) * 100) : 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
    >
      <div className="p-3 rounded-xl flex-shrink-0 bg-emerald-500">
        <Users size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">RSVP Status</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">
          {attending} <span className="text-base font-normal text-gray-400">/ {total} hadir</span>
        </p>
        <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: delay + 0.2 }}
            className="bg-emerald-500 h-1.5 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{pct}% confirmed</p>
      </div>
    </motion.div>
  )
}

function ProgressBar({ label, completed, total, color = 'bg-primary-600', delay = 0 }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {completed}<span className="text-gray-400 font-normal">/{total}</span>
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay }}
          className={`${color} h-2.5 rounded-full`}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct}% selesai</p>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function MissionControlPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: weddings, isLoading: weddingsLoading } = useQuery(
    'weddings',
    () => api.get('/weddings').then(r => r.data),
  )
  const wedding = weddings?.[0]
  const weddingId = wedding?.id

  const { data: stats } = useQuery(
    ['stats', weddingId],
    () => api.get(`/weddings/${weddingId}/stats`).then(r => r.data),
    { enabled: !!weddingId },
  )

  const currency = user?.preferred_currency ?? 'MYR'

  const daysLeft = wedding?.wedding_date
    ? differenceInDays(new Date(wedding.wedding_date), new Date())
    : null

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm()

  useEffect(() => {
    if (wedding) {
      reset({
        groom_name: wedding.groom_name ?? '',
        bride_name: wedding.bride_name ?? '',
        groom_father_name: wedding.groom_father_name ?? '',
        groom_mother_name: wedding.groom_mother_name ?? '',
        bride_father_name: wedding.bride_father_name ?? '',
        bride_mother_name: wedding.bride_mother_name ?? '',
        wedding_date: wedding.wedding_date ?? '',
        venue_name: wedding.venue_name ?? '',
        budget_total: wedding.budget_total ?? '',
        // Akad Nikah
        tarikh_nikah: wedding.tarikh_nikah ?? '',
        waktu_nikah: wedding.waktu_nikah ?? '',
        venue_nikah: wedding.venue_nikah ?? '',
        tema_warna_nikah: wedding.tema_warna_nikah ?? '',
        // Sanding Perempuan
        tarikh_sanding_perempuan: wedding.tarikh_sanding_perempuan ?? '',
        waktu_sanding_perempuan: wedding.waktu_sanding_perempuan ?? '',
        venue_sanding_perempuan: wedding.venue_sanding_perempuan ?? '',
        // Sanding Lelaki
        tarikh_sanding_lelaki: wedding.tarikh_sanding_lelaki ?? '',
        waktu_sanding_lelaki: wedding.waktu_sanding_lelaki ?? '',
        venue_sanding_lelaki: wedding.venue_sanding_lelaki ?? '',
        tema_warna_sanding: wedding.tema_warna_sanding ?? '',
      })
    }
  }, [wedding, reset])

  const saveMutation = useMutation(
    (data) => api.patch(`/weddings/${weddingId}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('weddings')
        toast.success('Wedding settings saved!')
      },
      onError: () => toast.error('Failed to save. Try again.'),
    },
  )

  const createMutation = useMutation(
    (data) => api.post('/weddings', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('weddings')
        toast.success('Wedding created!')
      },
      onError: () => toast.error('Failed to create. Try again.'),
    },
  )

  const isSaving = saveMutation.isLoading || createMutation.isLoading
  const [generating, setGenerating] = useState(false)

  async function downloadJourneyBook() {
    if (!weddingId) return
    setGenerating(true)
    try {
      const [budgetData, vendorsData, guestsData, tasksData, rundownData, hantaranData, menuData] = await Promise.all([
        api.get(`/weddings/${weddingId}/budget`).then(r => r.data),
        api.get(`/weddings/${weddingId}/vendors`).then(r => r.data),
        api.get(`/weddings/${weddingId}/guests`).then(r => r.data),
        api.get(`/weddings/${weddingId}/tasks`).then(r => r.data),
        api.get(`/weddings/${weddingId}/rundown`).then(r => r.data),
        api.get(`/weddings/${weddingId}/hantaran`).then(r => r.data),
        api.get(`/weddings/${weddingId}/menu`).then(r => r.data),
      ])
      const { default: JourneyBook } = await import('@/components/pdf/JourneyBook')
      const { pdf } = await import('@react-pdf/renderer')
      const blob = await pdf(
        JourneyBook({ wedding, stats, currency, budget: budgetData, vendors: vendorsData, guests: guestsData, tasks: tasksData, rundown: rundownData, hantaran: hantaranData, menu: menuData })
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PlanLuhh-${wedding.groom_name}-${wedding.bride_name}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Journey Book berjaya dimuat turun! 📖')
    } catch (err) {
      console.error(err)
      toast.error('Gagal jana PDF. Cuba semula.')
    } finally {
      setGenerating(false)
    }
  }

  const onSave = (data) => {
    const payload = {}
    for (const [k, v] of Object.entries(data)) {
      if (v === '' || v === null || v === undefined) {
        payload[k] = null
      } else if (k === 'budget_total') {
        payload[k] = parseFloat(v)
      } else {
        payload[k] = v
      }
    }
    if (weddingId) {
      saveMutation.mutate(payload)
    } else {
      if (!payload.groom_name || !payload.bride_name) {
        toast.error('Nama pengantin lelaki & perempuan diperlukan')
        return
      }
      createMutation.mutate(payload)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent'

  if (weddingsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {wedding ? `${wedding.groom_name} & ${wedding.bride_name}` : 'Dashboard'}
          </h1>
          {wedding?.wedding_date && (
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
              <CalendarDays size={14} />
              {format(new Date(wedding.wedding_date), 'EEEE, d MMMM yyyy')}
              {daysLeft !== null && (
                <span className={`ml-2 font-semibold ${daysLeft > 0 ? 'text-primary-600' : 'text-emerald-600'}`}>
                  {daysLeft > 0 ? `· ${daysLeft} hari lagi` : daysLeft === 0 ? '· Hari ini! 🎉' : '· Dah lepas! 🎊'}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {wedding && (
            <button
              onClick={downloadJourneyBook}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-200 text-primary-700 text-sm font-medium hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating
                ? <Loader2 size={15} className="animate-spin" />
                : <BookDown size={15} />
              }
              {generating ? 'Menjana PDF...' : 'Journey Book'}
            </button>
          )}
          <Heart className="text-blush-400" size={28} />
        </div>
      </div>

      {/* 4 Stat Cards */}
      {wedding ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Guest"
            value={stats?.total_guests_pax ?? '—'}
            sub={`${stats?.attending_pax ?? 0} confirmed pax`}
            color="bg-blue-500"
            delay={0}
          />
          <StatCard
            icon={Wallet}
            label="Total Damage"
            value={stats ? `${currency} ${stats.total_damage.toLocaleString('en-MY', { minimumFractionDigits: 2 })}` : '—'}
            sub="Total paid so far"
            color="bg-rose-500"
            delay={0.05}
          />
          <RSVPCard
            attending={stats?.rsvp_attending ?? 0}
            total={stats?.total_invited ?? 0}
            delay={0.1}
          />
          <StatCard
            icon={ShoppingBag}
            label="Confirmed Vendors"
            value={`${stats?.confirmed_vendors ?? 0} / ${stats?.total_vendor_categories ?? 13}`}
            sub="categories confirmed"
            color="bg-violet-500"
            delay={0.15}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <Heart className="mx-auto text-blush-300 mb-4" size={40} />
          <p className="text-gray-500 font-medium">Fill in your Wedding Settings below to get started.</p>
        </div>
      )}

      {/* Long Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <CheckSquare size={18} className="text-primary-600" />
          <h2 className="font-semibold text-gray-900">Completion Progress</h2>
        </div>
        <div className="space-y-5">
          <ProgressBar
            label="Checklist"
            completed={stats?.tasks_completed ?? 0}
            total={stats?.tasks_total ?? 0}
            color="bg-primary-600"
            delay={0.3}
          />
          <ProgressBar
            label="Vendor Categories"
            completed={stats?.confirmed_vendors ?? 0}
            total={stats?.total_vendor_categories ?? 13}
            color="bg-violet-500"
            delay={0.35}
          />
        </div>
      </motion.div>

      {/* Wedding Profile + Settings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-5">
          <h2 className="text-white font-semibold text-lg">Wedding Settings</h2>
          {wedding?.venue_name && (
            <p className="text-primary-200 text-sm mt-0.5 flex items-center gap-1.5">
              <MapPin size={13} />
              {wedding.venue_name}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
          {/* Pengantin */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pengantin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nama Pengantin Lelaki" error={errors.groom_name?.message}>
                <input {...register('groom_name', { required: 'Required' })} className={inputCls} placeholder="Ahmad bin Abdullah" />
              </Field>
              <Field label="Nama Pengantin Perempuan" error={errors.bride_name?.message}>
                <input {...register('bride_name', { required: 'Required' })} className={inputCls} placeholder="Siti binti Rahmat" />
              </Field>
            </div>
          </div>

          {/* Penjaga */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Penjaga — untuk E-Card</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Pihak Lelaki</p>
                <Field label="Ayah / Penjaga 1">
                  <input {...register('groom_father_name')} className={inputCls} placeholder="Abdullah bin Ahmad" />
                </Field>
                <Field label="Emak / Penjaga 2">
                  <input {...register('groom_mother_name')} className={inputCls} placeholder="Fatimah binti Yusof" />
                </Field>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Pihak Perempuan</p>
                <Field label="Ayah / Penjaga 1">
                  <input {...register('bride_father_name')} className={inputCls} placeholder="Rahmat bin Ismail" />
                </Field>
                <Field label="Emak / Penjaga 2">
                  <input {...register('bride_mother_name')} className={inputCls} placeholder="Zainab binti Hassan" />
                </Field>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Event Details</p>

            {/* Akad Nikah */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">Akad Nikah</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Tarikh Nikah">
                  <input {...register('tarikh_nikah')} type="date" className={inputCls} />
                </Field>
                <Field label="Waktu Nikah">
                  <input {...register('waktu_nikah')} type="time" className={inputCls} />
                </Field>
                <Field label="Venue Akad Nikah">
                  <input {...register('venue_nikah')} className={inputCls} placeholder="Masjid / Surau" />
                </Field>
                <Field label="Tema / Warna">
                  <input {...register('tema_warna_nikah')} className={inputCls} placeholder="Sage Green, #A8C5A0" />
                </Field>
              </div>
            </div>

            {/* Sanding Pihak Perempuan */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-blush-500 uppercase tracking-wide">Majlis Sanding — Pihak Perempuan</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Tarikh">
                  <input {...register('tarikh_sanding_perempuan')} type="date" className={inputCls} />
                </Field>
                <Field label="Waktu">
                  <input {...register('waktu_sanding_perempuan')} type="time" className={inputCls} />
                </Field>
                <Field label="Venue">
                  <input {...register('venue_sanding_perempuan')} className={inputCls} placeholder="Dewan / Rumah" />
                </Field>
              </div>
            </div>

            {/* Sanding Pihak Lelaki */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide">Majlis Sanding — Pihak Lelaki</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Tarikh">
                  <input {...register('tarikh_sanding_lelaki')} type="date" className={inputCls} />
                </Field>
                <Field label="Waktu">
                  <input {...register('waktu_sanding_lelaki')} type="time" className={inputCls} />
                </Field>
                <Field label="Venue">
                  <input {...register('venue_sanding_lelaki')} className={inputCls} placeholder="Dewan / Rumah" />
                </Field>
                <Field label="Tema / Warna">
                  <input {...register('tema_warna_sanding')} className={inputCls} placeholder="Dusty Blue, #6B9EBF" />
                </Field>
              </div>
            </div>

            {/* Main date + Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Tarikh Utama (untuk Countdown)">
                <input {...register('wedding_date')} type="date" className={inputCls} />
              </Field>
              <Field label="Venue Utama">
                <input {...register('venue_name')} className={inputCls} placeholder="Nama Dewan / Lokasi" />
              </Field>
              <Field label={`Budget Ceiling (${currency})`}>
                <input {...register('budget_total')} type="number" step="0.01" min="0" className={inputCls} placeholder="50000" />
              </Field>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={(!isDirty && !!weddingId) || isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {weddingId ? 'Save Settings' : 'Create Wedding'}
            </button>
          </div>
        </form>
      </motion.div>

    </div>
  )
}
