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
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Instant load from localStorage if available
          const savedUser = localStorage.getItem("luxe_current_user");
          let role = "client";
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              if (parsed.email === firebaseUser.email && parsed.role) {
                role = parsed.role;
              }
            } catch (e) {
              console.error(e);
            }
          } else {
            if (firebaseUser.email.includes("admin") || firebaseUser.email.includes("organizer") || firebaseUser.email.endsWith("@luxe.admin")) {
              role = "organizer";
            }
          }

          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            role: role
          });
          setLoading(false);

          // Fetch full database profile
          try {
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            if (db) {
              const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
              if (docSnap.exists()) {
                const data = docSnap.data();
                const mergedUser = {
                  uid: firebaseUser.uid,
                  name: data.name || firebaseUser.displayName || firebaseUser.email.split("@")[0],
                  email: firebaseUser.email,
                  role: data.role || role,
                  ...data
                };
                setUser(mergedUser);
                localStorage.setItem("luxe_current_user", JSON.stringify(mergedUser));
              }
            }
          } catch (err) {
            console.error("Firestore user profile fetch failed:", err);
          }
        } else {
          setUser(null);
          setLoading(false);
        }
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
          role: "organizer",
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
          const upgradedUser = { ...defaultUser, ...parsed };
          if (upgradedUser.role === "user") {
            upgradedUser.role = "organizer";
          }
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

  // Dynamically apply active theme mode to document root
  useEffect(() => {
    const activeTheme = user?.theme || "dark";
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [user]);

  // Login action
  const login = async (email, password) => {
    if (isRealFirebase && auth) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const savedUser = localStorage.getItem("luxe_current_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === email) {
          setUser(parsed);
          return parsed;
        }
      }
      const userObj = {
        uid: result.user.uid,
        name: result.user.displayName || email.split("@")[0],
        email: email,
        role: email.includes("admin") || email.endsWith("@luxe.admin") ? "organizer" : "client"
      };
      localStorage.setItem("luxe_current_user", JSON.stringify(userObj));
      setUser(userObj);
      return userObj;
    } else {
      // Mock login
      if (email === "julian@luxe.design") {
        const defaultUser = {
          uid: "mock-user-123",
          name: "Julian Sterling",
          email: "julian@luxe.design",
          role: "organizer",
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
        localStorage.setItem("luxe_current_user", JSON.stringify(defaultUser));
        setUser(defaultUser);
        return defaultUser;
      }

      const mockUser = {
        uid: "mock-user-" + Math.floor(Math.random() * 10000),
        name: email.split("@")[0],
        email: email,
        role: email.includes("admin") || email.includes("organizer") || email.endsWith("@luxe.admin") ? "organizer" : "client",
        language: "en",
        currency: "CAD",
        theme: "dark"
      };
      
      const roleFields = mockUser.role === "organizer" ? {
        subscription: "Pro",
        billingCycle: "monthly",
        logo: null,
        businessName: `${mockUser.name} Events`,
        businessAddress: "120 Pine St, Toronto, ON, Canada",
        taxId: "GST-881273912-RT0001",
        website: "https://luxe.design",
        emailMarketing: true,
        checkInAlerts: true
      } : {
        subscription: "Free",
        billingCycle: "monthly",
        emailMarketing: true,
        checkInAlerts: false
      };

      const finalUser = { ...mockUser, ...roleFields };
      localStorage.setItem("luxe_current_user", JSON.stringify(finalUser));
      setUser(finalUser);
      return finalUser;
    }
  };

  // Sign up action
  const signUp = async (name, email, password, role = "client") => {
    if (isRealFirebase && auth) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      const userObj = {
        uid: result.user.uid,
        name: name,
        email: email,
        role: role
      };

      // Save role/profile to Cloud Firestore
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        if (db) {
          await setDoc(doc(db, "users", result.user.uid), userObj);
        }
      } catch (err) {
        console.error("Firestore user profile save failed:", err);
      }

      localStorage.setItem("luxe_current_user", JSON.stringify(userObj));
      setUser(userObj);
      return result.user;
    } else {
      // Mock sign up
      const baseUser = {
        uid: "mock-user-" + Math.floor(Math.random() * 10000),
        name,
        email,
        role: role,
        language: "en",
        currency: "CAD",
        theme: "dark"
      };

      let defaultRoleFields = {};
      if (role === "organizer") {
        defaultRoleFields = {
          subscription: "Pro",
          billingCycle: "monthly",
          logo: null,
          businessName: `${name} Productions`,
          businessAddress: "100 Gold St, Toronto, ON, Canada",
          taxId: "GST-999999999-RT0001",
          website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
          emailMarketing: true,
          checkInAlerts: true
        };
      } else {
        defaultRoleFields = {
          subscription: "Free",
          billingCycle: "monthly",
          emailMarketing: true,
          checkInAlerts: false
        };
      }

      const mockUser = { ...baseUser, ...defaultRoleFields };
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
        // Save to Firestore
        const { doc, setDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        if (db) {
          await setDoc(doc(db, "users", auth.currentUser.uid), fields, { merge: true });
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
