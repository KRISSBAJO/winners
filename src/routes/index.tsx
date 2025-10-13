// src/routes/index.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useMe } from "../api/features/auth/hooks/useMe";
import App from "../App";
import LoginPage from "../api/features/auth/pages/LoginPage";
import { ProtectedRoute } from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import AnimatedPageWrapper from "../components/AnimatedPageWrapper";
import ForgotPasswordPage from "../api/features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../api/features/auth/pages/ResetPasswordPage";
import ChangePasswordPage from "../api/features/auth/pages/ChangePasswordPage";
import ProfilePage from "../api/features/users/components/ProfilePage";
import UserManagementPage from "../api/features/users/components/UserManagementPage";
import NationalChurchPage from "../api/features/org/pages/NationalChurchPage";
import DistrictsPage from "../api/features/org/pages/DistrictsPage";
import ChurchesPage from "../api/features/org/pages/ChurchesPage";
import MembershipManagement from "../api/features/members/pages/MembershipManagement";
import EditMember from "../api/features/members/pages/EditMember";
import SelfRegisterPage from "../api/features/members/pages/SelfRegisterPage";
import SelfRegInvitePage from "../api/features/members/pages/SelfRegInvitePage";

import VolunteerGroupsPage from "../api/features/volunteerGroups/pages/VolunteerGroupsPage";
import PublicEvents from "../api/features/events/PublicEvents";
import EventDetailPublic from "../api/features/events/EventDetailPublic";
import EventsManagement from "../api/features/events/pages/EventsManagement";
import EventDetailAdminWrapper from "../api/features/events/pages/EventDetailAdminWrapper"; 
import AttendancePage from "../api/features/attendance/pages/AttendancePage";
import AttendanceAdminDashboard from "../api/features/attendance/pages/AttendanceAdminDashboard";
import RoleManagementPage from "../api/features/role/pages/RoleManagementPage";

import PastorsListPage from "../api/features/pastors/pages/PastorsListPage";
import PastorDetailPage from "../api/features/pastors/pages/PastorDetailPage";
import PastorCreatePage from "../api/features/pastors/pages/PastorCreatePage";

import FollowUpListPage from "../api/features/followup/pages/FollowUpListPage";
import FollowUpCaseDetailPage from "../api/features/followup/pages/FollowUpCaseDetailPage";


const router = createBrowserRouter([
 
  {
    path: "/",
    element: (
      <AnimatedPageWrapper>
        <App />
      </AnimatedPageWrapper>
    ),
  },
  { path: "/login", element: <AnimatedPageWrapper><LoginPage /></AnimatedPageWrapper> },
  { path: "/reset-password-request", element: <AnimatedPageWrapper><ForgotPasswordPage /></AnimatedPageWrapper> },
  { path: "/reset-password", element: <AnimatedPageWrapper><ResetPasswordPage /></AnimatedPageWrapper> },

  // Public events (top-level)
  { path: "/events", element: <AnimatedPageWrapper><PublicEvents /></AnimatedPageWrapper> },
  { path: "/events/:id", element: <AnimatedPageWrapper><EventDetailPublic /></AnimatedPageWrapper> },

    { path: "self-register", element: <AnimatedPageWrapper><SelfRegisterPage /></AnimatedPageWrapper> },

  // Dashboard (protected)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AnimatedPageWrapper><DashboardPage /></AnimatedPageWrapper> },
      { path: "profile", element: <AnimatedPageWrapper><ProfilePage /></AnimatedPageWrapper> },
      { path: "change-password", element: <AnimatedPageWrapper><ChangePasswordPage /></AnimatedPageWrapper> },

      // User management
      { path: "users", element: <AnimatedPageWrapper><UserManagementPage /></AnimatedPageWrapper> },

      // Org management
      { path: "national-churches", element: <AnimatedPageWrapper><NationalChurchPage /></AnimatedPageWrapper> },
      { path: "districts", element: <AnimatedPageWrapper><DistrictsPage /></AnimatedPageWrapper> },
      { path: "churches", element: <AnimatedPageWrapper><ChurchesPage /></AnimatedPageWrapper> },

      // Members
      { path: "membership-management", element: <AnimatedPageWrapper><MembershipManagement /></AnimatedPageWrapper> },
      { path: "edit-member/:id", element: <AnimatedPageWrapper><EditMember /></AnimatedPageWrapper> },
      { path: "members/self-register-invite", element: <AnimatedPageWrapper><SelfRegInvitePage /></AnimatedPageWrapper> },

      // Volunteers
      { path: "volunteers", element: <AnimatedPageWrapper><VolunteerGroupsPage /></AnimatedPageWrapper> },

      // Admin events (note: no extra "dashboard/" prefix)
      { path: "events", element: <AnimatedPageWrapper><EventsManagement /></AnimatedPageWrapper> },
      { path: "events/:id", element: <AnimatedPageWrapper><EventDetailAdminWrapper /></AnimatedPageWrapper> },

      // Roles
      { path: "roles", element: <AnimatedPageWrapper><RoleManagementPage /></AnimatedPageWrapper> },

      // Attendance
      { path: "attendance", element: <AnimatedPageWrapper><AttendancePage /></AnimatedPageWrapper> },
      { path: "analytics/attendance", element: <AnimatedPageWrapper><AttendanceAdminDashboard /></AnimatedPageWrapper> },

      // Pastors
      { path: "pastors", element: <PastorsListPage /> },
      { path: "pastors/new", element: <PastorCreatePage /> },
      { path: "pastors/:id", element: <PastorDetailPage /> },

      //   follow up 

      { path: "follow-up", element: <AnimatedPageWrapper><FollowUpListPage /></AnimatedPageWrapper> },
      { path: "followup/:id", element: <AnimatedPageWrapper><FollowUpCaseDetailPage /></AnimatedPageWrapper> },
    ],
  },
]);

export default function Routes() {
  useMe();
  return (
    <AnimatePresence initial={false} mode="sync">
      <RouterProvider router={router} />
    </AnimatePresence>
  );
}
