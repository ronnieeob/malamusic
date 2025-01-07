import React, { useState } from 'react';
import { Song } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit2, Trash2, Play } from 'lucide-react';
import { SongUploadModal } from './SongUploadModal';
import { usePlayer } from '../../contexts/PlayerContext';
import { PlayerProvider } from '../../contexts/PlayerContext';

export function SongManagement() {
  const { user } = useAuth();
  const [songs, setSongs] = useLocalStorage<Song[]>('metal_aloud_songs', []);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const playerContext = usePlayer();

  const artistSongs = songs.filter(song => song.artistId === user?.id);

  const handleUploadSong = (song: Omit<Song, 'id'>) => {
    const newSong = {
      ...song,
      id: crypto.randomUUID(),
    };
    setSongs([...songs, newSong]);
    setShowUploadModal(false);
  };

  const handlePlaySong = (song: Song) => {
    playerContext.dispatch({ type: 'SET_SONG', payload: song });
  };

  const handleDeleteSong = (songId: string) => {
    if (confirm('Are you sure you want to delete this song?')) {
      setSongs(songs.filter(song => song.id !== songId));
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-500">Your Songs</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Song</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {artistSongs.map(song => (
          <div
            key={song.id}
            className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/10"
          >
            <img
              src={song.coverUrl}
              alt={song.title}
              className="w-full aspect-square object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold text-lg">{song.title}</h3>
            <p className="text-sm text-gray-400">{song.album}</p>
            <p className="text-sm text-red-400 mt-1">${song.price}</p>
            <p className="text-xs text-gray-500 mt-1">Added {new Date(song.createdAt).toLocaleDateString()}</p>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => handlePlaySong(song)}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteSong(song.id)}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {artistSongs.length === 0 && (
        <p className="text-center text-gray-400 py-12">No songs uploaded yet</p>
      )}

      {showUploadModal && (
        <SongUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadSong}
        />
      )}
    </div>
  );
}