import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Loader } from 'lucide-react';
import { ProfilePictureUpload } from '../profile/ProfilePictureUpload';

export function AdminProfile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || '',
    role: 'admin',
    bio: user?.bio || '',
    contactEmail: user?.contactEmail || '',
    adminSince: user?.adminSince || new Date().toISOString().split('T')[0]
  });

  const handleImageChange = async (file: File) => {
    try {
      setLoading(true);
      // In production, implement image upload to a storage service
      const fakeUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: fakeUrl }));
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setError(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Admin Profile</h2>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfilePictureUpload
          currentImage={formData.avatarUrl || 'https://via.placeholder.com/150'}
          onImageChange={handleImageChange}
        />

        <div className="grid grid-cols-2 gap-6">
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
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full h-32 rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
              placeholder="Public contact email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Admin Since</label>
            <input
              type="date"
              value={formData.adminSince}
              onChange={(e) => setFormData({ ...formData, adminSince: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}