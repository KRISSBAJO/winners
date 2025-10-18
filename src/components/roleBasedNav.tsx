import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronRight as ChevronRightIcon,
  Building2,
  Calendar,
  Activity,
  FileText,
  Bell,
  UserCircle2,
  Globe,
  MapPin,
  Users2,
  Zap,
} from "lucide-react";

export const roleBasedNav = {
  // === Site Admin (full super-set) ===========================================
siteAdmin: [
  // 1) Overview
  {
    name: "Overview",
    icon: LayoutDashboard,
    type: "group" as const,
    children: [
      { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
      { name: "Reports", icon: FileText, to: "/dashboard/analytics/attendance" },
      { name: "Activity Log", icon: Activity, to: "/dashboard/activity" },
    ],
  },

  // 2) People & Access
  {
    name: "People & Access",
    icon: Users,
    type: "group" as const,
    children: [
      { name: "Users", icon: Users, to: "/dashboard/users" },
      { name: "Membership", icon: Users2, to: "/dashboard/membership-management" },
      { name: "Self-Registration", icon: UserPlus, to: "/dashboard/members/self-register-invite" },
      { name: "Roles", icon: Activity, to: "/dashboard/roles" },
      { name: "Delegations", icon: UserCircle2, to: "/dashboard/delegations" },
      { name: "Pastors", icon: UserPlus, to: "/dashboard/pastors" },
      { name: "Volunteers", icon: UserPlus, to: "/dashboard/volunteers" },
    ],
  },

  // 3) Structure
  {
    name: "Structure",
    icon: Building2,
    type: "group" as const,
    children: [
      { name: "National Churches", icon: Globe, to: "/dashboard/national-churches" },
      { name: "Districts", icon: MapPin, to: "/dashboard/districts" },
      { name: "Churches", icon: Building2, to: "/dashboard/churches" },
    ],
  },

  // 4) Services & Programs
  {
    name: "Services & Programs",
    icon: Calendar,
    type: "group" as const,
    children: [
      { name: "Events", icon: Calendar, to: "/dashboard/events" },
      { name: "Follow Up", icon: Bell, to: "/dashboard/follow-up" },
      { name: "Cells", icon: Users2, to: "/dashboard/cells" },
      { name: "Cell Analytics", icon: FileText, to: "/dashboard/analytics/cells" },
      { name: "Attendance", icon: BarChart3, to: "/dashboard/attendance" },
      { name: "Groups", icon: Users2, to: "/dashboard/admin/groups" },
    ],
  },

  // 5) Utility & Account
  {
    name: "Utility & Account",
    icon: Settings,
    type: "group" as const,
    children: [
      { name: "View Requests", icon: FileText, to: "/dashboard/demo-requests" },
      { name: "Account Settings", icon: Settings, to: "/dashboard/change-password" },
    ],
  },
],


// === National Pastor (near-SA breadth, national scope) ======================
nationalPastor: [
  // 1) Overview
  {
    name: "Overview",
    icon: LayoutDashboard,
    type: "group" as const,
    children: [
      { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
      { name: "Reports", icon: FileText, to: "/dashboard/analytics/attendance" },
      { name: "Activity Log", icon: Activity, to: "/dashboard/activity" },
    ],
  },

  // 2) People & Access
  {
    name: "People & Access",
    icon: Users,
    type: "group" as const,
    children: [
      { name: "Users", icon: Users, to: "/dashboard/users" },
      { name: "Membership", icon: Users2, to: "/dashboard/membership-management" },
      { name: "Roles", icon: Activity, to: "/dashboard/roles" },
      { name: "Delegations", icon: UserCircle2, to: "/dashboard/delegations" },
      { name: "Pastors", icon: UserPlus, to: "/dashboard/pastors" },
      { name: "Volunteers", icon: UserPlus, to: "/dashboard/volunteers" },
      // (Optionally exclude Self-Registration if SA-only)
      // { name: "Self-Registration", icon: UserPlus, to: "/dashboard/members/self-register-invite" },
    ],
  },

  // 3) Structure (national-level org management)
  {
    name: "Structure",
    icon: Building2,
    type: "group" as const,
    children: [
      { name: "National Churches", icon: Globe, to: "/dashboard/national-churches" },
      { name: "Districts", icon: MapPin, to: "/dashboard/districts" },
      { name: "Churches", icon: Building2, to: "/dashboard/churches" },
    ],
  },

  // 4) Services & Programs
  {
    name: "Services & Programs",
    icon: Calendar,
    type: "group" as const,
    children: [
      { name: "Events", icon: Calendar, to: "/dashboard/events" },
      { name: "Follow Up", icon: Bell, to: "/dashboard/follow-up" },
      { name: "Cells", icon: Users2, to: "/dashboard/cells" },
      { name: "Cell Analytics", icon: FileText, to: "/dashboard/analytics/cells" },
      { name: "Attendance", icon: BarChart3, to: "/dashboard/attendance" },
    ],
  },

  // 5) Utility & Account
  {
    name: "Utility & Account",
    icon: Settings,
    type: "group" as const,
    children: [
      { name: "View Requests", icon: FileText, to: "/dashboard/demo-requests" },
      { name: "Account Settings", icon: Settings, to: "/dashboard/change-password" },
    ],
  },
],


// === District Pastor (near-SA breadth, district scope) ======================
districtPastor: [
  // 1) Overview
  {
    name: "Overview",
    icon: LayoutDashboard,
    type: "group" as const,
    children: [
      { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
      { name: "Reports", icon: FileText, to: "/dashboard/analytics/attendance" },
      { name: "Activity Log", icon: Activity, to: "/dashboard/activity" },
    ],
  },

  // 2) People & Access
  {
    name: "People & Access",
    icon: Users,
    type: "group" as const,
    children: [
      { name: "Users", icon: Users, to: "/dashboard/users" },
      { name: "Membership", icon: Users2, to: "/dashboard/membership-management" },
      { name: "Roles", icon: Activity, to: "/dashboard/roles" },
      { name: "Delegations", icon: UserCircle2, to: "/dashboard/delegations" },
      { name: "Pastors", icon: UserPlus, to: "/dashboard/pastors" },
      { name: "Volunteers", icon: UserPlus, to: "/dashboard/volunteers" },
    ],
  },

  // 3) Structure (district + churches view)
  {
    name: "Structure",
    icon: Building2,
    type: "group" as const,
    children: [
      // (Optional: hide National list for district; keep Districts + Churches)
      // { name: "National Churches", icon: Globe, to: "/dashboard/national-churches" },
      { name: "Districts", icon: MapPin, to: "/dashboard/districts" },
      { name: "Churches", icon: Building2, to: "/dashboard/churches" },
    ],
  },

  // 4) Services & Programs
  {
    name: "Services & Programs",
    icon: Calendar,
    type: "group" as const,
    children: [
      { name: "Events", icon: Calendar, to: "/dashboard/events" },
      { name: "Follow Up", icon: Bell, to: "/dashboard/follow-up" },
      { name: "Cells", icon: Users2, to: "/dashboard/cells" },
      { name: "Cell Analytics", icon: FileText, to: "/dashboard/analytics/cells" },
      { name: "Attendance", icon: BarChart3, to: "/dashboard/attendance" },
    ],
  },

  // 5) Utility & Account
  {
    name: "Utility & Account",
    icon: Settings,
    type: "group" as const,
    children: [
      { name: "View Requests", icon: FileText, to: "/dashboard/demo-requests" },
      { name: "Account Settings", icon: Settings, to: "/dashboard/change-password" },
    ],
  },
],
// === Church Admin (moderate breadth, church scope) ==========================
  churchAdmin: [
  // 1) Overview
  {
    name: "Overview",
    icon: LayoutDashboard,
    type: "group" as const,
    children: [
      { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
      { name: "Reports", icon: FileText, to: "/dashboard/analytics/attendance" },
    ],
  },

  // 2) People & Access
  {
    name: "People & Access",
    icon: Users,
    type: "group" as const,
    children: [
      { name: "Users", icon: Users, to: "/dashboard/users" },
      { name: "Membership", icon: Users2, to: "/dashboard/membership-management" },
      { name: "Roles", icon: Activity, to: "/dashboard/roles" },
      { name: "Delegations", icon: UserCircle2, to: "/dashboard/delegations" },
      { name: "Pastors", icon: UserPlus, to: "/dashboard/pastors" },
      { name: "Volunteers", icon: UserPlus, to: "/dashboard/volunteers" },
    ],
  },

  // 3) Services & Programs
  {
    name: "Services & Programs",
    icon: Calendar,
    type: "group" as const,
    children: [
      { name: "Events", icon: Calendar, to: "/dashboard/events" },
      { name: "Follow Up", icon: Bell, to: "/dashboard/follow-up" },
      { name: "Cells", icon: Users2, to: "/dashboard/cells" },
      { name: "Cell Analytics", icon: FileText, to: "/dashboard/analytics/cells" },
    ],
  },

  // 4) Attendance & Insights
  {
    name: "Attendance & Insights",
    icon: BarChart3,
    type: "group" as const,
    children: [
      { name: "Attendance", icon: BarChart3, to: "/dashboard/attendance" },
    ],
  },

  // 5) Account
  {
    name: "Account",
    icon: Settings,
    type: "group" as const,
    children: [
      { name: "Account Settings", icon: Settings, to: "/dashboard/change-password" },
    ],
  },
],
 pastor: [
  {
    name: "Overview",
    icon: LayoutDashboard,
    type: "group" as const,
    children: [
      { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    ],
  },
  {
    name: "Care & Discipleship",
    icon: Users,
    type: "group" as const,
    children: [
      { name: "Members", icon: Users, to: "/dashboard/members" },
      { name: "Follow Up", icon: Bell, to: "/dashboard/follow-up" },
      { name: "Cells", icon: Users2, to: "/dashboard/cells" },
      { name: "Cell Analytics", icon: FileText, to: "/dashboard/analytics/cells" },
    ],
  },
  {
    name: "Operations",
    icon: BarChart3,
    type: "group" as const,
    children: [
      { name: "Users", icon: Users, to: "/dashboard/users" },
      { name: "Membership", icon: Users2, to: "/dashboard/membership-management" },
      { name: "Attendance", icon: BarChart3, to: "/dashboard/attendance" },
    ],
  },
  {
    name: "Leadership & Access",
    icon: Activity,
    type: "group" as const,
    children: [
      { name: "Roles", icon: Activity, to: "/dashboard/roles" },
      { name: "Delegations", icon: UserCircle2, to: "/dashboard/delegations" },
      { name: "Pastors", icon: UserPlus, to: "/dashboard/pastors" },
    ],
  },
  {
    name: "Account",
    icon: Settings,
    type: "group" as const,
    children: [
      { name: "Account Settings", icon: Settings, to: "/dashboard/change-password" },
    ],
  },
],
 volunteer: [
  {
    name: "Overview",
    icon: LayoutDashboard,
    type: "group" as const,
    children: [
      { name: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    ],
  },
  {
    name: "Support",
    icon: Users,
    type: "group" as const,
    children: [
      { name: "Pastors", icon: UserPlus, to: "/dashboard/pastors" },
      { name: "Follow Up", icon: Bell, to: "/dashboard/follow-up" },
    ],
  },
  {
    name: "Community Resources",
    icon: Zap,
    type: "group" as const,
    children: [
      { name: "Cells", icon: Users2, to: "/dashboard/cells" },
    ],
  },
  {
    name: "Church Management",
    icon: Users,
    type: "group" as const,
    children: [
      { name: "Users", icon: Users, to: "/dashboard/users" },
      { name: "Membership", icon: Users2, to: "/dashboard/membership-management" },
      { name: "Attendance", icon: BarChart3, to: "/dashboard/attendance" },
    ],
  },
  {
    name: "Account",
    icon: Settings,
    type: "group" as const,
    children: [
      { name: "Account Settings", icon: Settings, to: "/dashboard/change-password" },
    ],
  },
],
};