import React, { useState } from 'react';
import { LogOut, User, Settings, Music, ShoppingBag, Heart, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { activeSection, setActiveSection } = useNavigation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return null;

  const handleNavigation = (section: string) => {
    setIsOpen(false);
    setShowProfileMenu(false);
    setActiveSection(section as any);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  return (
    <div className="relative">
      <div
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center space-x-2 hover:text-red-400 transition p-2 rounded-lg hover:bg-zinc-800 cursor-pointer"
      >
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="text-left hidden md:block">
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-gray-400 capitalize">{user.role}</div>
        </div>
      </div>

      {showProfileMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-zinc-900 border border-red-900/20 z-50">
          <div className="p-2 space-y-1">
            {user.role === 'user' && (
              <>
                <button
                  onClick={() => handleNavigation('profile')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <User className="w-4 h-4 mr-2" />
                  Your Profile
                </button>
                <button
                  onClick={() => handleNavigation('premium')}
                  className={`block text-sm w-full text-left transition-colors ${
                    activeSection === 'premium' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  Premium Plans
                </button>
                <button
                  onClick={() => handleNavigation('playlists')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Your Playlists
                </button>
                <button
                  onClick={() => handleNavigation('liked')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Liked Songs
                </button>
                <button
                  onClick={() => handleNavigation('friends')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Friends
                </button>
              </>
            )}
            
            {user.role === 'artist' && (
              <>
                <button
                  onClick={() => handleNavigation('artist')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Artist Dashboard
                </button>
                <button
                  onClick={() => handleNavigation('merch')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Merchandise
                </button>
              </>
            )}
            
            {user.role === 'admin' && (
              <button
                onClick={() => handleNavigation('admin')}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Dashboard
              </button>
            )}
            
            <div className="h-px bg-red-900/20 my-1" />
            
            <button
              onClick={() => handleNavigation('settings')}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-red-900/20 rounded-lg transition"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}