import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Heart, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/utils/api'

const CURRENCIES = [
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
]

const schema = z.object({
  full_name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  preferred_currency: z.string().min(3, 'Select a currency'),
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { preferred_currency: 'MYR' },
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data)
      toast.success('Check your email for the verification code!')
      navigate('/verify-otp', { state: { email: data.email } })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blush-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <Heart className="mx-auto text-blush-500 mb-3" size={32} />
          <h1 className="font-script text-3xl text-primary-700">PlanLuhh</h1>
          <p className="text-gray-500 mt-1">Create your wedding planning account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input {...register('full_name')} className="input-field" placeholder="Ahmad bin Abdullah" />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="you@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Currency</label>
            <div className="relative">
              <select {...register('preferred_currency')} className="input-field appearance-none pr-10 cursor-pointer">
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-gray-400 text-xs mt-1">Used for all budget calculations. Can be changed later.</p>
            {errors.preferred_currency && <p className="text-red-500 text-xs mt-1">{errors.preferred_currency.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Sending code...' : 'Get Verification Code'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
