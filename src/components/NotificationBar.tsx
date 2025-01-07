import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Message, NewsArticle } from '../types/social';
import { CartIcon } from './CartIcon';
import { SocialService } from '../services/api/socialService';
import { NewsService } from '../services/api/newsService';
import { useNavigation } from '../contexts/NavigationContext';

interface Notification {
  id: string;
  type: 'message' | 'news' | 'system';
  title: string;
  content: string;
  timestamp: string;
  read: boolean;
  data?: {
    messageId?: string;
    newsId?: string;
  };
}

export function NotificationBar() {
  const { user } = useAuth();
  const { setActiveSection } = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readNotifications] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('metal_aloud_read_notifications');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });
  const socialService = new SocialService();
  const newsService = new NewsService();

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        await loadNotifications();
      };
      loadData();
      const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id]); // Only depend on user ID

  if (!user) return null;

  const loadNotifications = async () => {
    if (!user) return;

    try {
      // Get unread messages
      const conversations = await socialService.getConversations(user.id);
      const unreadMessages = await Promise.all(
        conversations.map(async conv => {
          const messages = await socialService.getMessages(conv.id);
          return messages.filter(msg => 
            msg.receiverId === user.id && !msg.read
          );
        })
      );

      // Get latest news
      const latestNews = await newsService.getLatestNews();
      const recentNews = latestNews.slice(0, 5);

      // Combine notifications
      const allNotifications: Notification[] = [
        ...unreadMessages.flat().map(msg => ({
          id: msg.id,
          type: 'message' as const,
          title: 'New Message',
          content: msg.content,
          timestamp: msg.createdAt,
          read: readNotifications.has(msg.id),
          data: { messageId: msg.id }
        })),
        ...recentNews.map(news => ({
          id: news.id,
          type: 'news' as const,
          title: news.title,
          content: news.content.substring(0, 100) + '...',
          timestamp: news.publishedAt,
          read: readNotifications.has(news.id),
          data: { newsId: news.id }
        }))
      ].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    readNotifications.add(notificationId);
    localStorage.setItem('metal_aloud_read_notifications', 
      JSON.stringify(Array.from(readNotifications)));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);

    if (notification.type === 'message') {
      setActiveSection('messages');
    } else if (notification.type === 'news') {
      setActiveSection('news');
      if (notification.data?.newsId) {
        // Store the news ID and timestamp to ensure it's handled
        localStorage.setItem('metal_aloud_selected_news', JSON.stringify({
          id: notification.data.newsId,
          timestamp: Date.now()
        }));
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
      <CartIcon />
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-red-400 transition bg-zinc-900 rounded-full border border-red-900/20"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-zinc-900 rounded-lg shadow-lg border border-red-900/20 z-50">
          <div className="flex items-center justify-between p-4 border-b border-red-900/20">
            <h3 className="font-semibold text-red-500">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 hover:bg-red-900/20 transition ${
                    !notification.read ? 'bg-red-900/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{notification.title}</h4>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{notification.content}</p>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">
                No notifications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}