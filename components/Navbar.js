"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, User, X, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { database } from "@/lib/database";

export default function Navbar() {
  const { user, loading, login, signUp, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client"); // 'client' | 'organizer'
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Collaborative lighting states
  const [activeBooking, setActiveBooking] = useState(null);
  const [lightingMode, setLightingMode] = useState("laser_sweep");
  const [showLightingMenu, setShowLightingMenu] = useState(false);

  useEffect(() => {
    if (user) {
      database.getBookings(user.email).then((bookings) => {
        if (bookings && bookings.length > 0) {
          setActiveBooking(bookings[0]);
          const stored = localStorage.getItem(`luxe_lighting_${bookings[0].eventId}`);
          if (stored) {
            setLightingMode(stored);
          } else {
            const globalStored = localStorage.getItem("luxe_global_atmosphere") || "laser_sweep";
            setLightingMode(globalStored);
          }
        } else {
          setActiveBooking(null);
          const globalStored = localStorage.getItem("luxe_global_atmosphere") || "laser_sweep";
          setLightingMode(globalStored);
        }
      });
    } else {
      setActiveBooking(null);
      const globalStored = localStorage.getItem("luxe_global_atmosphere") || "laser_sweep";
      setLightingMode(globalStored);
    }
  }, [user]);

  useEffect(() => {
    const channelName = activeBooking
      ? `luxe_lighting_${activeBooking.eventId}`
      : "luxe_global_atmosphere";
    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (event) => {
      if (event.data && event.data.type === "LIGHTING_CHANGE") {
        setLightingMode(event.data.mode);
      }
    };
    return () => channel.close();
  }, [activeBooking]);

  useEffect(() => {
    if (lightingMode) {
      document.documentElement.setAttribute("data-atmosphere", lightingMode);
    } else {
      document.documentElement.removeAttribute("data-atmosphere");
    }
  }, [lightingMode]);

  const changeLightingMode = (mode) => {
    setLightingMode(mode);
    if (activeBooking) {
      localStorage.setItem(`luxe_lighting_${activeBooking.eventId}`, mode);
      const channel = new BroadcastChannel(`luxe_lighting_${activeBooking.eventId}`);
      channel.postMessage({ type: "LIGHTING_CHANGE", mode });
      channel.close();
    } else {
      localStorage.setItem("luxe_global_atmosphere", mode);
      const channel = new BroadcastChannel("luxe_global_atmosphere");
      channel.postMessage({ type: "LIGHTING_CHANGE", mode });
      channel.close();
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error("Name is required");
        await signUp(name, email, password, role);
      } else {
        await login(email, password);
      }
      setModalOpen(false);
      // Reset form
      setEmail("");
      setPassword("");
      setName("");
      setRole("client");
    } catch (err) {
      setError(err.message || "Authentication failed. Check your inputs.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      <header className="glass-panel" style={{
        position: "sticky",
        top: "16px",
        zIndex: 100,
        margin: "0 24px",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: "30px",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        marginTop: "16px"
      }}>
        {/* Brand Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.6rem",
            fontWeight: "700",
            letterSpacing: "1px",
            background: "linear-gradient(135deg, #f3e5ab 0%, #d4af37 50%, #aa8010 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>LUXE</span>
          <span style={{
            fontSize: "0.8rem",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "3px",
            color: "var(--text-secondary)",
            marginTop: "4px"
          }}>Events</span>
        </Link>
        
        {/* Navigation Links */}
        <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Link href="/" style={{
            fontSize: "0.95rem",
            fontWeight: "500",
            color: "var(--text-secondary)",
            transition: "color 0.3s"
          }} className="nav-link">
            {database.translate("discover", user?.language)}
          </Link>
          
          {(!user || user.role === "client") && (
            <Link href="/dashboard/attendee" style={{
              fontSize: "0.95rem",
              fontWeight: "500",
              color: "var(--text-secondary)",
              transition: "color 0.3s"
            }} className="nav-link">
              {database.translate("myTickets", user?.language)}
            </Link>
          )}
          
          {(!user || user.role === "organizer") && (
            <Link href="/dashboard/organizer" style={{
              fontSize: "0.95rem",
              fontWeight: "500",
              color: "var(--text-secondary)",
              transition: "color 0.3s"
            }} className="nav-link">
              {database.translate("organizerPanel", user?.language)}
            </Link>
          )}

          <Link href="/help" style={{
            fontSize: "0.95rem",
            fontWeight: "500",
            color: "var(--text-secondary)",
            transition: "color 0.3s"
          }} className="nav-link">
            {database.translate("help", user?.language)}
          </Link>
        </nav>
        
        {/* Auth section */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {loading ? (
            <div style={{ width: "80px", height: "30px", background: "rgba(255,255,255,0.03)", borderRadius: "15px" }} className="shimmer-bg"></div>
          ) : user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Profile badge (Clickable to settings) */}
              <Link href="/dashboard/settings" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--glass-bg-accent)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-accent)",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }} className="profile-badge-link nav-link">
                  {user.logo ? (
                    <img 
                      src={user.logo} 
                      alt="Logo" 
                      style={{ width: "16px", height: "16px", borderRadius: "50%", objectFit: "cover" }} 
                    />
                  ) : (
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#d4af37"
                    }}></div>
                  )}
                  <span style={{ fontSize: "0.85rem", fontWeight: "500", color: "var(--text-primary)" }}>
                    {user.name}
                  </span>
                </div>
              </Link>

              {/* Collaborative Lighting Controller (Floating menu) */}
              {user && (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowLightingMenu(!showLightingMenu)}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "20px",
                      padding: "6px 14px",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    className="nav-link"
                  >
                    <Sparkles size={14} color={
                      lightingMode === "laser_sweep" ? "#a855f7" :
                      lightingMode === "golden_nebula" ? "#d4af37" :
                      lightingMode === "neon_pulse" ? "#ec4899" : "#0d9488"
                    } />
                    <span>Atmosphere</span>
                  </button>
                  
                  {showLightingMenu && (
                    <div className="glass-panel" style={{
                      position: "absolute",
                      top: "36px",
                      right: 0,
                      width: "180px",
                      padding: "10px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      background: "rgba(6, 8, 19, 0.95)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      zIndex: 200,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                    }}>
                      <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", padding: "4px 8px", fontWeight: "700" }}>Set Lighting Mode</span>
                      {[
                        { id: "laser_sweep", label: "Laser Sweep", color: "#a855f7" },
                        { id: "golden_nebula", label: "Golden Nebula", color: "#d4af37" },
                        { id: "neon_pulse", label: "Neon Pulse", color: "#ec4899" },
                        { id: "deep_ocean", label: "Deep Ocean", color: "#0d9488" }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => {
                            changeLightingMode(mode.id);
                            setShowLightingMenu(false);
                          }}
                          style={{
                            background: lightingMode === mode.id ? "rgba(255, 255, 255, 0.05)" : "transparent",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px 10px",
                            color: lightingMode === mode.id ? "#fff" : "var(--text-secondary)",
                            fontSize: "0.85rem",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s"
                          }}
                          className="nav-link"
                        >
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: mode.color }} />
                          <span>{mode.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Link href="/dashboard/settings" style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.85rem",
                textDecoration: "none",
                transition: "color 0.3s"
              }} className="nav-link">
                <User size={14} /> {database.translate("settings", user?.language)}
              </Link>
              
              <button 
                onClick={logout}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.85rem"
                }}
                className="nav-link"
              >
                <LogOut size={14} /> {database.translate("signOut", user?.language)}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setError(""); setModalOpen(true); }}
              className="btn-primary" 
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <LogIn size={14} /> {database.translate("accessPlatform", user?.language)}
            </button>
          )}
        </div>
      </header>

      {/* Floating Glassmorphic Authentication Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(6, 8, 19, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}>
          <div 
            className="glass-panel-gold" 
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "40px 32px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              animation: "modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "1px" }}>Secure Entry</span>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", fontWeight: "700", marginTop: "4px" }}>
                  {isSignUp ? "Create Profile" : "Portal Access"}
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer"
                }}
                className="nav-link"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #ef4444",
                color: "#ef4444",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                marginBottom: "20px"
              }}>
                {error}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {isSignUp && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "8px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Account Type</label>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      background: "rgba(255, 255, 255, 0.03)",
                      padding: "4px",
                      borderRadius: "12px",
                      border: "1px solid rgba(255, 255, 255, 0.05)"
                    }}>
                      <button
                        type="button"
                        onClick={() => setRole("client")}
                        style={{
                          background: role === "client" ? "var(--accent-gold)" : "transparent",
                          color: role === "client" ? "#000" : "var(--text-secondary)",
                          border: "none",
                          padding: "8px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        Client / Attendee
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("organizer")}
                        style={{
                          background: role === "organizer" ? "var(--accent-gold)" : "transparent",
                          color: role === "organizer" ? "#000" : "var(--text-secondary)",
                          border: "none",
                          padding: "8px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        Event Organizer
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Username</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter your name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input" 
                    />
                  </div>
                </>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@domain.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input" 
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Access Key / Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input" 
                />
              </div>

              <button 
                type="submit" 
                disabled={authLoading}
                className="btn-primary" 
                style={{
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontWeight: "600",
                  marginTop: "12px"
                }}
              >
                {authLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <KeyRound size={16} /> {isSignUp ? "Initialize Profile" : "Unlock Portal"}
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", marginTop: "24px", textAlign: "center" }}>
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
                className="nav-link"
              >
                {isSignUp ? "Already registered? Sign In" : "Need a premium profile? Register here"}
              </button>
            </div>
            
            <p style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              marginTop: "16px"
            }}>
              <ShieldCheck size={11} color="var(--accent-gold)" /> Secure Sandbox Mode Enabled.
            </p>
          </div>
        </div>
      )}

      {/* Modal Animation */}
      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
