import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Lock, Eye, EyeOff, CheckCircle, Circle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/utils/api'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm_new_password: z.string(),
}).refine(d => d.new_password === d.confirm_new_password, {
  message: 'Passwords do not match',
  path: ['confirm_new_password'],
})

function PasswordRule({ met, label }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <CheckCircle size={12} /> : <Circle size={12} />}
      {label}
    </div>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone: user?.phone || '',
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_new_password: '' },
  })

  const newPassword = passwordForm.watch('new_password') || ''

  const rules = [
    { met: newPassword.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword), label: 'Uppercase letter (A–Z)' },
    { met: /[a-z]/.test(newPassword), label: 'Lowercase letter (a–z)' },
    { met: /[0-9]/.test(newPassword), label: 'Number (0–9)' },
  ]

  const onSaveProfile = async (data) => {
    setProfileLoading(true)
    try {
      const res = await api.patch('/users/me', data)
      setUser(res.data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const onChangePassword = async (data) => {
    setPasswordLoading(true)
    try {
      await api.post('/users/me/change-password', data)
      toast.success('Password changed successfully!')
      passwordForm.reset()
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to change password'
      toast.error(msg)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User size={20} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">Manage your account details</p>
            </div>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="card mb-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Personal Information</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            {/* Email — read-only */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field pl-9 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...profileForm.register('full_name')}
                  type="text"
                  placeholder="Your full name"
                  className="input-field pl-9"
                />
              </div>
              {profileForm.formState.errors.full_name && (
                <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...profileForm.register('phone')}
                  type="tel"
                  placeholder="+60 12-345 6789"
                  className="input-field pl-9"
                />
              </div>
            </div>

            {/* Currency — read-only display */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
              <div className="input-field bg-gray-50 text-gray-500 flex items-center gap-2 cursor-not-allowed">
                <span className="font-medium">{user?.preferred_currency || 'MYR'}</span>
                <span className="text-xs text-gray-400">· Malaysian Ringgit (default)</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={profileLoading} className="btn-primary">
                {profileLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={16} className="text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Change Password</h2>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
              <div className="relative">
                <input
                  {...passwordForm.register('current_password')}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.current_password && (
                <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.current_password.message}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
              <div className="relative">
                <input
                  {...passwordForm.register('new_password')}
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {rules.map(r => <PasswordRule key={r.label} {...r} />)}
                </div>
              )}
              {passwordForm.formState.errors.new_password && (
                <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.new_password.message}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  {...passwordForm.register('confirm_new_password')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordForm.formState.errors.confirm_new_password && (
                <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors.confirm_new_password.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={passwordLoading} className="btn-primary">
                {passwordLoading ? 'Updating…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
