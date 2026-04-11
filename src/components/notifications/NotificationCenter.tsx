"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Info, CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  SUCCESS: { icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  ERROR: { icon: AlertCircle, color: "text-rose-500", bgColor: "bg-rose-500/10" },
  WARNING: { icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  INFO: { icon: Info, color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: id }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ all: true }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700",
          isOpen && "bg-zinc-100 dark:bg-zinc-800/60 text-indigo-500"
        )}
      >
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white border-2 border-white dark:border-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <Bell className="w-[18px] h-[18px]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isLoading}
                className="text-xs text-indigo-500 hover:text-indigo-600 font-medium disabled:opacity-50 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {notifications.map((notification) => {
                  const config = typeConfig[notification.type] || typeConfig.INFO;
                  const Icon = config.icon;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors relative group",
                        !notification.isRead && "bg-indigo-50/30 dark:bg-indigo-500/5"
                      )}
                    >
                      {!notification.isRead && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-indigo-500 rounded-r-lg" />
                      )}
                      
                      <div className="flex gap-3">
                        <div className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center", config.bgColor)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {notification.title}
                            </span>
                            <span className="text-[10px] text-zinc-500 whitespace-nowrap mt-0.5">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-snug mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            {notification.link ? (
                              <div className="flex items-center text-[10px] font-medium text-indigo-500 group-hover:underline">
                                View details
                                <ExternalLink className="w-2.5 h-2.5 ml-1" />
                              </div>
                            ) : <div></div>}
                            
                            {!notification.isRead && (
                              <button
                                onClick={(e) => markAsRead(notification.id, e)}
                                title="Mark as read"
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all text-zinc-400 hover:text-indigo-500"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-50/50 dark:bg-white/[0.02] border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-xs text-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
        }
      `}</style>
    </div>
  );
}
