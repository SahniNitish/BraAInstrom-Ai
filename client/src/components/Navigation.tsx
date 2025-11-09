import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ThemeToggle from "@/components/ThemeToggle";
import { Menu, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import foodLoopLogo from '@assets/PHOTO-2025-11-08-14-22-08_1762633632382.jpg';

export default function Navigation() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/map", label: "Find Food", icon: "🗺️" },
    { path: "/organizations", label: "Organizations", icon: "🏛️" },
    { path: "/suppliers", label: "Suppliers", icon: "🏪" },
    { path: "/notifications", label: "Notifications", icon: "🔔" },
    { path: "/admin", label: "Dashboard", icon: "⚙️" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={foodLoopLogo} alt="FoodLoop AI" className="h-10 w-10 rounded-md" />
              <span className="font-bold text-xl">FoodLoop AI</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span 
                  className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                    isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Desktop only */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search food..."
                  className="pl-9 w-64"
                />
              </div>
              
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/notifications">
                  <div className="relative">
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive">
                      3
                    </Badge>
                    <Bell className="h-5 w-5" />
                  </div>
                </Link>
              </Button>
            </div>
            
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <img src={foodLoopLogo} alt="FoodLoop AI" className="h-8 w-8 rounded-md" />
              FoodLoop AI
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 mt-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span 
                  className={`text-lg font-medium transition-colors hover:text-primary flex items-center gap-3 p-3 rounded-lg ${
                    isActive(item.path) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Mobile Search */}
          <div className="mt-6 pt-6 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food..."
                className="pl-9"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}