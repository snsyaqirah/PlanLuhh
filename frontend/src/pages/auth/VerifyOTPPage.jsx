import { useLocation, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/utils/api'

export default function VerifyOTPPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const email = state?.email || ''
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      refs[5].current?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length !== 6) return toast.error('Enter all 6 digits')
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, code })
      toast.success('Email verified!')
      navigate('/set-password', { state: { email } })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code')
      setDigits(['', '', '', '', '', ''])
      refs[0].current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (resending) return
    setResending(true)
    try {
      await api.post('/auth/resend-otp', { email })
      toast.success('New code sent! Check your email.')
    } catch {
      toast.error('Failed to resend. Try again.')
    } finally {
      setResending(false)
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
          <h2 className="text-2xl font-semibold text-gray-900">Check your email</h2>
          <p className="text-gray-500 mt-1 text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
              />
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Verify Code'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Didn't receive it?{' '}
          <button
            onClick={resend}
            disabled={resending}
            className="text-primary-600 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
          >
            {resending ? <><Loader2 size={12} className="animate-spin" /> Sending...</> : 'Resend code'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}