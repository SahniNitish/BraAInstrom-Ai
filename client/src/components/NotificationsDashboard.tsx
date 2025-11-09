import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganizations, getNotifications, markNotificationAsRead, getFoodListings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellRing, Check, Clock, MapPin, Utensils } from "lucide-react";

export default function NotificationsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ["/api/organizations"],
    queryFn: () => getOrganizations(),
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: [`/api/notifications/${selectedOrgId}`],
    queryFn: () => selectedOrgId ? getNotifications(selectedOrgId) : [],
    enabled: !!selectedOrgId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });

  const { data: foodListings } = useQuery({
    queryKey: ["/api/food-listings"],
    queryFn: getFoodListings,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${selectedOrgId}`] });
    },
  });

  // Auto-select first organization
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  const handleMarkAsRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId);
  };

  const selectedOrganization = organizations?.find(org => org.id === selectedOrgId);
  const unreadCount = notifications?.filter(n => n.isRead === 0).length || 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_listing":
        return <Utensils className="h-4 w-4" />;
      case "listing_claimed":
        return <Check className="h-4 w-4" />;
      case "reminder":
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "new_listing":
        return "bg-green-100 text-green-800";
      case "listing_claimed":
        return "bg-blue-100 text-blue-800";
      case "reminder":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const sentAt = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - sentAt.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <BellRing className="h-6 w-6 text-primary" />
          Notifications Dashboard
        </h3>
        <p className="text-muted-foreground">
          Real-time notifications for food availability in your area
        </p>
      </div>

      {/* Organization Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Organization</CardTitle>
        </CardHeader>
        <CardContent>
          {orgsLoading ? (
            <div>Loading organizations...</div>
          ) : (
            <div className="space-y-4">
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <span>{org.name}</span>
                        <Badge variant="secondary">{org.type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedOrganization && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedOrganization.address}
                  </div>
                  <Badge variant="outline">
                    {(selectedOrganization.preferences as any)?.maxRadius || 10}km radius
                  </Badge>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">
                      {unreadCount} unread
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      {selectedOrgId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadCount} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      notification.isRead === 0
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{notification.title}</h4>
                            {notification.isRead === 0 && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{formatTimeAgo(notification.sentAt)}</span>
                            <Badge variant="outline" className="text-xs">
                              {notification.type.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {notification.isRead === 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markReadMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive notifications when food becomes available in your area
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Demo Section */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-1">Live Notification System</h4>
              <p className="text-sm text-green-700 mb-3">
                This dashboard shows real-time notifications. When someone posts food, nearby organizations automatically get notified based on:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Distance</strong> - Within your preferred radius ({(selectedOrganization?.preferences as any)?.maxRadius || 10}km)</li>
                <li>• <strong>Food type preferences</strong> - Matching your accepted food types</li>
                <li>• <strong>Pickup time</strong> - Compatible with your operating hours</li>
                <li>• <strong>Real-time delivery</strong> - Instant notifications when food is posted</li>
              </ul>
              {foodListings && foodListings.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  📊 Currently {foodListings.length} food listings available in the system
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}