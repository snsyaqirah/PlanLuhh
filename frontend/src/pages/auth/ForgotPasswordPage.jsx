import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/utils/api'

const schema = z.object({ email: z.string().email() })

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data)
    } catch {
      // Always show success to prevent email enumeration
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blush-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <Heart className="mx-auto text-blush-500 mb-3" size={32} />
          <h2 className="text-2xl font-semibold text-gray-900">Forgot Password</h2>
        </div>

        {isSubmitSuccessful ? (
          <div className="text-center text-gray-600">
            <p>If that email exists, a reset code has been sent.</p>
            <Link to="/login" className="text-primary-600 hover:underline mt-4 inline-block">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Sending...' : 'Send Reset Code'}
            </button>
            <Link to="/login" className="block text-center text-sm text-gray-500 hover:underline">Back to login</Link>
          </form>
        )}
      </motion.div>
    </div>
  )
}
