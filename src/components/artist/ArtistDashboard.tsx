import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SongManagement } from './SongManagement';
import { MerchManagement } from './MerchManagement';
import { ReleaseSchedule } from './ReleaseSchedule';
import { BandMembers } from './BandMembers';
import { ArtistAnalytics } from './ArtistAnalytics';
import { ArtistWallet } from './ArtistWallet';
import { VerificationRequest } from './VerificationRequest';
import { Music, ShoppingBag, BarChart2, User, LogOut, Calendar, Users, Settings } from 'lucide-react';
import { PlayerProvider } from '../../contexts/PlayerContext';
import { ProfileSettings } from '../profile/ProfileSettings';

export function ArtistDashboard() {
  const { user, logout } = useAuth();

  if (user?.role !== 'artist') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Access denied. Artist privileges required.</p>
      </div>
    );
  }

  const [salesData, setSalesData] = useState({ 
    revenue: 0, // Net revenue after commission
    grossRevenue: 0, // Total revenue before commission
    commission: 0, // Total commission paid
    sales: 0 
  });

  useEffect(() => {
    if (user) {
      // Load sales data for the artist
      const allSales = JSON.parse(localStorage.getItem('metal_aloud_artist_sales') || '{}');
      setSalesData(allSales[user.id] || { 
        revenue: 0, 
        grossRevenue: 0,
        commission: 0,
        sales: 0 
      });
    }
  }, [user]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-blue-900 via-black to-black">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-black/50 p-4 md:p-6 border-b md:border-r border-blue-900/20">
        <div className="flex justify-center mb-6">
          <img 
            src={localStorage.getItem('metal_aloud_website_image') || "https://images.unsplash.com/photo-1511735111819-9a3f7709049c"}
            alt="Metal Aloud"
            className="w-32 h-32 object-contain"
          />
        </div>
        <div className="flex items-center space-x-3 mb-8">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-12 h-12 rounded-full border-2 border-blue-500"
          />
          <div>
            <h2 className="text-xl font-bold text-blue-500">{user.name}</h2>
            <p className="text-sm text-gray-400">Artist Dashboard</p>
          </div>
        </div>
        <nav className="flex md:block overflow-x-auto md:overflow-x-visible space-x-4 md:space-x-0 md:space-y-4 pb-2 md:pb-0">
          <a href="#songs" className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors">
            <Music className="w-5 h-5" />
            <span>Songs</span>
          </a>
          <a href="#schedule" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Calendar className="w-5 h-5" />
            <span>Release Schedule</span>
          </a>
          <a href="#merch" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <span>Merchandise</span>
          </a>
          <a href="#band" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <Users className="w-5 h-5" />
            <span>Band Members</span>
          </a>
          <a href="#analytics" className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
            <BarChart2 className="w-5 h-5" />
            <span>Analytics</span>
          </a>
          <div className="mt-auto pt-4 border-t border-red-900/20">
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="space-y-8">
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20 mb-6">
            <h2 className="text-xl font-bold text-red-500 mb-4">Sales Overview</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">Gross Revenue</h3>
                <p className="text-2xl font-bold text-red-400">${salesData.grossRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">Net Revenue</h3>
                <p className="text-2xl font-bold text-red-400">${salesData.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-400">After 3% commission</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">Commission Paid</h3>
                <p className="text-2xl font-bold text-red-400">${salesData.commission.toFixed(2)}</p>
                <p className="text-xs text-gray-400">3% of gross sales</p>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-400">Total Sales</h3>
                <p className="text-2xl font-bold text-red-400">{salesData.sales} items</p>
              </div>
            </div>
          </div>
          <section id="songs">
            <PlayerProvider>
              <SongManagement />
            </PlayerProvider>
          </section>
          
          <section id="schedule">
            <ReleaseSchedule />
          </section>
          
          <section id="merch">
            <MerchManagement />
          </section>
          
          <section id="band">
            <BandMembers />
          </section>
          
          <section id="analytics">
            <ArtistAnalytics />
          </section>
          
          <section id="wallet">
            <ArtistWallet />
          </section>
          
          <section id="settings">
            <ProfileSettings />
          </section>
          
          {!user.verified && (
            <section id="verification">
              <VerificationRequest />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}