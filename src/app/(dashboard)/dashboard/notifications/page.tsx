"use client";

import { PageHeader, EmptyState } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  XCircle,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { useNotifications } from "@/hooks/queries/useNotifications";

const ICONS: Record<string, any> = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
  error: XCircle,
  default: Bell,
};


export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markRead, 
    markAllRead,
    isMarkingRead,
    isMarkingAllRead,
    refetch 
  } = useNotifications({ limit: 50 });

  const handleMarkRead = (id: string) => {
    markRead(id);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Notifications"
          subtitle="Real-time updates from across the platform"
          action={
            <Button variant="outline" disabled>
              <CheckCheck className="h-4 w-4 mr-1.5" /> Mark all read
            </Button>
          }
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`Real-time updates from across the platform • ${unreadCount} unread`}
        action={
          notifications.length > 0 && unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              disabled={isMarkingAllRead}
            >
              {isMarkingAllRead ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-1.5" />
              )}
              Mark all read
            </Button>
          )
        }
      />
      
      {notifications.length === 0 ? (
        <EmptyState
          title="All clear"
          desc="You have no notifications right now."
        />
      ) : (
        <Card className="bg-gradient-card border-border/40 divide-y divide-border/60">
          {notifications.map((notification) => {
            const Icon = ICONS[notification.type] || ICONS.default;
            const isUnread = !notification.isRead;
            
            return (
              <button
                key={notification.id}
                onClick={() => handleMarkRead(notification.id)}
                disabled={isMarkingRead}
                className={`w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-smooth ${
                  isUnread ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--${notification.type === "error" ? "destructive" : notification.type || "primary"}) 15%, transparent)`,
                    color: `var(--${notification.type === "error" ? "destructive" : notification.type || "primary"})`,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">
                      {notification.title}
                      {isUnread && (
                        <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {notification.message}
                  </div>
                </div>
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}
