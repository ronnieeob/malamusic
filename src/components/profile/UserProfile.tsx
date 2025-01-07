import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Save } from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Profile update logic will be implemented here
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Avatar URL</label>
          <input
            type="url"
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}