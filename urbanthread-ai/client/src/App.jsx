import React, { useState } from 'react';
import AuthPage from './pages/AuthPage.jsx';
import StorePage from './pages/StorePage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import useAuth from './hooks/useAuth.js';

export default function App() {
  const { user, checking, notice, handleAuth, logout } = useAuth();
  // For admins: 'dashboard' or 'store' (preview mode)
  const [adminView, setAdminView] = useState('dashboard');

  if (checking) return <div className="authLoading">LOADING KLOTH.FASHION…</div>;


  if (!user) {
    return (
      <AuthPage
        onAuth={(data, context) => {
          handleAuth(data);
          // If admin logged in via admin portal, take them directly to the admin dashboard
          if (data.user?.role === 'admin') {
            setAdminView('dashboard');
          }
        }}
        notice={notice}
      />
    );
  }

  // If user is admin and view is 'dashboard', show the dedicated Admin Dashboard
  if (user.role === 'admin' && adminView === 'dashboard') {
    return (
      <AdminDashboardPage
        me={user}
        onLogout={logout}
        onSwitchToStore={() => setAdminView('store')}
      />
    );
  }

  // Otherwise, show the Storefront (for customers or for admin previewing the store)
  return (
    <StorePage
      user={user}
      onLogout={logout}
      isAdminPreview={user.role === 'admin' && adminView === 'store'}
      onReturnToAdminDashboard={() => setAdminView('dashboard')}
    />
  );
}
