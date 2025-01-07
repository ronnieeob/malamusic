import React from 'react';
import { BarChart2, Users, Music, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';

export function ArtistAnalytics() {
  const stats = [
    { label: 'Monthly Listeners', value: '2.5k', icon: Users, change: '+15%' },
    { label: 'Song Plays', value: '12.8k', icon: Music, change: '+24%' },
    { label: 'Merch Sales', value: '$3.2k', icon: ShoppingBag, change: '+18%' },
    { label: 'Revenue', value: '$5.4k', icon: DollarSign, change: '+22%' }
  ];

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 text-red-400" />
              <span className={`text-sm ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-400" />
            Top Performing Songs
          </h3>
          <div className="space-y-4">
            {['Song A', 'Song B', 'Song C'].map((song, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{song}</span>
                <span className="text-red-400">{Math.floor(Math.random() * 10000)} plays</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-lg p-6 border border-red-900/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-red-400" />
            Best Selling Merch
          </h3>
          <div className="space-y-4">
            {['Product A', 'Product B', 'Product C'].map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{product}</span>
                <span className="text-red-400">{Math.floor(Math.random() * 100)} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}