import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, Shield, Users } from "lucide-react";

interface OrganizationRegistrationProps {
  onSuccess?: () => void;
}

export default function OrganizationRegistration({ onSuccess }: OrganizationRegistrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    email: "",
    phone: "",
    address: "",
    latitude: 0,
    longitude: 0,
    licenseNumber: "",
    preferences: {
      foodTypes: [] as string[],
      maxRadius: 10,
      preferredPickupTimes: [] as string[],
    },
  });

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Your organization has been registered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
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

    createMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const toggleFoodType = (foodType: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        foodTypes: prev.preferences.foodTypes.includes(foodType)
          ? prev.preferences.foodTypes.filter(type => type !== foodType)
          : [...prev.preferences.foodTypes, foodType],
      },
    }));
  };

  const togglePickupTime = (time: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        preferredPickupTimes: prev.preferences.preferredPickupTimes.includes(time)
          ? prev.preferences.preferredPickupTimes.filter(t => t !== time)
          : [...prev.preferences.preferredPickupTimes, time],
      },
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            Register Your Organization
          </CardTitle>
          <p className="text-muted-foreground">
            Join our network to receive notifications about surplus food in your area
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Food for All NGO"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Organization Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="food_bank">Food Bank</SelectItem>
                      <SelectItem value="home_care">Home Care / Senior Center</SelectItem>
                      <SelectItem value="shelter">Homeless Shelter</SelectItem>
                      <SelectItem value="community">Community Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@organization.org"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
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
                Location
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street, Delhi, India"
                  rows={3}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include city name for automatic location detection
                </p>
              </div>
            </div>

            {/* Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="license">License/Registration Number</Label>
                <Input
                  id="license"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  placeholder="e.g., NGO-2023-001"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Helps with faster verification
                </p>
              </div>
            </div>

            {/* Food Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Food Preferences</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Food Types We Accept</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["cooked", "packaged", "fresh", "canned", "dry", "frozen", "soft"].map((type) => (
                      <Badge
                        key={type}
                        variant={formData.preferences.foodTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFoodType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="radius">Maximum Pickup Radius (km)</Label>
                  <Select 
                    value={formData.preferences.maxRadius.toString()} 
                    onValueChange={(value) => handlePreferenceChange("maxRadius", parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="15">15 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Preferred Pickup Times</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["morning", "afternoon", "evening", "night"].map((time) => (
                      <Badge
                        key={time}
                        variant={formData.preferences.preferredPickupTimes.includes(time) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => togglePickupTime(time)}
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Registering..." : "Register Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}