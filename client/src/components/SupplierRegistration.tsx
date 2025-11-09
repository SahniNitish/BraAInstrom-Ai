import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupplier } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Store, MapPin, Shield, Calendar } from "lucide-react";

interface SupplierRegistrationProps {
  onSuccess?: () => void;
}

export default function SupplierRegistration({ onSuccess }: SupplierRegistrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    userId: "user-" + Math.random().toString(36).substr(2, 9), // Generate random user ID for demo
    businessName: "",
    businessType: "",
    email: "",
    phone: "",
    address: "",
    latitude: 0,
    longitude: 0,
    licenseNumber: "",
    licenseExpiryDate: "",
    googlePlaceId: "",
  });

  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your business has been registered. AI safety analysis will be available after verification.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple geocoding simulation for demo
    const cityCoords: Record<string, {lat: number, lng: number}> = {
      "delhi": { lat: 28.6139, lng: 77.2090 },
      "mumbai": { lat: 19.0760, lng: 72.8777 },
      "bangalore": { lat: 12.9716, lng: 77.5946 },
      "chennai": { lat: 13.0827, lng: 80.2707 },
      "kolkata": { lat: 22.5726, lng: 88.3639 },
    };
    
    const city = formData.address.toLowerCase();
    const coords = Object.keys(cityCoords).find(key => city.includes(key));
    
    if (coords) {
      formData.latitude = cityCoords[coords].lat;
      formData.longitude = cityCoords[coords].lng;
    }

    // Convert license expiry date to Date object
    const submitData = {
      ...formData,
      licenseExpiryDate: formData.licenseExpiryDate ? new Date(formData.licenseExpiryDate) : undefined,
    };

    createMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Register Your Business
          </CardTitle>
          <p className="text-muted-foreground">
            Join as a food supplier and get AI-powered safety verification
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Store className="h-5 w-5" />
                Business Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    placeholder="e.g., Golden Palace Restaurant"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="grocery">Grocery Store</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="catering">Catering Service</SelectItem>
                      <SelectItem value="supermarket">Supermarket</SelectItem>
                      <SelectItem value="food_truck">Food Truck</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="manager@business.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Business Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1-555-0123"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Location
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="address">Complete Business Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Food Court Street, Delhi, India"
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include city name for automatic location detection
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googlePlaceId">Google Place ID (Optional)</Label>
                <Input
                  id="googlePlaceId"
                  value={formData.googlePlaceId}
                  onChange={(e) => handleInputChange("googlePlaceId", e.target.value)}
                  placeholder="ChIJd8BlQ2BZwokRAFUEcm_qrcQ"
                />
                <p className="text-xs text-muted-foreground">
                  Helps with Google review integration for better safety ratings
                </p>
              </div>
            </div>

            {/* License & Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Food Safety License
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">FSSAI/License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    placeholder="e.g., FSSAI-12345678901"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for AI safety verification
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => handleInputChange("licenseExpiryDate", e.target.value)}
                  />
                </div>
              </div>

              {/* AI Safety Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">AI Safety Analysis</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Our AI will analyze your business for safety rating based on:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• License validity and expiration</li>
                      <li>• Google reviews and ratings</li>
                      <li>• Business verification status</li>
                      <li>• Successful delivery history</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Registering..." : "Register Business"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}