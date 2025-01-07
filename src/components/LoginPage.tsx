import React, { useState } from 'react';
import { Music, Mail, Lock, Eye, EyeOff, Mic, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials. Try:\n- admin@example.com\n- artist@example.com\n- user@example.com\n(password: password)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-black flex items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-6">
        {!showSignup ? (
          <div className="bg-black/50 p-6 rounded-xl backdrop-blur-xl border border-blue-900/20">
            {signupMessage && (
              <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                {signupMessage}
              </div>
            )}
            <div className="text-center">
              <img 
                src={localStorage.getItem('metal_aloud_website_image') || "https://images.unsplash.com/photo-1511735111819-9a3f7709049c"}
                alt="Metal Aloud"
                className="w-48 h-48 mx-auto mb-4 object-contain"
              />
              <p className="mt-2 text-sm text-gray-400">Unleash the Metal Within</p>
            </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-4 rounded border border-red-900/40 whitespace-pre-line">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="sr-only">Email address</label>
              <div className="relative text-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-blue-900/20 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Email address"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="sr-only">Password</label>
              <div className="relative text-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-blue-900/20 rounded-lg bg-black/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Password"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="flex justify-between text-sm text-gray-400">
            <a href="/forgot-password" className="text-blue-400 hover:text-blue-300">
              Forgot password?
            </a>
            <button
              onClick={() => setShowSignup(true)}
              className="text-blue-400 hover:text-blue-300"
            >
              Create account
            </button>
          </div>
        </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* Artist Signup Box */}
            <div className="bg-zinc-950/50 p-8 rounded-2xl backdrop-blur-xl border border-red-900/20">
              <div className="text-center">
                <div className="flex justify-center">
                  <Mic className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="mt-6 text-3xl metal-font text-red-500">ARTIST SIGNUP</h2>
                <p className="mt-2 text-sm text-gray-400">Share your metal with the world</p>
              </div>
              <div className="mt-8 space-y-4">
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Upload and sell your music
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Manage your merch store
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Access detailed analytics
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Connect with your fans
                  </li>
                </ul>
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/signup?type=artist');
                    window.location.reload();
                  }}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Start Creating
                </button>
              </div>
            </div>

            {/* User Signup Box */}
            <div className="bg-zinc-950/50 p-8 rounded-2xl backdrop-blur-xl border border-red-900/20">
              <div className="text-center">
                <div className="flex justify-center">
                  <User className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="mt-6 text-3xl metal-font text-red-500">FAN SIGNUP</h2>
                <p className="mt-2 text-sm text-gray-400">Discover new metal music</p>
              </div>
              <div className="mt-8 space-y-4">
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Stream unlimited metal music
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Create custom playlists
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Follow your favorite artists
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Buy exclusive merch
                  </li>
                </ul>
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/signup?type=user');
                    window.location.reload();
                  }}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Start Listening
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowSignup(false)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}