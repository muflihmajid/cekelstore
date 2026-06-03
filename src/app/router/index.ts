import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '@/modules/auth/AuthPage.vue';
import OnboardingPage from '@/modules/onboarding/OnboardingPage.vue';
import AdminLayout from '@/modules/admin/AdminLayout.vue';
import AdminDashboardPage from '@/modules/admin/pages/AdminDashboardPage.vue';
import AdminProfilePage from '@/modules/admin/pages/AdminProfilePage.vue';
import AdminProductsPage from '@/modules/admin/pages/AdminProductsPage.vue';
import AdminCategoriesPage from '@/modules/admin/pages/AdminCategoriesPage.vue';
import AdminStatsPage from '@/modules/admin/pages/AdminStatsPage.vue';
import AdminQrPage from '@/modules/admin/pages/AdminQrPage.vue';
import AdminThemePage from '@/modules/admin/pages/AdminThemePage.vue';
import StorefrontPage from '@/modules/storefront/pages/StorefrontPage.vue';
import { supabase } from '@/infrastructure/supabase/client';
import { repositories } from '@/infrastructure/supabase/repositories';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: AuthPage },
    { path: '/register', name: 'register', component: AuthPage },
    { path: '/onboarding', name: 'onboarding', component: OnboardingPage, meta: { requiresAuth: true } },
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
        { path: 'qr', name: 'admin-qr', component: AdminQrPage },
        { path: 'tema', name: 'admin-theme', component: AdminThemePage },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if ((to.name === 'login' || to.name === 'register') && session) {
    const shop = await repositories.shops.getMyShop(session.user.id);
    return { name: shop ? 'admin-dashboard' : 'onboarding' };
  }

  if (!to.meta.requiresAuth) return true;

  if (!session) return { name: 'login', query: { redirect: to.fullPath } };

  const shop = await repositories.shops.getMyShop(session.user.id);
  if (to.path.startsWith('/admin') && !shop) return { name: 'onboarding' };
  if (to.name === 'onboarding' && shop) return { name: 'admin-dashboard' };

  return true;
});
