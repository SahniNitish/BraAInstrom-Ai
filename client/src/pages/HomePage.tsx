import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getFoodListings, updateFoodListing } from "@/lib/api";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FoodListingCard from "@/components/FoodListingCard";
import MapView from "@/components/MapView";
import ImpactDashboard from "@/components/ImpactDashboard";
import PostFoodForm from "@/components/PostFoodForm";
import AIAssistantChat from "@/components/AIAssistantChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function HomePage() {
  const { toast } = useToast();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const { data: foodListings, isLoading } = useQuery({
    queryKey: ["/api/food-listings"],
    queryFn: getFoodListings,
  });

  const handleClaimFood = async (id: string) => {
    try {
      await updateFoodListing(id, { status: "claimed" });
      toast({
        title: "Food claimed!",
        description: "You've successfully claimed this food item.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/food-listings"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim food item",
        variant: "destructive",
      });
    }
  };

  const formatPickupTime = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    };
    return `${new Date(start).toLocaleDateString('en-US', options)} - ${new Date(end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const mapLocations = [
    { id: "1", name: "Downtown Food Bank", type: "food_bank" as const, latitude: 40.7128, longitude: -74.0060 },
    { id: "2", name: "Community Fridge #1", type: "community_fridge" as const, latitude: 40.7580, longitude: -73.9855 },
    ...(foodListings || []).map(listing => ({
      id: listing.id,
      name: listing.title,
      type: "food_listing" as const,
      latitude: listing.latitude,
      longitude: listing.longitude,
      freshnessScore: listing.freshnessScore,
    })),
  ];

  const impactStats = {
    mealsProvided: (foodListings?.length || 0) * 15,
    poundsSaved: (foodListings?.length || 0) * 25,
    co2Prevented: (foodListings?.length || 0) * 10,
    itemsRescued: foodListings?.length || 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <HeroSection
          onPostFood={() => setShowPostForm(true)}
          onFindFood={() => window.location.href = '/map'}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Available Food Section */}
          <section id="food-listings">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Available Food</h2>
                <p className="text-muted-foreground">Fresh surplus food in your area</p>
              </div>
              <Button onClick={() => setShowPostForm(true)}>
                <span className="material-icons text-sm mr-2">add_circle</span>
                Post Food
              </Button>
            </div>

            <Tabs defaultValue="list" className="mb-6">
              <TabsList>
                <TabsTrigger value="list">
                  <span className="material-icons text-sm mr-2">view_list</span>
                  List View
                </TabsTrigger>
                <TabsTrigger value="map">
                  <span className="material-icons text-sm mr-2">map</span>
                  Map View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : foodListings && foodListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foodListings.slice(0, 6).map((listing) => (
                      <FoodListingCard
                        key={listing.id}
                        id={listing.id}
                        title={listing.title}
                        quantity={listing.quantity}
                        imageUrl={listing.imageUrl || undefined}
                        location={listing.location}
                        pickupTime={formatPickupTime(listing.pickupTimeStart, listing.pickupTimeEnd)}
                        freshnessScore={listing.freshnessScore}
                        defects={listing.defectsDetected || []}
                        onClaim={handleClaimFood}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">restaurant</span>
                    <p className="text-xl text-muted-foreground mb-4">No food listings yet</p>
                    <Button onClick={() => setShowPostForm(true)}>
                      <span className="material-icons text-sm mr-2">add_circle</span>
                      Post the first listing
                    </Button>
                  </div>
                )}
                
                {foodListings && foodListings.length > 6 && (
                  <div className="text-center mt-6">
                    <Button variant="outline" asChild>
                      <Link href="/map">
                        View All {foodListings.length} Listings
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="map" className="mt-6">
                <MapView locations={mapLocations} />
              </TabsContent>
            </Tabs>
          </section>

          {/* Impact Dashboard */}
          <section>
            <ImpactDashboard stats={impactStats} />
          </section>

          {/* Quick Links */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/organizations">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-4">🏛️</div>
                  <h3 className="font-semibold mb-2">Organizations</h3>
                  <p className="text-sm text-muted-foreground">
                    Register NGOs and view all registered organizations
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/suppliers">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-4">🏪</div>
                  <h3 className="font-semibold mb-2">Suppliers</h3>
                  <p className="text-sm text-muted-foreground">
                    View businesses with AI safety ratings and analysis
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/notifications">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-4">🔔</div>
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time alerts for food availability near you
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="font-semibold mb-2">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    System overview and management panel
                  </p>
                </CardContent>
              </Card>
            </Link>
          </section>

          {/* Features Overview */}
          <section className="bg-muted/50 rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">How FoodLoop AI Works</h2>
              <p className="text-muted-foreground text-lg">
                Connecting surplus food with those in need through AI-powered technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🍎</div>
                <h3 className="font-semibold mb-2">Post Food</h3>
                <p className="text-sm text-muted-foreground">
                  Restaurants and suppliers post surplus food with AI quality analysis
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl mb-4">🔔</div>
                <h3 className="font-semibold mb-2">Auto Notify</h3>
                <p className="text-sm text-muted-foreground">
                  Nearby NGOs and organizations get instant notifications
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="font-semibold mb-2">AI Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Suppliers get safety ratings based on licenses and reviews
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2025 FoodLoop AI. Reducing food waste through intelligent redistribution.
            </p>
          </div>
        </div>
      </footer>

      {/* Post Food Dialog */}
      <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Post Food</DialogTitle>
          </DialogHeader>
          <PostFoodForm 
            onSuccess={() => {
              setShowPostForm(false);
              queryClient.invalidateQueries({ queryKey: ["/api/food-listings"] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* AI Chat */}
      {showChat && (
        <div className="fixed bottom-24 right-4 z-50 shadow-xl">
          <AIAssistantChat onClose={() => setShowChat(false)} />
        </div>
      )}

      <Button
        size="lg"
        className="fixed bottom-4 right-4 z-40 rounded-full h-14 w-14 shadow-lg"
        onClick={() => setShowChat(!showChat)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}