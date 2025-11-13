/**
 * API Client for NutriWise Backend
 */
import { supabase } from "./supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    // Try Supabase session first (from Frontend_final)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return session.access_token;
      }
    } catch (e) {
      // Fallback to localStorage (for backward compatibility)
    }
    
    // Fallback to localStorage
    return localStorage.getItem("accessToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Onboarding
  async completeOnboarding(data: any) {
    return this.request("/onboarding/complete", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request("/onboarding/profile");
  }

  async parseNaturalLanguage(message: string) {
    return this.request("/onboarding/natural-language", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  // Meal Plans
  async createMealPlan(data: {
    budget: number;
    calorieTarget: number;
    dietaryPreferences: string[];
    healthGoals: string[];
    allergies?: string[];
    durationDays?: number;
    region?: string;
  }, naturalLanguage?: string) {
    const body: any = data;
    if (naturalLanguage) {
      body.naturalLanguage = naturalLanguage;
    }
    return this.request("/meal-plans", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getMealPlans() {
    return this.request("/meal-plans");
  }

  async getMealPlan(id: string) {
    return this.request(`/meal-plans/${id}`);
  }

  async regenerateMealPlan(id: string, data: any) {
    return this.request(`/meal-plans/${id}/regenerate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getGroceryList(mealPlanId: string) {
    return this.request(`/meal-plans/${mealPlanId}/grocery-list`);
  }

  // Config
  async getPlanConfig() {
    return this.request("/config/plan");
  }

  // Auth helpers (for backward compatibility)
  setAuthToken(token: string) {
    localStorage.setItem("accessToken", token);
  }

  clearAuthToken() {
    localStorage.removeItem("accessToken");
    // Also sign out from Supabase
    supabase.auth.signOut().catch(() => {});
  }
}

export const apiClient = new ApiClient();

