import type { 
  FoodListing, 
  InsertFoodListing, 
  Organization, 
  InsertOrganization, 
  Supplier, 
  InsertSupplier, 
  Notification 
} from "@shared/schema";

export async function getFoodListings(): Promise<FoodListing[]> {
  const response = await fetch("/api/food-listings");
  if (!response.ok) {
    throw new Error("Failed to fetch food listings");
  }
  return response.json();
}

export async function getFoodListing(id: string): Promise<FoodListing> {
  const response = await fetch(`/api/food-listings/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch food listing");
  }
  return response.json();
}

export async function createFoodListing(data: InsertFoodListing & { image?: File }): Promise<FoodListing> {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else if (value !== undefined && value !== null) {
      if (typeof value === "object" && !(value instanceof Date)) {
        formData.append(key, JSON.stringify(value));
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, value.toString());
      }
    }
  });

  const response = await fetch("/api/food-listings", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create food listing");
  }

  return response.json();
}

export async function updateFoodListing(id: string, updates: Partial<FoodListing>): Promise<FoodListing> {
  const response = await fetch(`/api/food-listings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update food listing");
  }

  return response.json();
}

export async function deleteFoodListing(id: string): Promise<void> {
  const response = await fetch(`/api/food-listings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete food listing");
  }
}

// Organization APIs
export async function getOrganizations(type?: string): Promise<Organization[]> {
  const url = type ? `/api/organizations?type=${type}` : "/api/organizations";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch organizations");
  }
  return response.json();
}

export async function getOrganization(id: string): Promise<Organization> {
  const response = await fetch(`/api/organizations/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch organization");
  }
  return response.json();
}

export async function createOrganization(data: InsertOrganization): Promise<Organization> {
  const response = await fetch("/api/organizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create organization");
  }

  return response.json();
}

// Supplier APIs
export async function getSuppliers(): Promise<Supplier[]> {
  const response = await fetch("/api/suppliers");
  if (!response.ok) {
    throw new Error("Failed to fetch suppliers");
  }
  return response.json();
}

export async function getSupplier(id: string): Promise<Supplier> {
  const response = await fetch(`/api/suppliers/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch supplier");
  }
  return response.json();
}

export async function getSupplierByUserId(userId: string): Promise<Supplier> {
  const response = await fetch(`/api/suppliers/user/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch supplier for user");
  }
  return response.json();
}

export async function createSupplier(data: InsertSupplier): Promise<Supplier> {
  const response = await fetch("/api/suppliers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create supplier");
  }

  return response.json();
}

// AI Supplier Analysis
export interface SupplierAnalysis {
  supplierId: string;
  businessName: string;
  safetyRating: number;
  verification: {
    licenseValid: boolean;
    licenseNumber?: string;
    licenseExpiryDate?: string;
    verificationStatus: string;
  };
  performance: {
    totalListings: number;
    successfulDeliveries: number;
    successRate: number;
  };
  reputation: {
    googleRating?: number;
    googlePlaceId?: string;
    accountAge: number;
  };
  riskFactors: string[];
  recommendations: string[];
}

export async function getSupplierAnalysis(id: string): Promise<SupplierAnalysis> {
  const response = await fetch(`/api/suppliers/${id}/analysis`);
  if (!response.ok) {
    throw new Error("Failed to get supplier analysis");
  }
  return response.json();
}

// Notification APIs
export async function getNotifications(orgId: string): Promise<Notification[]> {
  const response = await fetch(`/api/notifications/${orgId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }
}

// Chat API (existing)
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<ChatMessage> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Failed to send chat message");
  }

  const data = await response.json();
  return data.message;
}
