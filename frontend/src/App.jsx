import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

// Auth pages
import RegisterPage from '@/pages/auth/RegisterPage'
import VerifyOTPPage from '@/pages/auth/VerifyOTPPage'
import SetPasswordPage from '@/pages/auth/SetPasswordPage'
import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Dashboard pages
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MissionControlPage from '@/pages/dashboard/MissionControlPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import BudgetPage from '@/pages/dashboard/BudgetPage'
import MoodboardPage from '@/pages/dashboard/MoodboardPage'
import VendorsPage from '@/pages/dashboard/VendorsPage'
import DocumentsHubPage from '@/pages/dashboard/DocumentsHubPage'
import SchedulePage from '@/pages/dashboard/SchedulePage'
import RundownPage from '@/pages/dashboard/RundownPage'
import TasksPage from '@/pages/dashboard/TasksPage'
import GuestsPage from '@/pages/dashboard/GuestsPage'
import MenuPage from '@/pages/dashboard/MenuPage'
import HantaranPage from '@/pages/dashboard/HantaranPage'
import InvitationBuilderPage from '@/pages/dashboard/InvitationBuilderPage'
import RSVPDashboardPage from '@/pages/dashboard/RSVPDashboardPage'
import SeatingPage from '@/pages/dashboard/SeatingPage'
import GiftRegistryPage from '@/pages/dashboard/GiftRegistryPage'
import HoneymoonPage from '@/pages/dashboard/HoneymoonPage'

// Public invitation
import InvitationPublicPage from '@/pages/invitation/InvitationPublicPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public Invitation */}
        <Route path="/i/:slug" element={<InvitationPublicPage />} />

        {/* Protected — all share DashboardLayout (sidebar) but have their own top-level paths */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<MissionControlPage />} />
            <Route path="dashboard/profile" element={<ProfilePage />} />
            {/* Foundation */}
            <Route path="foundation/budget" element={<BudgetPage />} />
            <Route path="foundation/moodboard" element={<MoodboardPage />} />
            <Route path="foundation/vendors" element={<VendorsPage />} />
            <Route path="foundation/documents" element={<DocumentsHubPage />} />
            {/* Planning */}
            <Route path="planning/schedule" element={<SchedulePage />} />
            <Route path="planning/rundown" element={<RundownPage />} />
            <Route path="planning/tasks" element={<TasksPage />} />
            <Route path="planning/guests" element={<GuestsPage />} />
            <Route path="planning/menu" element={<MenuPage />} />
            <Route path="planning/hantaran" element={<HantaranPage />} />
            {/* Execution */}
            <Route path="execution/invitation" element={<InvitationBuilderPage />} />
            <Route path="execution/rsvp" element={<RSVPDashboardPage />} />
            <Route path="execution/seating" element={<SeatingPage />} />
            {/* Post-Wedding */}
            <Route path="post-wedding/gifts" element={<GiftRegistryPage />} />
            <Route path="post-wedding/honeymoon" element={<HoneymoonPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
