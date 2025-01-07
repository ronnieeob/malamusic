import React, { useState, useEffect } from 'react';
import { Play, Search, Music } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { useMetalContent } from '../hooks/useMetalContent'; 
import { Loader, User, PlusCircle, LogOut } from 'lucide-react';
import { GenreSection } from './GenreSection';
import { BandsSection } from './BandsSection';
import { SearchBar } from './SearchBar';
import { LibrarySection } from './LibrarySection';
import { LikedSongs } from './LikedSongs';
import { UserProfile } from './profile/UserProfile';
import { UserPlaylists } from './profile/UserPlaylists';
import { UserPreferences } from './profile/UserPreferences';
import { Rewards } from './profile/Rewards';
import { Messages } from './social/Messages';
import { MerchShop } from './shop/MerchShop';
import { PremiumPlans } from './premium/PremiumPlans';
import { FriendRequests } from './social/FriendRequests';
import { Followers } from './social/Followers';
import { Feed } from './social/Feed';
import { NewsSection } from './news/NewsSection';
import { CheckoutPage } from './shop/CheckoutPage';
import { useNavigation } from '../contexts/NavigationContext';
import { Song, Playlist, User as UserType } from '../types';
import { LogoutDialog } from './LogoutDialog';

export function MainContent() {
  const { dispatch } = usePlayer();
  const { user, logout } = useAuth();
  const { songs, playlists, loading, error } = useMetalContent();
  const { activeSection, setActiveSection, selectedBand } = useNavigation();
  const [initialized, setInitialized] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (!initialized) {
      // Initialize any required data
      setInitialized(true);
    }
  }, [initialized]);

  const handlePlaySong = (song: Song | undefined) => {
    if (!song) {
      console.error('No song provided');
      return;
    }
    
    if (!song.audioUrl) {
      console.error('No audio URL available for song:', song);
      alert('Preview not available for this song');
      return;
    }
    
    dispatch({ type: 'SET_SONG', payload: song });
  };

  const handlePlaylistPlay = (playlist: Playlist | undefined) => {
    if (!playlist) {
      console.error('No playlist provided');
      return;
    }
    
    if (playlist.songs.length === 0) {
      console.warn('Playlist is empty');
      return;
    }
    
    const playableSong = playlist.songs.find(song => song.audioUrl);
    if (!playableSong) {
      alert('No playable songs in this playlist');
      return;
    }
    
    handlePlaySong(playableSong);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-br from-blue-900 via-black to-black p-2 md:p-8 pb-24">
      {/* Mobile Menu Bar */}
      {user && <div className="flex md:hidden items-center justify-between bg-black/50 sticky top-0 p-3 mb-4 z-10">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium text-white text-sm">{user?.name}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('profile')}
            className="text-gray-400 hover:text-blue-400"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="text-gray-400 hover:text-blue-400"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setShowLogoutDialog(true);
            }}
            className="text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>}

      <div className="mb-4 md:mb-8">
        <SearchBar />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Main Navigation */}
        <nav className="flex overflow-x-auto whitespace-nowrap space-x-4 md:space-x-6 mb-4 md:mb-8 pb-2 md:pb-0">
          <button
            onClick={() => setActiveSection('home')}
            className={`text-xs md:text-sm font-semibold ${
              activeSection === 'home' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
            } transition-colors`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveSection('genres')}
            className={`text-lg font-semibold ${
              activeSection === 'genres' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Genres
          </button>
          <button
            onClick={() => setActiveSection('bands')}
            className={`text-lg font-semibold ${
              activeSection === 'bands' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Bands
          </button>
          <button
            onClick={() => setActiveSection('friends')}
            className={`text-lg font-semibold ${
              activeSection === 'friends' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveSection('social')}
            className={`text-lg font-semibold ${
              activeSection === 'social' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Social
          </button>
          <button
            onClick={() => setActiveSection('news')}
            className={`text-lg font-semibold ${
              activeSection === 'news' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            News
          </button>
          <button
            onClick={() => setActiveSection('shop')}
            className={`text-lg font-semibold ${
              activeSection === 'shop' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
            } transition-colors`}
          >
            Shop
          </button>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection('profile')}
            className={`text-sm font-medium ${
              activeSection === 'profile' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'
            } transition-colors`}
          >
            Your Profile
          </button>
          <button
            onClick={() => {
              setShowLogoutDialog(true);
            }}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {activeSection === 'home' && (
        <div>
          <h1 className="text-2xl md:text-3xl metal-font text-blue-500 mb-4 md:mb-6">Welcome to Metal Aloud 🤘</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-black/50 group rounded-md p-3 hover:bg-blue-900/30 transition cursor-pointer flex items-center border border-blue-900/20"
                onClick={() => handlePlaylistPlay(playlist)}
              >
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <span className="ml-3 text-blue-100 font-medium text-sm">{playlist.name}</span>
              </div>
            ))}
          </div>
          <h2 className="text-xl md:text-2xl metal-font text-blue-500 mb-4 md:mb-6">Metal Anthems</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-zinc-800/50 p-4 rounded-md hover:bg-red-900/30 transition cursor-pointer group border border-red-900/20"
                onClick={() => song.audioUrl && handlePlaySong(song)}
              >
                <div className="relative">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full aspect-square object-cover rounded-full mb-4"
                  />
                  <button 
                    className={`absolute right-2 bottom-2 p-3 rounded-full ${
                      song.audioUrl ? 'bg-red-600' : 'bg-gray-600'
                    } text-white opacity-0 group-hover:opacity-100 transition`}
                    disabled={!song.audioUrl}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-white font-semibold truncate">{song.title}</h3>
                <p className="text-sm text-red-400 truncate">{song.artist}</p>
                {!song.audioUrl && (
                  <p className="text-xs text-gray-400 mt-1">Preview not available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'genres' && <GenreSection />}
      {activeSection === 'bands' && <BandsSection />}
      {activeSection === 'library' && <LibrarySection />}
      {activeSection === 'profile' && <UserProfile />}
      {activeSection === 'playlists' && <UserPlaylists />}
      {activeSection === 'settings' && <UserPreferences />}
      {activeSection === 'liked' && <LikedSongs />}
      {activeSection === 'rewards' && <Rewards />}
      {activeSection === 'premium' && <PremiumPlans />}
      {activeSection === 'social' && <Feed />}
      {activeSection === 'messages' && <Messages />}
      {activeSection === 'news' && <NewsSection />}
      {activeSection === 'shop' && <MerchShop />}
      {activeSection === 'checkout' && <CheckoutPage />}
      {activeSection === 'friends' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <FriendRequests />
          </div>
          <div className="col-span-2">
            <Followers />
          </div>
        </div>
      )}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onConfirm={logout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </main>
  );
}