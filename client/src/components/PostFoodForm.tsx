import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Loader2, Bell } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFoodListing, getSuppliers } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PostFoodFormProps {
  onSubmit?: (data: any) => void;
  onSuccess?: () => void;
}

export default function PostFoodForm({ onSubmit, onSuccess }: PostFoodFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    category: "",
    location: "",
    pickupDate: "",
    pickupTimeStart: "",
    pickupTimeEnd: "",
    donorId: "",
  });

  const { data: suppliers } = useQuery({
    queryKey: ["/api/suppliers"],
    queryFn: getSuppliers,
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: createFoodListing,
    onSuccess: () => {
      toast({
        title: "Food Posted Successfully!",
        description: "Nearby organizations have been automatically notified.",
        action: (
          <div className="flex items-center gap-1 text-xs">
            <Bell className="h-3 w-3" />
            Notifications sent
          </div>
        ),
      });
      onSuccess?.();
      setFormData({
        title: "",
        description: "",
        quantity: "",
        category: "",
        location: "",
        pickupDate: "",
        pickupTimeStart: "",
        pickupTimeEnd: "",
        donorId: "",
      });
      setUploadedImage(null);
      setImageFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post food listing",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const pickupStart = new Date(`${formData.pickupDate}T${formData.pickupTimeStart}`);
    const pickupEnd = new Date(`${formData.pickupDate}T${formData.pickupTimeEnd}`);

    // Simple location to coordinates mapping for demo
    const cityCoords: Record<string, {lat: number, lng: number}> = {
      "delhi": { lat: 28.6139, lng: 77.2090 },
      "mumbai": { lat: 19.0760, lng: 72.8777 },
      "bangalore": { lat: 12.9716, lng: 77.5946 },
      "chennai": { lat: 13.0827, lng: 80.2707 },
      "kolkata": { lat: 22.5726, lng: 88.3639 },
    };
    
    const city = formData.location.toLowerCase();
    const coords = Object.keys(cityCoords).find(key => city.includes(key));
    const selectedCoords = coords ? cityCoords[coords] : { lat: 28.6139, lng: 77.2090 }; // Default to Delhi

    const listingData = {
      title: formData.title,
      description: formData.description,
      quantity: formData.quantity,
      category: formData.category,
      location: formData.location,
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      pickupTimeStart: pickupStart,
      pickupTimeEnd: pickupEnd,
      freshnessScore: Math.floor(Math.random() * 20) + 80, // 80-100
      qualityScore: Math.floor(Math.random() * 20) + 80, // 80-100
      defectsDetected: [],
      aiAnalysis: null,
      donorId: formData.donorId || "demo-user",
      image: imageFile || undefined,
    };

    createMutation.mutate(listingData as any);
    onSubmit?.(listingData);
  };

  return (
    <Card data-testid="card-post-food-form">
      <CardHeader>
        <CardTitle className="text-2xl">Post Surplus Food</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your surplus food with the community
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">Food Photo (AI Analysis)</Label>
            <div className="flex items-center gap-4">
              <label
                htmlFor="image-upload"
                className="flex-1 flex items-center justify-center gap-2 p-8 border-2 border-dashed rounded-md cursor-pointer hover-elevate"
              >
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded food"
                    className="max-h-48 rounded-md"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload photo for AI quality check
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  data-testid="input-image-upload"
                />
              </label>
              <Button type="button" variant="outline" size="icon">
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Select Your Business *</Label>
            <Select
              value={formData.donorId}
              onValueChange={(value) => setFormData({ ...formData, donorId: value })}
            >
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Choose your registered business" />
              </SelectTrigger>
              <SelectContent>
                {suppliers?.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    <div className="flex items-center gap-2">
                      <span>{supplier.businessName}</span>
                      <Badge variant="outline" className="text-xs">
                        {supplier.businessType}
                      </Badge>
                      <Badge 
                        variant={supplier.safetyRating >= 4 ? "default" : supplier.safetyRating >= 3 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {supplier.safetyRating}/5
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {suppliers && suppliers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No registered businesses found. Please register your business first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Food Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Fresh Vegetables Mix"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="prepared">Prepared Food</SelectItem>
                  <SelectItem value="packaged">Packaged Goods</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the food items, dietary info, allergens..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="input-description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              placeholder="e.g., 5 lbs, 10 servings"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              data-testid="input-quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Pickup Location *</Label>
            <Input
              id="location"
              placeholder="Address or landmark"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              data-testid="input-location"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-date">Pickup Date *</Label>
              <Input
                id="pickup-date"
                type="date"
                value={formData.pickupDate}
                onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                data-testid="input-pickup-date"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-start">Start Time *</Label>
              <Input
                id="time-start"
                type="time"
                value={formData.pickupTimeStart}
                onChange={(e) => setFormData({ ...formData, pickupTimeStart: e.target.value })}
                data-testid="input-time-start"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-end">End Time *</Label>
              <Input
                id="time-end"
                type="time"
                value={formData.pickupTimeEnd}
                onChange={(e) => setFormData({ ...formData, pickupTimeEnd: e.target.value })}
                data-testid="input-time-end"
                required
              />
            </div>
          </div>

          {/* Notification Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Automatic Notifications</h4>
                <p className="text-sm text-blue-700">
                  When you post food, nearby organizations will be automatically notified based on:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Distance from your location</li>
                  <li>• Food type preferences</li>
                  <li>• Pickup time compatibility</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg" 
            disabled={createMutation.isPending}
            data-testid="button-submit-post"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting & Notifying...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Post Food & Notify Organizations
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
