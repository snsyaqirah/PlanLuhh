import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Users, Wallet, CheckSquare, ShoppingBag, Clock, Heart } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import api from '@/utils/api'
import { useAuth } from '@/context/AuthContext'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="card flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </motion.div>
)

export default function MissionControlPage() {
  const { user } = useAuth()
  const { data: weddings } = useQuery('weddings', () => api.get('/weddings').then(r => r.data))
  const wedding = weddings?.[0]
  const weddingId = wedding?.id

  const { data: guests } = useQuery(['guests', weddingId], () => api.get(`/weddings/${weddingId}/guests`).then(r => r.data), { enabled: !!weddingId })
  const { data: tasks } = useQuery(['tasks', weddingId], () => api.get(`/weddings/${weddingId}/tasks`).then(r => r.data), { enabled: !!weddingId })
  const { data: vendors } = useQuery(['vendors', weddingId], () => api.get(`/weddings/${weddingId}/vendors`).then(r => r.data), { enabled: !!weddingId })

  const daysLeft = wedding?.wedding_date
    ? differenceInDays(new Date(wedding.wedding_date), new Date())
    : null

  const completedTasks = tasks?.filter(t => t.is_completed).length || 0
  const totalTasks = tasks?.length || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const attendingGuests = guests?.filter(g => g.rsvp_status === 'ATTENDING').reduce((sum, g) => sum + g.pax_count, 0) || 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Heart className="text-blush-500" size={24} />
          <h1 className="text-3xl font-serif text-gray-900">
            {wedding ? `${wedding.groom_name} & ${wedding.bride_name}` : 'Mission Control'}
          </h1>
        </div>
        {wedding?.wedding_date && (
          <p className="text-gray-500 ml-9">{format(new Date(wedding.wedding_date), 'EEEE, d MMMM yyyy')}</p>
        )}
      </div>

      {/* Countdown */}
      {daysLeft !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white mb-6"
        >
          <div className="flex items-center gap-4">
            <Clock size={32} />
            <div>
              <p className="text-primary-200 text-sm">Countdown</p>
              <p className="text-4xl font-bold">{daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? 'Today is the day!' : 'Congratulations!'}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Attending" value={attendingGuests} color="bg-blue-500" />
        <StatCard icon={Users} label="Total Guests" value={guests?.length || 0} color="bg-indigo-500" />
        <StatCard icon={ShoppingBag} label="Vendors" value={vendors?.length || 0} color="bg-purple-500" />
        <StatCard icon={CheckSquare} label="Tasks Done" value={`${completedTasks}/${totalTasks}`} color="bg-emerald-500" />
      </div>

      {/* Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Overall Progress</h2>
          <span className="text-primary-600 font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-primary-600 h-3 rounded-full"
          />
        </div>
        <p className="text-gray-500 text-sm mt-2">{completedTasks} of {totalTasks} tasks completed</p>
      </div>

      {/* Quick Actions */}
      {!wedding && (
        <div className="card text-center">
          <Heart className="mx-auto text-blush-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to PlanLuhh!</h2>
          <p className="text-gray-500 mb-4">Start by creating your wedding profile.</p>
          <button className="btn-primary">Create Wedding Profile</button>
        </div>
      )}
    </div>
  )
}
