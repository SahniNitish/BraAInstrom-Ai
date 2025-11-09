import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSuppliers, getSupplierAnalysis } from "@/lib/api";
import Navigation from "@/components/Navigation";
import SupplierRegistration from "@/components/SupplierRegistration";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Calendar,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye
} from "lucide-react";

export default function SuppliersPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  const { data: suppliers, isLoading, refetch } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: getSuppliers,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: [`/api/suppliers/${selectedSupplierId}/analysis`],
    queryFn: () => selectedSupplierId ? getSupplierAnalysis(selectedSupplierId) : null,
    enabled: !!selectedSupplierId,
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

  const getSafetyColor = (rating: number) => {
    if (rating >= 4.0) return "text-green-600";
    if (rating >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getSafetyBadge = (rating: number) => {
    if (rating >= 4.0) return { text: "High", variant: "default" as const };
    if (rating >= 3.0) return { text: "Medium", variant: "secondary" as const };
    return { text: "Low", variant: "destructive" as const };
  };

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return '🍽️';
      case 'grocery':
        return '🛒';
      case 'bakery':
        return '🥖';
      case 'cafe':
        return '☕';
      case 'catering':
        return '🍱';
      case 'supermarket':
        return '🏪';
      case 'food_truck':
        return '🚚';
      case 'hotel':
        return '🏨';
      default:
        return '🏪';
    }
  };

  const avgSafetyRating = suppliers?.length ? 
    (suppliers.reduce((sum, s) => sum + s.safetyRating, 0) / suppliers.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Store className="h-8 w-8 text-primary" />
                Food Suppliers
              </h1>
              <p className="text-muted-foreground mt-2">
                Registered businesses with AI-powered safety ratings and verification
              </p>
            </div>
            <Button onClick={() => setShowRegistration(true)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Register Business
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
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{suppliers?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Suppliers</div>
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
                    {suppliers?.filter(s => s.verificationStatus === 'verified').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{avgSafetyRating}</div>
                  <div className="text-sm text-muted-foreground">Avg Safety Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {suppliers?.filter(s => s.safetyRating >= 4.0).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">High Safety</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading suppliers...</p>
          </div>
        ) : suppliers && suppliers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Card 
                key={supplier.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedSupplierId(supplier.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getBusinessIcon(supplier.businessType)}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{supplier.businessName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{supplier.businessType}</Badge>
                          <Badge 
                            {...getSafetyBadge(supplier.safetyRating)}
                            className="flex items-center gap-1"
                          >
                            <Star className="h-3 w-3" />
                            {supplier.safetyRating}/5.0
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {supplier.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {supplier.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {supplier.address}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDate(supplier.createdAt)}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-semibold text-lg">{supplier.totalListings}</div>
                          <div className="text-xs text-muted-foreground">Total Listings</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{supplier.successfulDeliveries}</div>
                          <div className="text-xs text-muted-foreground">Successful</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            {supplier.totalListings > 0 ? 
                              Math.round((supplier.successfulDeliveries / supplier.totalListings) * 100) : 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                    </div>

                    {/* Google Rating */}
                    {supplier.googleRating && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Google:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{supplier.googleRating}</span>
                        </div>
                      </div>
                    )}

                    {/* License Status */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={supplier.verificationStatus === "verified" ? "default" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        <Shield className="h-3 w-3" />
                        {supplier.verificationStatus}
                      </Badge>
                      
                      {supplier.licenseExpiryDate && (
                        <Badge 
                          variant={new Date(supplier.licenseExpiryDate) > new Date() ? "outline" : "destructive"}
                          className="text-xs"
                        >
                          {new Date(supplier.licenseExpiryDate) > new Date() ? "License Valid" : "License Expired"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No suppliers registered yet</h3>
                <p className="text-muted-foreground mb-6">
                  Register your food business to start posting surplus food and get AI safety verification
                </p>
                <Button onClick={() => setShowRegistration(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Register Your Business
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900 mb-2">AI-Powered Safety Analysis</h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• <strong>Automated verification</strong> checks license validity and expiration dates</li>
                  <li>• <strong>Google reviews integration</strong> for real business reputation data</li>
                  <li>• <strong>Performance tracking</strong> monitors success rate and delivery history</li>
                  <li>• <strong>Risk assessment</strong> identifies potential safety concerns</li>
                  <li>• <strong>Dynamic ratings</strong> update in real-time based on new data</li>
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
            <DialogTitle className="sr-only">Register Supplier</DialogTitle>
          </DialogHeader>
          <SupplierRegistration onSuccess={handleRegistrationSuccess} />
        </DialogContent>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog open={!!selectedSupplierId} onOpenChange={() => setSelectedSupplierId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Safety Analysis</DialogTitle>
          </DialogHeader>
          
          {analysisLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Analyzing supplier safety...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-primary">
                  {analysis.safetyRating}/5.0
                </div>
                <Badge {...getSafetyBadge(analysis.safetyRating)}>
                  {getSafetyBadge(analysis.safetyRating).text} Safety Rating
                </Badge>
                <Progress value={analysis.safetyRating * 20} className="mt-4" />
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Verification Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">License Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {analysis.verification.licenseValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {analysis.verification.licenseValid ? "Valid" : "Expired/Invalid"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        License: {analysis.verification.licenseNumber || "Not provided"}
                      </div>
                      <Badge 
                        variant={analysis.verification.verificationStatus === "verified" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {analysis.verification.verificationStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Performance History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Listings:</span>
                        <span className="font-medium">{analysis.performance.totalListings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Successful:</span>
                        <span className="font-medium">{analysis.performance.successfulDeliveries}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span className="font-medium text-green-600">
                          {Math.round(analysis.performance.successRate * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reputation */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Online Reputation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">
                          Google: {analysis.reputation.googleRating || "Not available"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Account Age:</span>
                        <span className="font-medium ml-1">
                          {analysis.reputation.accountAge} days
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Factors */}
              {analysis.riskFactors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Risk Factors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.riskFactors.map((risk, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {risk}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h4 className="font-medium mb-2">AI Recommendations</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}