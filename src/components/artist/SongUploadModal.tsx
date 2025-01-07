import React, { useState } from 'react';
import { X, Music, Upload } from 'lucide-react';
import { Song } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface SongUploadModalProps {
  onClose: () => void;
  onUpload: (song: Omit<Song, 'id'>) => void;
}

export function SongUploadModal({ onClose, onUpload }: SongUploadModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    album: '',
    coverUrl: '',
    audioUrl: '',
    price: 0.99,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload({
      ...formData,
      artist: user?.name || 'Unknown Artist',
      duration: 0, // Duration will be set when audio loads
      artistId: user?.id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">Upload Song</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Album</label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({ ...formData, album: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Audio URL</label>
            <input
              type="url"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              step="0.01"
              min="0"
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white rounded py-2 hover:bg-red-700 transition flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Song</span>
          </button>
        </form>
      </div>
    </div>
  );
}