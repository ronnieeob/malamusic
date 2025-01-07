import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserManagement } from './UserManagement';
import { ArtistVerification } from './ArtistVerification';
import { ContentModeration } from './ContentModeration';
import { Analytics } from './Analytics';
import { LanguageSettings } from './LanguageSettings';
import { FontSettings } from './FontSettings';
import { BandManagement } from './BandManagement';
import { AdminProfile } from './AdminProfile';
import { AdminRoleManagement } from './AdminRoleManagement';
import { Settings } from './Settings';
import { User, Globe, Type } from 'lucide-react';
import { AdsSettings } from './AdsSettings';
import { PremiumSettings } from './PremiumSettings';
import { PlayerProvider } from '../../contexts/PlayerContext';
import { Users, Music, BarChart2, Settings as SettingsIcon, Shield, Radio, LogOut, DollarSign, DollarSign as Ads } from 'lucide-react';

export function AdminDashboard() {
  const { user, logout } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-blue-900 via-black to-black">
      {/* Sidebar */}
      <div className="w-full md:w-48 bg-black/50 p-3 border-b md:border-r border-blue-900/20">
        <div className="flex justify-center mb-6">
          <img
            src="https://images.unsplash.com/photo-1511735111819-9a3f7709049c"
            alt="Metal Aloud"
            className="w-24 h-24"
          />
        </div>
        <div className="flex items-center space-x-3 mb-8">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-blue-500"
          />
          <div>
            <h2 className="text-sm font-bold text-blue-500">{user.name}</h2>
            <p className="text-sm text-gray-400">Admin Dashboard</p>
          </div>
        </div>
        <nav className="flex md:block overflow-x-auto md:overflow-x-visible space-x-4 md:space-x-0 md:space-y-2 pb-2 md:pb-0">
          <a href="#users" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors">
            <Users className="w-4 h-4" />
            <span className="text-sm">User Management</span>
          </a>
          <a href="#artists" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Artist Verification</span>
          </a>
          <a href="#premium" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <DollarSign className="w-5 h-5" />
            <span>Premium Settings</span>
          </a>
          <a href="#ads" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Ads className="w-5 h-5" />
            <span>Ads Settings</span>
          </a>
          <a href="#content" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Music className="w-5 h-5" />
            <span>Content Moderation</span>
          </a>
          <a href="#bands" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Radio className="w-5 h-5" />
            <span>Band Management</span>
          </a>
          <a href="#admins" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Shield className="w-5 h-5" />
            <span>Admin Roles</span>
          </a>
          <a href="#analytics" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <BarChart2 className="w-5 h-5" />
            <span>Analytics</span>
          </a>
          <a href="#language" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm">Language</span>
          </a>
          <a href="#fonts" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Type className="w-4 h-4" />
            <span className="text-sm">Fonts</span>
          </a>
          <a href="#profile" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </a>
          <a href="#settings" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
              logout();
              }
            }}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors mt-auto pt-4 border-t border-blue-900/20 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-zinc-900/50 p-3">
        <div className="space-y-3">
          <section id="users">
            <UserManagement />
          </section>
          
          <section id="artists">
            <ArtistVerification />
          </section>
          
          <section id="premium">
            <PremiumSettings />
          </section>
          
          <section id="ads">
            <AdsSettings />
          </section>
          
          <section id="content">
            <ContentModeration />
          </section>
          
          <section id="bands">
            <PlayerProvider>
              <BandManagement />
            </PlayerProvider>
          </section>
          
          <section id="admins">
            <PlayerProvider>
              <AdminRoleManagement />
            </PlayerProvider>
          </section>
          
          <section id="analytics">
            <Analytics />
          </section>
          
          <section id="profile">
            <AdminProfile />
          </section>

          <section id="settings">
            <Settings />
          </section>
          
          <section id="language">
            <LanguageSettings />
          </section>
          
          <section id="fonts">
            <FontSettings />
          </section>
        </div>
      </div>
    </div>
  );
}