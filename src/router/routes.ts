import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "@/layouts/AuthLayout.vue";
import MainLayout from "@/layouts/MainLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: AuthLayout,
    meta: { requiresAuth: false },
    children: [
      {
        path: "",
        name: "login",
        component: () => import("@/features/auth/pages/LoginPage.vue"),
      },
    ],
  },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/home" },
      {
        path: "home",
        name: "home",
        component: () => import("@/features/home/pages/HomePage.vue"),
      },
      // Delivery (Staff, Admin)
      {
        path: "delivery",
        meta: { roles: ["staff", "admin"] },
        children: [
          {
            path: "",
            name: "delivery-list",
            component: () =>
              import("@/features/delivery/pages/DeliveryListPage.vue"),
          },
          {
            path: "create",
            name: "delivery-create",
            component: () =>
              import("@/features/delivery/pages/DeliveryCreatePage.vue"),
          },
          {
            path: ":id",
            name: "delivery-detail",
            component: () =>
              import("@/features/delivery/pages/DeliveryDetailPage.vue"),
          },
        ],
      },
      // Receiving (Staff, Admin)
      {
        path: "receiving",
        meta: { roles: ["staff", "admin"] },
        children: [
          {
            path: "",
            name: "receiving-pending",
            component: () =>
              import("@/features/receiving/pages/PendingListPage.vue"),
          },
          {
            path: "history",
            name: "receiving-history",
            component: () =>
              import("@/features/receiving/pages/ReceivedHistoryPage.vue"),
          },
        ],
      },
      // Reports (Manager, Admin)
      {
        path: "reports",
        name: "reports",
        meta: { roles: ["manager", "admin"] },
        component: () => import("@/features/reports/pages/ReportPage.vue"),
      },
      // Admin (Admin only)
      {
        path: "admin",
        meta: { roles: ["admin"] },
        children: [
          {
            path: "users",
            name: "admin-users",
            component: () =>
              import("@/features/admin/pages/UserManagementPage.vue"),
          },
          {
            path: "departments",
            name: "admin-departments",
            component: () =>
              import("@/features/admin/pages/DepartmentManagementPage.vue"),
          },
          {
            path: "audit-log",
            name: "admin-audit-log",
            component: () =>
              import("@/features/admin/pages/AuditLogPage.vue"),
          },
        ],
      },
      // Profile
      {
        path: "profile",
        name: "profile",
        component: () => import("@/features/profile/pages/ProfilePage.vue"),
      },
    ],
  },
  // Catch all -> redirect to home
  {
    path: "/:catchAll(.*)*",
    redirect: "/home",
  },
];

export default routes;
