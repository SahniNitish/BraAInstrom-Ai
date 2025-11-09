import Navigation from "@/components/Navigation";
import NotificationsDashboard from "@/components/NotificationsDashboard";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              Notifications Center
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time notifications for food availability in your area
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationsDashboard />
      </div>
    </div>
  );
}