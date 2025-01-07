import React from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { AudioPlayer } from './components/AudioPlayer';
import { PlayerProvider } from './contexts/PlayerContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { ArtistDashboard } from './components/artist/ArtistDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ForgotPassword } from './components/ForgotPassword';
import { SignupPage } from './components/SignupPage';
import { ResetPassword } from './components/ResetPassword';
import { useAuth } from './contexts/AuthContext';
import { PremiumPlans } from './components/premium/PremiumPlans';
import { NotificationBar } from './components/NotificationBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AIProvider } from './contexts/AIContext';
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { user } = useAuth();
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const signupType = searchParams.get('type');

  if (!isAuthenticated && path === '/forgot-password') {
    return <ForgotPassword />;
  }

  if (!isAuthenticated && path === '/signup') {
    return <SignupPage initialType={signupType as 'artist' | 'user'} />;
  }

  if (!isAuthenticated && path === '/reset-password') {
    return <ResetPassword />;
  }
  
  if (!isAuthenticated && path === '/signup') {
    return <SignupPage />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // Show premium plans if user needs to upgrade
  if (user?.needsUpgrade) {
    return <PremiumPlans />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'artist') {
    return <ArtistDashboard />;
  }

  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen">
        <div className="hidden md:flex flex-1">
          <Sidebar />
          <MainContent />
        </div>
        <div className="flex-1 md:hidden">
          <MainContent />
        </div>
        <div className="sticky bottom-0">
          <AudioPlayer />
        </div>
      </div>
    </PlayerProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <AIProvider>
            <NavigationProvider>
              <CartProvider>
                <AppContent />
                <NotificationBar />
              </CartProvider>
            </NavigationProvider>
          </AIProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;