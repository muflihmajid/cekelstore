import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/modules/landing/LandingPage.vue';
import AuthPage from '@/modules/auth/AuthPage.vue';
import AdminLayout from '@/modules/admin/AdminLayout.vue';
import AdminDashboardPage from '@/modules/admin/pages/AdminDashboardPage.vue';
import AdminProfilePage from '@/modules/admin/pages/AdminProfilePage.vue';
import AdminProductsPage from '@/modules/admin/pages/AdminProductsPage.vue';
import AdminCategoriesPage from '@/modules/admin/pages/AdminCategoriesPage.vue';
import AdminStatsPage from '@/modules/admin/pages/AdminStatsPage.vue';
import StorefrontPage from '@/modules/storefront/pages/StorefrontPage.vue';
import { supabase } from '@/infrastructure/supabase/client';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: LandingPage },
    { path: '/login', name: 'login', component: AuthPage },
    { path: '/toko/:slug', name: 'storefront', component: StorefrontPage },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'admin-dashboard', component: AdminDashboardPage },
        { path: 'profil', name: 'admin-profile', component: AdminProfilePage },
        { path: 'produk', name: 'admin-products', component: AdminProductsPage },
        { path: 'kategori', name: 'admin-categories', component: AdminCategoriesPage },
        { path: 'statistik', name: 'admin-stats', component: AdminStatsPage },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { name: 'login', query: { redirect: to.fullPath } };
  return true;
});
