import React, { createContext, useContext, useEffect, useState } from "react";
import type { AuthResponse, UserProfile, UserRole, VehicleType } from "@shared/api";
import { supabase } from "@/lib/supabase";
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
    role: "passenger" | "driver";
    phone: string;
    city: string;
    national_id?: string;
    vehicle_model?: string;
    vehicle_type?: VehicleType;
    registration_number?: string;
  }) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  verifyOtp: (email: string, otpCode: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("wayfare_token"));
  const [isLoading, setIsLoading] = useState(true);

  // Sync profile from backend or Supabase
  const fetchCurrentProfile = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      } else {
        localStorage.removeItem("wayfare_token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Error loading user profile", err);
    }
    return null;
  };

  useEffect(() => {
    async function initAuth() {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          localStorage.setItem("wayfare_token", session.access_token);
          setToken(session.access_token);

          // Get profile from Supabase profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email || "",
              full_name: profile.full_name,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              role: profile.role as UserRole,
              city: profile.city,
              national_id: profile.national_id,
              rating: profile.rating,
              total_trips: profile.total_trips,
              is_verified: profile.is_verified,
              created_at: profile.created_at,
            });
          } else {
            await fetchCurrentProfile(session.access_token);
          }
        } else if (token) {
          await fetchCurrentProfile(token);
        }
      } else if (token) {
        await fetchCurrentProfile(token);
      }
      setIsLoading(false);
    }

    initAuth();

    if (supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          localStorage.setItem("wayfare_token", session.access_token);
          setToken(session.access_token);
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email || "",
              full_name: profile.full_name,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              role: profile.role as UserRole,
              city: profile.city,
              national_id: profile.national_id,
              rating: profile.rating,
              total_trips: profile.total_trips,
              is_verified: profile.is_verified,
              created_at: profile.created_at,
            });
          }
        } else {
          localStorage.removeItem("wayfare_token");
          setToken(null);
          setUser(null);
        }
      });
      return () => listener.subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          toast.error(error.message);
          return false;
        }

        if (data.session) {
          localStorage.setItem("wayfare_token", data.session.access_token);
          setToken(data.session.access_token);

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profile) {
            const userProfile: UserProfile = {
              id: profile.id,
              email: data.user.email || "",
              full_name: profile.full_name,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              role: profile.role as UserRole,
              city: profile.city,
              national_id: profile.national_id,
              rating: profile.rating,
              total_trips: profile.total_trips,
              is_verified: profile.is_verified,
              created_at: profile.created_at,
            };
            setUser(userProfile);

            if (userProfile.role === "driver" && !userProfile.is_verified) {
              toast.warning("Driver Account Pending: Your vehicle and National ID documents are currently under review by our admin team.");
            } else {
              toast.success(`Welcome back, ${userProfile.full_name}!`);
            }
          }
          return true;
        }
      }

      // Backend API fallback
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
      if (data.user.role === "driver" && !data.user.is_verified) {
        toast.warning("Driver Account Pending: Your vehicle and National ID documents are currently under review by our admin team.");
      } else {
        toast.success(`Welcome back, ${data.user.full_name}!`);
      }
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
    role: "passenger" | "driver";
    phone: string;
    city: string;
    national_id?: string;
    vehicle_model?: string;
    vehicle_type?: VehicleType;
    registration_number?: string;
  }): Promise<{ success: boolean; requiresOtp?: boolean; error?: string }> => {
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: regData.email,
          password: regData.password,
          options: {
            data: {
              full_name: regData.full_name,
              phone: regData.phone,
              city: regData.city,
              role: regData.role,
              national_id: regData.national_id,
              vehicle_model: regData.vehicle_model,
              vehicle_type: regData.vehicle_type,
              registration_number: regData.registration_number,
              seat_capacity: regData.role === "driver" ? 6 : undefined,
            },
          },
        });

        if (error) {
          toast.error(error.message);
          return { success: false, error: error.message };
        }

        // If email confirmation is required and session is not immediately returned
        if (data.user && !data.session) {
          toast.info("Verification code sent to your email. Please enter the OTP to confirm your account.");
          return { success: true, requiresOtp: true };
        }

        if (data.session) {
          localStorage.setItem("wayfare_token", data.session.access_token);
          setToken(data.session.access_token);
          toast.success("Account created successfully!");
          return { success: true, requiresOtp: false };
        }
      }

      // Backend API fallback
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data: AuthResponse & { error?: string } = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Registration failed.");
        return { success: false, error: data.error };
      }

      localStorage.setItem("wayfare_token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Account created! Welcome, ${data.user.full_name}.`);
      return { success: true, requiresOtp: false };
    } catch (err) {
      toast.error("Network error during registration.");
      return { success: false, error: "Network error" };
    }
  };

  const verifyOtp = async (email: string, otpCode: string): Promise<boolean> => {
    try {
      if (!supabase) {
        toast.error("Supabase client is not connected.");
        return false;
      }
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.session) {
        localStorage.setItem("wayfare_token", data.session.access_token);
        setToken(data.session.access_token);

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user!.id)
          .single();

        const metadata = data.user!.user_metadata ?? {};
        setUser({
          id: data.user!.id,
          email: data.user!.email || "",
          full_name: profile?.full_name || metadata.full_name || data.user!.email?.split("@")[0] || "Wayfare user",
          phone: profile?.phone || metadata.phone,
          avatar_url: profile?.avatar_url || metadata.avatar_url,
          role: (profile?.role || metadata.role || "passenger") as UserRole,
          city: profile?.city || metadata.city,
          national_id: profile?.national_id || metadata.national_id,
          rating: profile?.rating ?? 5,
          total_trips: profile?.total_trips ?? 0,
          is_verified: profile?.is_verified ?? false,
          created_at: profile?.created_at || data.user!.created_at,
        });
        toast.success("Email verified successfully! You are now logged in.");
        return true;
      }
      return false;
    } catch (err) {
      toast.error("Failed to verify OTP code.");
      return false;
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      if (!supabase) return false;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) {
        toast.error(error.message);
        return false;
      }
      toast.success("Verification code resent to your email.");
      return true;
    } catch {
      toast.error("Failed to resend code");
      return false;
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("wayfare_token");
    setToken(null);
    setUser(null);
    toast.info("You have signed out.");
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!token) return false;
    try {
      if (supabase && user) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
        if (error) {
          toast.error(error.message);
          return false;
        }
      }
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        toast.success("Profile updated successfully!");
        return true;
      }
      return false;
    } catch {
      toast.error("Network error");
      return false;
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentProfile(token);
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
        verifyOtp,
        resendOtp,
        logout,
        updateProfile,
        refreshUser,
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
