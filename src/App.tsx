/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider, useRouter } from './router/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { ReportPage } from './pages/ReportPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { AdminLayout } from './layouts/AdminLayout';

const AppRoutes: React.FC = () => {
  const { currentPath } = useRouter();
  const basePath = currentPath.split('?')[0];

  if (basePath === '/report') {
    return <ReportPage />;
  }

  if (basePath === '/track-complaint') {
    return <TrackComplaintPage />;
  }

  if (basePath === '/admin/login') {
    return <AdminLoginPage />;
  }

  if (basePath === '/admin/dashboard') {
    return (
      <AdminLayout>
        <AdminDashboardPage />
      </AdminLayout>
    );
  }

  // Default route is the Landing Page (handles '/' and any root hashes or fallback)
  return <LandingPage />;
};

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </RouterProvider>
  );
}
