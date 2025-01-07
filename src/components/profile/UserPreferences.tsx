import React, { useState } from 'react';
import { Volume2, Bell, Eye, Shield } from 'lucide-react';
import { useRewards } from '../../hooks/useRewards';
import { useNavigation } from '../../contexts/NavigationContext';
import { LanguageSelector } from '../settings/LanguageSelector';
import { FontSelector } from '../settings/FontSelector';

interface Preferences {
  volume: number;
  notifications: {
    newReleases: boolean;
    artistUpdates: boolean;
    recommendations: boolean;
  };
  privacy: {
    showListeningActivity: boolean;
    showPlaylists: boolean;
    showPurchases: boolean;
  };
}

export function UserPreferences() {
  const { points } = useRewards();
  const { setActiveSection } = useNavigation();
  const [preferences, setPreferences] = useState<Preferences>({
    volume: 80,
    notifications: {
      newReleases: true,
      artistUpdates: true,
      recommendations: false
    },
    privacy: {
      showListeningActivity: true,
      showPlaylists: true,
      showPurchases: false
    }
  });

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({
      ...prev,
      volume: parseInt(e.target.value)
    }));
  };

  const toggleNotification = (key: keyof typeof preferences.notifications) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const togglePrivacy = (key: keyof typeof preferences.privacy) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Preferences</h2>
      
      <div className="bg-red-900/20 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">🎸 Metal Rewards Program</h3>
        <p className="text-sm text-gray-300">
          Earn points for every minute you listen and each friend you refer.
          Redeem points for exclusive content and merch discounts!
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-red-400">Current Points: {points}</span>
          <button
            onClick={() => setActiveSection('rewards')}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
          >
            View Rewards
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Volume2 className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold">Playback</h3>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="text-sm text-gray-400 w-12">{preferences.volume}%</span>
          </div>
        </div>

        {/* Language Settings */}
        <LanguageSelector />

        {/* Font Settings */}
        <FontSelector />

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => toggleNotification(key as keyof typeof preferences.notifications)}
                  className="rounded bg-zinc-700 border-red-900/20 text-red-500"
                />
                <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold">Privacy</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(preferences.privacy).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => togglePrivacy(key as keyof typeof preferences.privacy)}
                  className="rounded bg-zinc-700 border-red-900/20 text-red-500"
                />
                <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}