import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/utils/api'

const schema = z.object({
  password: z.string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

const rules = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'Uppercase letter (A-Z)', test: v => /[A-Z]/.test(v) },
  { label: 'Lowercase letter (a-z)', test: v => /[a-z]/.test(v) },
  { label: 'Number (0-9)', test: v => /[0-9]/.test(v) },
]

export default function SetPasswordPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const email = state?.email || ''
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const password = useWatch({ control, name: 'password', defaultValue: '' })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/set-password', { email, password: data.password, confirm_password: data.confirm_password })
      toast.success('Password set! You can now sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to set password')
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
          <h2 className="text-2xl font-semibold text-gray-900">Set your password</h2>
          <p className="text-gray-500 mt-1 text-sm">Create a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Real-time checklist */}
            {password.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1"
              >
                {rules.map(rule => {
                  const passed = rule.test(password)
                  return (
                    <li key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {passed
                        ? <Check size={12} className="text-emerald-500 flex-shrink-0" />
                        : <X size={12} className="text-gray-300 flex-shrink-0" />}
                      {rule.label}
                    </li>
                  )
                })}
              </motion.ul>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                {...register('confirm_password')}
                type={showConfirm ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rules.some(r => !r.test(password))}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSubmitting
              ? <><Loader2 size={16} className="animate-spin" /> Setting password...</>
              : 'Set Password & Login'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}