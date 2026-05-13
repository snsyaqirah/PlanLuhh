import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Users, ShoppingBag, Wallet, CheckSquare,
  Mail, Image, Calendar, Plane, UtensilsCrossed, Grid3X3,
  LogOut, ChevronLeft, ChevronRight, Heart,
  FolderOpen, ListOrdered, Gift, MessageSquareText, Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { divider: 'Foundation' },
  { to: '/dashboard/budget', icon: Wallet, label: 'Budget' },
  { to: '/dashboard/moodboard', icon: Image, label: 'Moodboard' },
  { to: '/dashboard/vendors', icon: ShoppingBag, label: 'Vendors' },
  { to: '/dashboard/documents', icon: FolderOpen, label: 'Documents Hub' },
  { divider: 'Planning' },
  { to: '/dashboard/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/dashboard/rundown', icon: ListOrdered, label: 'Rundown' },
  { to: '/dashboard/tasks', icon: CheckSquare, label: 'Checklist' },
  { to: '/dashboard/guests', icon: Users, label: 'Guests' },
  { to: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/dashboard/hantaran', icon: Sparkles, label: 'Hantaran' },
  { divider: 'Execution' },
  { to: '/dashboard/invitation', icon: Mail, label: 'E-Invitation' },
  { to: '/dashboard/rsvp', icon: MessageSquareText, label: 'RSVP Dashboard' },
  { to: '/dashboard/seating', icon: Grid3X3, label: 'Seating' },
  { divider: 'Post-Wedding' },
  { to: '/dashboard/gifts', icon: Gift, label: 'Gift Registry' },
  { to: '/dashboard/honeymoon', icon: Plane, label: 'Honeymoon' },
]

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        className="relative flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <Heart className="text-blush-500 flex-shrink-0" size={22} />
          {!collapsed && (
            <span className="font-script text-xl text-primary-700 whitespace-nowrap">PlanLuhh</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            if (item.divider) {
              return !collapsed ? (
                <p key={item.divider} className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {item.divider}
                </p>
              ) : <div key={item.divider} className="my-2 border-t border-gray-100 mx-2" />
            }
            const { to, icon: Icon, label, end } = item
            return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-100 p-3">
          {!collapsed && (
            <p className="text-xs text-gray-500 mb-2 px-1 truncate">{user?.email}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            {!collapsed && 'Logout'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(p => !p)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow z-10"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
