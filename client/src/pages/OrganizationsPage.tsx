import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganizations } from "@/lib/api";
import Navigation from "@/components/Navigation";
import OrganizationRegistration from "@/components/OrganizationRegistration";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Building, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Calendar,
  Users,
  Shield
} from "lucide-react";

export default function OrganizationsPage() {
  const [showRegistration, setShowRegistration] = useState(false);

  const { data: organizations, isLoading, refetch } = useQuery({
    queryKey: ["/api/organizations"],
    queryFn: () => getOrganizations(),
  });

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    refetch();
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ngo':
        return '🏛️';
      case 'food_bank':
        return '🏪';
      case 'home_care':
        return '🏠';
      case 'shelter':
        return '🏘️';
      case 'community':
        return '🏢';
      default:
        return '🏛️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ngo':
        return 'bg-blue-100 text-blue-800';
      case 'food_bank':
        return 'bg-green-100 text-green-800';
      case 'home_care':
        return 'bg-purple-100 text-purple-800';
      case 'shelter':
        return 'bg-orange-100 text-orange-800';
      case 'community':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Building className="h-8 w-8 text-primary" />
                Organizations
              </h1>
              <p className="text-muted-foreground mt-2">
                NGOs, food banks, and care centers registered to receive food notifications
              </p>
            </div>
            <Button onClick={() => setShowRegistration(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Register Organization
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{organizations?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Organizations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {organizations?.filter(org => org.isVerified === 1).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {organizations?.filter(org => org.type === 'ngo').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">NGOs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {organizations?.filter(org => org.type === 'food_bank').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Food Banks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading organizations...</p>
          </div>
        ) : organizations && organizations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getTypeIcon(org.type)}</div>
                      <div>
                        <CardTitle className="text-xl">{org.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeColor(org.type)}>
                            {org.type.replace('_', ' ')}
                          </Badge>
                          {org.isVerified === 1 && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {org.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {org.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {org.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Registered {formatDate(org.registrationDate)}
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Preferences</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Service Radius:</span>
                          <Badge variant="outline" className="ml-2">
                            {(org.preferences as any)?.maxRadius || 10}km
                          </Badge>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Food Types:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {((org.preferences as any)?.foodTypes || []).map((type: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm text-muted-foreground">Pickup Times:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {((org.preferences as any)?.preferredPickupTimes || []).map((time: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* License Info */}
                    {org.licenseNumber && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-muted-foreground">License:</span>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {org.licenseNumber}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No organizations registered yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first organization to register and start receiving food notifications
                </p>
                <Button onClick={() => setShowRegistration(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Register Your Organization
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How Organization Registration Works</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• <strong>Register your organization</strong> with contact details and preferences</li>
                  <li>• <strong>Set your service radius</strong> to receive notifications within your area</li>
                  <li>• <strong>Choose food types</strong> that match your needs and capabilities</li>
                  <li>• <strong>Get instant notifications</strong> when matching food becomes available</li>
                  <li>• <strong>License verification</strong> helps build trust with food donors</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Register Organization</DialogTitle>
          </DialogHeader>
          <OrganizationRegistration onSuccess={handleRegistrationSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}