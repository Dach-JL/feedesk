"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Info, CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { StarButton } from "@/components/ui/star-button";
import { cn } from "@/lib/utils";

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
  ERROR: { icon: AlertCircle, color: "text-destructive", bgColor: "bg-destructive/10" },
  WARNING: { icon: AlertTriangle, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  INFO: { icon: Info, color: "text-primary", bgColor: "bg-primary/10" },
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const [btnLightColor, setBtnLightColor] = useState("#FAFAFA");

  useEffect(() => {
    setBtnLightColor(theme === "dark" ? "#FAFAFA" : "#6366f1"); // Indigo-500 for notifications
  }, [theme]);

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
      <StarButton
        onClick={() => setIsOpen(!isOpen)}
        lightColor={btnLightColor}
        className={cn(
          "h-10 w-10 p-0 flex items-center justify-center rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-foreground",
          isOpen && "bg-muted text-primary"
        )}
      >
        <div className="relative flex items-center justify-center h-full w-full">
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background z-20">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <Bell className="w-[18px] h-[18px]" />
        </div>
      </StarButton>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={isLoading}
                className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const config = typeConfig[notification.type] || typeConfig.INFO;
                  const Icon = config.icon;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative group",
                        !notification.isRead && "bg-primary/5"
                      )}
                    >
                      {!notification.isRead && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-r-lg" />
                      )}
                      
                      <div className="flex gap-3">
                        <div className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center", config.bgColor)}>
                          <Icon className={cn("w-4 h-4", config.color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {notification.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-snug mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            {notification.link ? (
                              <div className="flex items-center text-[10px] font-medium text-primary group-hover:underline">
                                View details
                                <ExternalLink className="w-2.5 h-2.5 ml-1" />
                              </div>
                            ) : <div></div>}
                            
                            {!notification.isRead && (
                              <button
                                onClick={(e) => markAsRead(notification.id, e)}
                                title="Mark as read"
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary"
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

          <div className="p-3 bg-muted/30 border-t border-border">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
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
