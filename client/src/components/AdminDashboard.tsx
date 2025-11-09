import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganizations, getSuppliers, getFoodListings } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  Store, 
  Utensils, 
  TrendingUp, 
  MapPin, 
  Star, 
  CheckCircle, 
  AlertTriangle,
  Calendar
} from "lucide-react";

export default function AdminDashboard() {
  const { data: organizations, isLoading: orgLoading } = useQuery({
    queryKey: ["/api/organizations"],
    queryFn: () => getOrganizations(),
  });

  const { data: suppliers, isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: getSuppliers,
  });

  const { data: foodListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["/api/food-listings"],
    queryFn: getFoodListings,
  });

  const stats = {
    totalOrganizations: organizations?.length || 0,
    totalSuppliers: suppliers?.length || 0,
    totalListings: foodListings?.length || 0,
    avgSafetyRating: suppliers?.length ? 
      (suppliers.reduce((sum, s) => sum + s.safetyRating, 0) / suppliers.length).toFixed(1) : 0,
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          System Dashboard
        </h3>
        <p className="text-muted-foreground">
          Overview of all registered organizations, suppliers, and food listings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
                <div className="text-sm text-muted-foreground">Organizations</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
                <div className="text-sm text-muted-foreground">Suppliers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Utensils className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalListings}</div>
                <div className="text-sm text-muted-foreground">Food Listings</div>
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
                <div className="text-2xl font-bold">{stats.avgSafetyRating}</div>
                <div className="text-sm text-muted-foreground">Avg Safety Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Food Listings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              {orgLoading ? (
                <div className="text-center py-8">Loading organizations...</div>
              ) : organizations && organizations.length > 0 ? (
                <div className="space-y-4">
                  {organizations.map((org) => (
                    <div key={org.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg">{org.name}</h4>
                            <Badge variant="outline">{org.type.replace("_", " ")}</Badge>
                            {org.isVerified === 1 && (
                              <Badge variant="default" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {org.address}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Registered {formatDate(org.registrationDate)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Radius:</span>
                            <Badge variant="secondary">
                              {(org.preferences as any)?.maxRadius || 10}km
                            </Badge>
                            <span className="text-sm text-muted-foreground">Food Types:</span>
                            <div className="flex flex-wrap gap-1">
                              {((org.preferences as any)?.foodTypes || []).map((type: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{org.email}</div>
                          <div className="text-sm text-muted-foreground">{org.phone}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No organizations registered yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="text-center py-8">Loading suppliers...</div>
              ) : suppliers && suppliers.length > 0 ? (
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg">{supplier.businessName}</h4>
                            <Badge variant="outline">{supplier.businessType}</Badge>
                            <Badge 
                              {...getSafetyBadge(supplier.safetyRating)}
                              className="flex items-center gap-1"
                            >
                              <Star className="h-3 w-3" />
                              {supplier.safetyRating}/5.0
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {supplier.address}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Joined {formatDate(supplier.createdAt)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Total Listings:</span>
                              <div className="font-medium">{supplier.totalListings}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Successful:</span>
                              <div className="font-medium">{supplier.successfulDeliveries}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Success Rate:</span>
                              <div className="font-medium">
                                {supplier.totalListings > 0 ? 
                                  Math.round((supplier.successfulDeliveries / supplier.totalListings) * 100) : 0}%
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Google Rating:</span>
                              <div className="font-medium flex items-center gap-1">
                                {supplier.googleRating || "N/A"}
                                {supplier.googleRating && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={supplier.verificationStatus === "verified" ? "default" : "secondary"}>
                              {supplier.verificationStatus}
                            </Badge>
                            {supplier.licenseNumber && (
                              <Badge variant="outline">
                                License: {supplier.licenseNumber}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{supplier.email}</div>
                          <div className="text-sm text-muted-foreground">{supplier.phone}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No suppliers registered yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Food Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {listingsLoading ? (
                <div className="text-center py-8">Loading food listings...</div>
              ) : foodListings && foodListings.length > 0 ? (
                <div className="space-y-4">
                  {foodListings.map((listing) => (
                    <div key={listing.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-lg">{listing.title}</h4>
                            <Badge variant="outline">{listing.category}</Badge>
                            <Badge 
                              variant={listing.status === "available" ? "default" : "secondary"}
                            >
                              {listing.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{listing.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {listing.location}
                            </div>
                            <div>Quantity: {listing.quantity}</div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Freshness:</span>
                              <div className="font-medium text-green-600">{listing.freshnessScore}/100</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Quality:</span>
                              <div className="font-medium text-blue-600">{listing.qualityScore}/100</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pickup:</span>
                              <div className="font-medium">
                                {new Date(listing.pickupTimeStart).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Posted:</span>
                              <div className="font-medium">{formatDate(listing.createdAt)}</div>
                            </div>
                          </div>
                        </div>
                        
                        {listing.imageUrl && (
                          <div className="w-20 h-20">
                            <img 
                              src={listing.imageUrl} 
                              alt={listing.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No food listings yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Info */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">System Overview</h4>
              <p className="text-sm text-gray-700 mb-3">
                This dashboard shows real-time data from your backend APIs. All data is updated automatically when:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Organizations register through the registration form</li>
                <li>• Suppliers register and get AI safety ratings calculated</li>
                <li>• Food listings are posted and notifications are sent</li>
                <li>• The AI analyzer evaluates supplier safety in real-time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}