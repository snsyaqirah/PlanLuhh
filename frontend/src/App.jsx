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

        {/* Protected Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<MissionControlPage />} />
            <Route path="settings" element={<Navigate to="/dashboard" replace />} />
            {/* Foundation */}
            <Route path="budget" element={<BudgetPage />} />
            <Route path="moodboard" element={<MoodboardPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="documents" element={<DocumentsHubPage />} />
            {/* Planning */}
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="rundown" element={<RundownPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="guests" element={<GuestsPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="hantaran" element={<HantaranPage />} />
            {/* Execution */}
            <Route path="invitation" element={<InvitationBuilderPage />} />
            <Route path="rsvp" element={<RSVPDashboardPage />} />
            <Route path="seating" element={<SeatingPage />} />
            {/* Post-Wedding */}
            <Route path="gifts" element={<GiftRegistryPage />} />
            <Route path="honeymoon" element={<HoneymoonPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
