import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthResponse, UserProfile, UserRole, VehicleType } from "@shared/api";
import { toast } from "sonner";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    city?: string;
    vehicle_model?: string;
    vehicle_type?: VehicleType;
    registration_number?: string;
  }) => Promise<boolean>;
  logout: () => void;
  demoLogin: (role: "passenger" | "driver" | "admin") => Promise<boolean>;
  switchRole: (role: UserRole) => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("wayfare_token"));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token invalid
          localStorage.removeItem("wayfare_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load user session", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data: AuthResponse & { error?: string } = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Login failed. Please check your credentials.");
        return false;
      }

      localStorage.setItem("wayfare_token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.full_name}!`);
      return true;
    } catch (err) {
      toast.error("Network error during login.");
      return false;
    }
  };

  const register = async (regData: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    city?: string;
    vehicle_model?: string;
    vehicle_type?: VehicleType;
    registration_number?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data: AuthResponse & { error?: string } = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Registration failed.");
        return false;
      }

      localStorage.setItem("wayfare_token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Account created! Welcome to Wayfare, ${data.user.full_name}.`);
      return true;
    } catch (err) {
      toast.error("Network error during registration.");
      return false;
    }
  };

  const demoLogin = async (role: "passenger" | "driver" | "admin"): Promise<boolean> => {
    let email = "passenger@wayfare.com";
    let password = "password123";

    if (role === "driver") {
      email = "driver@wayfare.com";
      password = "password123";
    } else if (role === "admin") {
      email = "admin@wayfare.com";
      password = "admin123";
    }

    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("wayfare_token");
    setToken(null);
    setUser(null);
    toast.info("You have signed out.");
  };

  const switchRole = async (targetRole: UserRole): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to switch role");
        return false;
      }
      setUser(data.user);
      toast.success(`Active role switched to ${targetRole.toUpperCase()}`);
      return true;
    } catch (err) {
      toast.error("Failed to switch role");
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Update failed");
        return false;
      }
      setUser(data.user);
      toast.success("Profile updated successfully!");
      return true;
    } catch (err) {
      toast.error("Network error");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        demoLogin,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
