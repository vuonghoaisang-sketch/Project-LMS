'use client';

import { useState, useEffect, useRef } from 'react';
import { Notification } from '@/types/notification';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsAsRead,
} from '@/services/notification.service';
import { useAuth } from '@/context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    async function loadCount() {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      } catch (err) {
        // silent
      }
    }

    loadCount();
    const interval = setInterval(loadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleToggle() {
    if (!isOpen) {
      setIsOpen(true);
      setLoading(true);
      try {
        const list = await getNotifications();
        setNotifications(list);
        if (unreadCount > 0) {
          await markNotificationsAsRead();
          setUnreadCount(0);
        }
      } catch (err) {
        // silent
      } finally {
        setLoading(false);
      }
    } else {
      setIsOpen(false);
    }
  }

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
        title="Notifications"
        aria-label="View notifications"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
            <span className="text-[11px] text-slate-400">Recent alerts</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pt-2">
            {loading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-3 text-xs ${!n.is_read ? 'font-medium bg-blue-50/40 rounded-lg px-2' : 'text-slate-600 px-2'}`}
                >
                  <p className="text-slate-900">{n.message}</p>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
