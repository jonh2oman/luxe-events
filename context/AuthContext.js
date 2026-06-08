"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { isRealFirebase, auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isRealFirebase && auth) {
      // Listen to real Firebase auth changes
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            role: firebaseUser.email.endsWith("@luxe.admin") ? "admin" : "user"
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // LocalStorage Mock Auth Session
      const checkMockAuth = () => {
        const currentUser = localStorage.getItem("luxe_current_user");
        const defaultUser = {
          uid: "mock-user-123",
          name: "Julian Sterling",
          email: "julian@luxe.design",
          role: "user",
          language: "en",
          currency: "CAD",
          theme: "dark",
          subscription: "Pro",
          billingCycle: "monthly",
          logo: null,
          businessName: "Luxe Events Ltd",
          businessAddress: "120 Pine St, Toronto, ON, Canada",
          taxId: "GST-881273912-RT0001",
          website: "https://luxe.design",
          emailMarketing: true,
          checkInAlerts: true
        };

        if (currentUser) {
          const parsed = JSON.parse(currentUser);
          // Upgrade profile with default fields if missing
          const upgradedUser = { ...defaultUser, ...parsed };
          localStorage.setItem("luxe_current_user", JSON.stringify(upgradedUser));
          setUser(upgradedUser);
        } else {
          localStorage.setItem("luxe_current_user", JSON.stringify(defaultUser));
          setUser(defaultUser);
        }
        setLoading(false);
      };
      
      checkMockAuth();
    }
  }, []);

  // Login action
  const login = async (email, password) => {
    if (isRealFirebase && auth) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } else {
      // Mock login
      const mockUser = {
        uid: "mock-user-" + Math.floor(Math.random() * 10000),
        name: email.split("@")[0],
        email: email,
        role: email.includes("admin") || email.endsWith("@luxe.admin") ? "admin" : "user"
      };
      localStorage.setItem("luxe_current_user", JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  // Sign up action
  const signUp = async (name, email, password) => {
    if (isRealFirebase && auth) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      return result.user;
    } else {
      // Mock sign up
      const mockUser = {
        uid: "mock-user-" + Math.floor(Math.random() * 10000),
        name,
        email,
        role: email.includes("admin") || email.endsWith("@luxe.admin") ? "admin" : "user"
      };
      localStorage.setItem("luxe_current_user", JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  // Logout action
  const logout = async () => {
    if (isRealFirebase && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem("luxe_current_user");
      setUser(null);
    }
  };

  // Update profile fields
  const updateProfileFields = async (fields) => {
    const updatedUser = { ...user, ...fields };
    if (isRealFirebase && auth && auth.currentUser) {
      try {
        if (fields.name) {
          await updateProfile(auth.currentUser, { displayName: fields.name });
        }
      } catch (err) {
        console.error("Firebase profile update failed:", err);
      }
    }
    localStorage.setItem("luxe_current_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateProfileFields }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
