"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { database } from "@/lib/database";
import { 
  User, Globe, CreditCard, Sliders, Upload, Check, FileText, 
  Building, Mail, MapPin, Globe2, ShieldCheck, CheckCircle2, AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const { user, loading, login, signUp, updateProfileFields } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'localization' | 'billing' | 'preferences'
  
  // Auth Gate states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState(null);

  // Billing credit card form state
  const [cardName, setCardName] = useState("Julian Sterling");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("•••");
  const [editingCard, setEditingCard] = useState(false);

  // UI state
  const [saveStatus, setSaveStatus] = useState(""); // 'saving' | 'success' | ''
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' | 'yearly'

  // Initialize form fields when user is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBusinessName(user.businessName || "");
      setBusinessAddress(user.businessAddress || "");
      setTaxId(user.taxId || "");
      setWebsite(user.website || "");
      setLogo(user.logo || null);
      setBillingCycle(user.billingCycle || "monthly");
    }
  }, [user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      if (isRegister) {
        if (!nameInput.trim()) throw new Error("Name is required");
        await signUp(nameInput, emailInput, passwordInput);
      } else {
        await login(emailInput, passwordInput);
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "var(--text-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="shimmer-bg" style={{ width: "50px", height: "50px", borderRadius: "50%", margin: "0 auto 20px" }}></div>
          <p style={{ letterSpacing: "1px", textTransform: "uppercase", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Loading settings deck...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "24px" }}>
        <div className="glass-panel-gold" style={{ width: "100%", maxWidth: "440px", padding: "40px", borderRadius: "24px", border: "1px solid rgba(212, 175, 55, 0.25)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "2px" }}>Access Restricted</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", fontWeight: "700", marginTop: "6px" }}>
              {isRegister ? "Create Profile" : "Settings Portal"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "8px", fontWeight: "300" }}>
              Please sign in to configure your user preferences and billing subscription.
            </p>
          </div>

          {authError && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "20px",
              textAlign: "center"
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isRegister && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Username</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Julian Sterling" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="glass-input" 
                />
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="name@domain.com" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="glass-input" 
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Access Key / Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="glass-input" 
              />
            </div>

            <button 
              type="submit" 
              disabled={authSubmitting}
              className="btn-primary" 
              style={{
                padding: "12px",
                fontWeight: "600",
                marginTop: "12px",
                width: "100%"
              }}
            >
              {authSubmitting ? "Authenticating..." : isRegister ? "Register & Enter" : "Unlock Settings"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", marginTop: "24px", textAlign: "center" }}>
            <button 
              onClick={() => { setIsRegister(!isRegister); setAuthError(""); }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
              className="nav-link"
            >
              {isRegister ? "Already registered? Sign In" : "Need a premium profile? Register here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle saving Profile & Business Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      await updateProfileFields({
        name,
        email,
        businessName,
        businessAddress,
        taxId,
        website,
        logo
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  // Handle logo file selection and base64 conversion
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Change Language and Currency preferences (saves immediately)
  const handlePreferenceChange = async (key, value) => {
    try {
      await updateProfileFields({ [key]: value });
    } catch (err) {
      console.error(err);
    }
  };

  // Change billing cycle
  const handleCycleChange = async (cycle) => {
    setBillingCycle(cycle);
    try {
      await updateProfileFields({ billingCycle: cycle });
    } catch (err) {
      console.error(err);
    }
  };

  // Subscribe/Upgrade tier
  const handleTierChange = async (tierName) => {
    try {
      await updateProfileFields({ subscription: tierName });
    } catch (err) {
      console.error(err);
    }
  };

  // Generate realistic invoices based on selected subscription tier
  const getInvoiceData = () => {
    const tier = user.subscription || "Pro";
    let basePriceCAD = 0;
    if (tier === "Pro") basePriceCAD = billingCycle === "monthly" ? 49 : 490;
    else if (tier === "Enterprise") basePriceCAD = billingCycle === "monthly" ? 199 : 1990;

    if (basePriceCAD === 0) return []; // Free tier has no invoices

    return [
      { id: "INV-2026-004", date: "Jun 01, 2026", amount: basePriceCAD, tier, status: "Paid" },
      { id: "INV-2026-003", date: "May 01, 2026", amount: basePriceCAD, tier, status: "Paid" },
      { id: "INV-2026-002", date: "Apr 01, 2026", amount: basePriceCAD, tier, status: "Paid" }
    ];
  };

  const currentLang = user.language || "en";

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px", color: "var(--text-primary)" }}>
      {/* Title */}
      <div style={{ marginBottom: "32px" }}>
        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "2px" }}>
          {database.translate("settings", currentLang)}
        </span>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: "700", marginTop: "4px" }}>
          Operations Control Deck
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>
        {/* Navigation Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "14px 18px",
              background: activeTab === "profile" ? "rgba(212, 175, 55, 0.12)" : "rgba(255, 255, 255, 0.02)",
              border: activeTab === "profile" ? "1px solid rgba(212, 175, 55, 0.35)" : "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              color: activeTab === "profile" ? "var(--accent-gold)" : "var(--text-secondary)",
              fontSize: "0.95rem",
              fontWeight: activeTab === "profile" ? "600" : "500",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s"
            }}
          >
            <User size={18} />
            <span>Profile & Business</span>
          </button>

          <button
            onClick={() => setActiveTab("localization")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "14px 18px",
              background: activeTab === "localization" ? "rgba(212, 175, 55, 0.12)" : "rgba(255, 255, 255, 0.02)",
              border: activeTab === "localization" ? "1px solid rgba(212, 175, 55, 0.35)" : "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              color: activeTab === "localization" ? "var(--accent-gold)" : "var(--text-secondary)",
              fontSize: "0.95rem",
              fontWeight: activeTab === "localization" ? "600" : "500",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s"
            }}
          >
            <Globe size={18} />
            <span>Language & Currency</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "14px 18px",
              background: activeTab === "billing" ? "rgba(212, 175, 55, 0.12)" : "rgba(255, 255, 255, 0.02)",
              border: activeTab === "billing" ? "1px solid rgba(212, 175, 55, 0.35)" : "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              color: activeTab === "billing" ? "var(--accent-gold)" : "var(--text-secondary)",
              fontSize: "0.95rem",
              fontWeight: activeTab === "billing" ? "600" : "500",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s"
            }}
          >
            <CreditCard size={18} />
            <span>Subscription Billing</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "14px 18px",
              background: activeTab === "preferences" ? "rgba(212, 175, 55, 0.12)" : "rgba(255, 255, 255, 0.02)",
              border: activeTab === "preferences" ? "1px solid rgba(212, 175, 55, 0.35)" : "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              color: activeTab === "preferences" ? "var(--accent-gold)" : "var(--text-secondary)",
              fontSize: "0.95rem",
              fontWeight: activeTab === "preferences" ? "600" : "500",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s"
            }}
          >
            <Sliders size={18} />
            <span>System Preferences</span>
          </button>
        </div>

        {/* Configuration Panel Content */}
        <div className="glass-panel" style={{
          padding: "40px",
          background: "rgba(10, 15, 30, 0.45)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
          backdropFilter: "blur(20px)",
          minHeight: "500px"
        }}>
          
          {/* TAB 1: PROFILE & BUSINESS */}
          {activeTab === "profile" && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: "600", marginBottom: "8px" }}>
                Profile & Business Details
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "32px" }}>
                Update your identity details, organizer profile metadata, and organization logo.
              </p>

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Logo Upload Section */}
                <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ position: "relative", width: "88px", height: "88px" }}>
                    <div style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid rgba(212, 175, 55, 0.4)",
                      background: "rgba(255,255,255,0.03)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}>
                      {logo ? (
                        <img src={logo} alt="Logo Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Building size={32} style={{ color: "rgba(255,255,255,0.2)" }} />
                      )}
                    </div>
                    <label htmlFor="logo-upload" style={{
                      position: "absolute",
                      bottom: "-4px",
                      right: "-4px",
                      background: "var(--accent-gold)",
                      color: "#000",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      border: "2px solid #0f0f12",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      transition: "transform 0.2s"
                    }} className="hover-scale">
                      <Upload size={13} />
                      <input 
                        type="file" 
                        id="logo-upload" 
                        accept="image/*" 
                        style={{ display: "none" }} 
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", display: "block" }}>Organization Logo</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Upload square JPG, PNG. Max size 2MB. Updates brand branding on tickets.
                    </span>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Account Manager Name</label>
                    <div style={{ position: "relative" }}>
                      <User size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ paddingLeft: "38px" }}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Email Address</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ paddingLeft: "38px" }}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Business / Organization Name</label>
                    <div style={{ position: "relative" }}>
                      <Building size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        style={{ paddingLeft: "38px" }}
                        className="glass-input"
                        placeholder="e.g. Luxe Events Inc."
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Tax Registration ID / VAT</label>
                    <div style={{ position: "relative" }}>
                      <ShieldCheck size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        style={{ paddingLeft: "38px" }}
                        className="glass-input"
                        placeholder="e.g. GST-881273912-RT0001"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "span 2" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Business Headquarters Address</label>
                    <div style={{ position: "relative" }}>
                      <MapPin size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        style={{ paddingLeft: "38px" }}
                        className="glass-input"
                        placeholder="Street Address, City, Province/State, Country"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", gridColumn: "span 2" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Corporate Website</label>
                    <div style={{ position: "relative" }}>
                      <Globe2 size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        style={{ paddingLeft: "38px" }}
                        className="glass-input"
                        placeholder="https://luxe.design"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ padding: "12px 30px" }}
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? "Saving..." : "Save Details"}
                  </button>

                  {saveStatus === "success" && (
                    <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "500" }}>
                      <CheckCircle2 size={16} /> Update Saved Successfully.
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: LOCALIZATION */}
          {activeTab === "localization" && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: "600", marginBottom: "8px" }}>
                Localization Settings
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "32px" }}>
                Adjust language translations and preferred billing/display currencies. Settings take effect instantly.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* Language selection */}
                <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", display: "block" }}>Platform Language</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Translate headers, options, and transactional labels.
                    </span>
                  </div>
                  <div>
                    <select
                      value={user.language || "en"}
                      onChange={(e) => handlePreferenceChange("language", e.target.value)}
                      className="glass-input"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="en" style={{ background: "#0f0f12" }}>English (US/UK)</option>
                      <option value="fr" style={{ background: "#0f0f12" }}>Français (CA/FR)</option>
                      <option value="es" style={{ background: "#0f0f12" }}>Español (ES/MX)</option>
                    </select>
                  </div>
                </div>

                {/* Currency selection */}
                <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "center", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600", display: "block" }}>Display Currency</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Converts base prices dynamically using real-time mock multipliers.
                    </span>
                  </div>
                  <div>
                    <select
                      value={user.currency || "CAD"}
                      onChange={(e) => handlePreferenceChange("currency", e.target.value)}
                      className="glass-input"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="CAD" style={{ background: "#0f0f12" }}>CAD (Canadian Dollars) - CA$</option>
                      <option value="USD" style={{ background: "#0f0f12" }}>USD (United States Dollars) - US$</option>
                      <option value="EUR" style={{ background: "#0f0f12" }}>EUR (Euros) - €</option>
                      <option value="GBP" style={{ background: "#0f0f12" }}>GBP (Great British Pounds) - £</option>
                    </select>
                  </div>
                </div>

                {/* Localized Test Area */}
                <div style={{
                  background: "rgba(212, 175, 55, 0.04)",
                  border: "1px solid rgba(212, 175, 55, 0.15)",
                  padding: "20px",
                  borderRadius: "12px",
                  marginTop: "16px"
                }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                    Localization Sandbox Test
                  </span>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Translated Header: </span>
                      <strong style={{ color: "#fff" }}>{database.translate("selectYourSeats", user.language)}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Sample Ticket Price: </span>
                      <strong style={{ color: "var(--accent-gold)" }}>{database.formatPrice(100, user.currency)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & SUBSCRIPTIONS */}
          {activeTab === "billing" && (
            <div>
              <div style={{ display: "flex", justifyContent: "between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: "600", marginBottom: "8px" }}>
                    Subscription Billing Page
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                    Configure tier subscriptions, payment methods, and review billing invoices.
                  </p>
                </div>
              </div>

              {/* Billing Cycle Switcher */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "4px",
                  display: "flex",
                  gap: "4px"
                }}>
                  <button
                    onClick={() => handleCycleChange("monthly")}
                    style={{
                      background: billingCycle === "monthly" ? "var(--accent-gold)" : "transparent",
                      color: billingCycle === "monthly" ? "#000" : "var(--text-secondary)",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "16px",
                      fontWeight: "600",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => handleCycleChange("yearly")}
                    style={{
                      background: billingCycle === "yearly" ? "var(--accent-gold)" : "transparent",
                      color: billingCycle === "yearly" ? "#000" : "var(--text-secondary)",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "16px",
                      fontWeight: "600",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Yearly (Save 17%)
                  </button>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "40px" }}>
                
                {/* TIER 1: FREE */}
                <div style={{
                  background: user.subscription === "Free" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.15)",
                  border: user.subscription === "Free" ? "2px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}>
                  {user.subscription === "Free" && (
                    <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.65rem", padding: "4px 8px", borderRadius: "10px", fontWeight: "600", textTransform: "uppercase" }}>
                      Active
                    </span>
                  )}
                  <div>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Starter</span>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "4px" }}>Luxe Free</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px", minHeight: "36px" }}>
                      Basic discover page listings and split booking access.
                    </p>
                    <div style={{ marginTop: "16px", marginBottom: "20px" }}>
                      <span style={{ fontSize: "1.8rem", fontWeight: "700" }}>{database.formatPrice(0, user.currency)}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTierChange("Free")}
                    disabled={user.subscription === "Free"}
                    className={user.subscription === "Free" ? "btn-secondary" : "btn-primary"}
                    style={{ width: "100%", padding: "10px", fontSize: "0.8rem", cursor: user.subscription === "Free" ? "default" : "pointer" }}
                  >
                    {user.subscription === "Free" ? "Active Tier" : "Downgrade"}
                  </button>
                </div>

                {/* TIER 2: PRO */}
                <div style={{
                  background: user.subscription === "Pro" ? "rgba(212, 175, 55, 0.05)" : "rgba(0,0,0,0.15)",
                  border: user.subscription === "Pro" ? "2px solid var(--accent-gold)" : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}>
                  {user.subscription === "Pro" && (
                    <span style={{ position: "absolute", top: "12px", right: "12px", background: "var(--accent-gold)", color: "#000", fontSize: "0.65rem", padding: "4px 8px", borderRadius: "10px", fontWeight: "700", textTransform: "uppercase" }}>
                      Active
                    </span>
                  )}
                  <div>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "600" }}>Popular</span>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "4px" }}>Luxe Pro</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px", minHeight: "36px" }}>
                      Full seat mapping layouts, designer suite, guest directory CRM, and priority metrics.
                    </p>
                    <div style={{ marginTop: "16px", marginBottom: "20px" }}>
                      <span style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--accent-gold)" }}>
                        {billingCycle === "monthly" ? database.formatPrice(49, user.currency) : database.formatPrice(490, user.currency)}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTierChange("Pro")}
                    disabled={user.subscription === "Pro"}
                    className={user.subscription === "Pro" ? "btn-secondary" : "btn-primary"}
                    style={{ width: "100%", padding: "10px", fontSize: "0.8rem", cursor: user.subscription === "Pro" ? "default" : "pointer" }}
                  >
                    {user.subscription === "Pro" ? "Active Tier" : "Select Pro"}
                  </button>
                </div>

                {/* TIER 3: ENTERPRISE */}
                <div style={{
                  background: user.subscription === "Enterprise" ? "rgba(168, 85, 247, 0.05)" : "rgba(0,0,0,0.15)",
                  border: user.subscription === "Enterprise" ? "2px solid #a855f7" : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}>
                  {user.subscription === "Enterprise" && (
                    <span style={{ position: "absolute", top: "12px", right: "12px", background: "#a855f7", color: "#fff", fontSize: "0.65rem", padding: "4px 8px", borderRadius: "10px", fontWeight: "600", textTransform: "uppercase" }}>
                      Active
                    </span>
                  )}
                  <div>
                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#a855f7", fontWeight: "600" }}>Scale</span>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "4px" }}>Luxe Enterprise</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "8px", minHeight: "36px" }}>
                      Multiple organizer account sync, bespoke ticketing API endpoints, and unlimited scans.
                    </p>
                    <div style={{ marginTop: "16px", marginBottom: "20px" }}>
                      <span style={{ fontSize: "1.8rem", fontWeight: "700" }}>
                        {billingCycle === "monthly" ? database.formatPrice(199, user.currency) : database.formatPrice(1990, user.currency)}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTierChange("Enterprise")}
                    disabled={user.subscription === "Enterprise"}
                    className={user.subscription === "Enterprise" ? "btn-secondary" : "btn-primary"}
                    style={{ width: "100%", padding: "10px", fontSize: "0.8rem", cursor: user.subscription === "Enterprise" ? "default" : "pointer" }}
                  >
                    {user.subscription === "Enterprise" ? "Active Tier" : "Upgrade"}
                  </button>
                </div>
              </div>

              {/* Payment Method Details (Visa Card Model) */}
              <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "28px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "40px" }}>
                {/* Credit Card Graphic */}
                <div style={{
                  background: "linear-gradient(135deg, #2d1b4e 0%, #17112c 100%)",
                  border: "1px solid rgba(212,175,55,0.25)",
                  borderRadius: "16px",
                  padding: "24px",
                  height: "180px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  {/* Subtle vector circles */}
                  <div style={{ position: "absolute", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(212,175,55,0.03)", right: "-50px", bottom: "-50px", pointerEvents: "none" }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.4)" }}>Billing Profile</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff", fontStyle: "italic" }}>VISA</span>
                  </div>

                  <div>
                    <span style={{ display: "block", fontSize: "1.1rem", letterSpacing: "3px", color: "#fff", fontFamily: "monospace", marginBottom: "16px" }}>
                      {cardNumber}
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "0.55rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Cardholder</span>
                        <span style={{ color: "#fff", fontWeight: "500" }}>{cardName}</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: "0.55rem", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Expires</span>
                        <span style={{ color: "#fff", fontWeight: "500" }}>{cardExpiry}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: "600" }}>Active Card Details</span>
                    <button 
                      onClick={() => setEditingCard(!editingCard)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent-gold)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: "600"
                      }}
                    >
                      {editingCard ? "Cancel Edit" : "Update Card"}
                    </button>
                  </div>

                  {editingCard ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Name on Card</label>
                        <input 
                          type="text" 
                          value={cardName} 
                          onChange={(e) => setCardName(e.target.value)} 
                          className="glass-input" 
                          style={{ padding: "8px 12px", fontSize: "0.85rem" }} 
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "span 2" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Card Number</label>
                        <input 
                          type="text" 
                          value={cardNumber} 
                          onChange={(e) => setCardNumber(e.target.value)} 
                          className="glass-input" 
                          style={{ padding: "8px 12px", fontSize: "0.85rem" }} 
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={cardExpiry} 
                          onChange={(e) => setCardExpiry(e.target.value)} 
                          className="glass-input" 
                          style={{ padding: "8px 12px", fontSize: "0.85rem" }} 
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>CVV</label>
                        <input 
                          type="password" 
                          value={cardCvv} 
                          onChange={(e) => setCardCvv(e.target.value)} 
                          className="glass-input" 
                          style={{ padding: "8px 12px", fontSize: "0.85rem" }} 
                        />
                      </div>
                      <button 
                        onClick={() => setEditingCard(false)} 
                        className="btn-primary" 
                        style={{ gridColumn: "span 2", padding: "8px", fontSize: "0.8rem", marginTop: "4px" }}
                      >
                        Confirm Card Details
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <p style={{ color: "var(--text-muted)" }}>
                        Your card will automatically be charged on your renewal date.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "6px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Renewal Date:</span>
                        <span>Jul 01, 2026</span>
                        <span style={{ color: "var(--text-muted)" }}>Charge Amount:</span>
                        <span style={{ fontWeight: "600", color: "var(--accent-gold)" }}>
                          {user.subscription === "Pro" ? (
                            billingCycle === "monthly" ? database.formatPrice(49, user.currency) : database.formatPrice(490, user.currency)
                          ) : user.subscription === "Enterprise" ? (
                            billingCycle === "monthly" ? database.formatPrice(199, user.currency) : database.formatPrice(1990, user.currency)
                          ) : database.formatPrice(0, user.currency)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice History Grid */}
              {getInvoiceData().length > 0 && (
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={18} style={{ color: "var(--accent-gold)" }} />
                    Billing & Invoice History
                  </h4>
                  
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                          <th style={{ textAlign: "left", padding: "12px" }}>Invoice ID</th>
                          <th style={{ textAlign: "left", padding: "12px" }}>Billing Date</th>
                          <th style={{ textAlign: "left", padding: "12px" }}>Product Tier</th>
                          <th style={{ textAlign: "right", padding: "12px" }}>Total Amount</th>
                          <th style={{ textAlign: "center", padding: "12px" }}>Status</th>
                          <th style={{ textAlign: "right", padding: "12px" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getInvoiceData().map((invoice) => (
                          <tr key={invoice.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }} className="hover-row">
                            <td style={{ padding: "12px", fontFamily: "monospace", color: "#fff" }}>{invoice.id}</td>
                            <td style={{ padding: "12px" }}>{invoice.date}</td>
                            <td style={{ padding: "12px" }}>Luxe {invoice.tier}</td>
                            <td style={{ padding: "12px", textAlign: "right", fontWeight: "600" }}>
                              {database.formatPrice(invoice.amount, user.currency)}
                            </td>
                            <td style={{ padding: "12px", textAlign: "center" }}>
                              <span style={{
                                background: "rgba(16, 185, 129, 0.1)",
                                border: "1px solid #10b981",
                                color: "#10b981",
                                fontSize: "0.75rem",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontWeight: "600"
                              }}>
                                {invoice.status}
                              </span>
                            </td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              <button
                                onClick={() => alert(`Downloading Invoice PDF for ${invoice.id}...`)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--accent-gold)",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                  textDecoration: "underline"
                                }}
                              >
                                Download PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SYSTEM PREFERENCES */}
          {activeTab === "preferences" && (
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: "600", marginBottom: "8px" }}>
                System Preferences
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "32px" }}>
                Configure application aesthetics, custom notification configurations, and warning limits.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                
                {/* Theme Selector */}
                <div>
                  <span style={{ fontSize: "0.95rem", fontWeight: "600", display: "block", marginBottom: "12px" }}>Theme Mode styling</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <button
                      onClick={() => handlePreferenceChange("theme", "dark")}
                      style={{
                        background: (user.theme === "dark" || !user.theme) ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)",
                        border: (user.theme === "dark" || !user.theme) ? "2px solid var(--accent-gold)" : "1px solid rgba(255,255,255,0.06)",
                        padding: "16px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s"
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.9rem", color: "#fff" }}>Dark Obsidian</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Deep glassmorphism canvas.</span>
                    </button>

                    <button
                      onClick={() => handlePreferenceChange("theme", "light")}
                      style={{
                        background: user.theme === "light" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                        border: user.theme === "light" ? "2px solid var(--accent-gold)" : "1px solid rgba(255,255,255,0.06)",
                        padding: "16px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s"
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.9rem", color: "#fff" }}>Frost White</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Light clean layout contrast.</span>
                    </button>

                    <button
                      onClick={() => handlePreferenceChange("theme", "gold")}
                      style={{
                        background: user.theme === "gold" ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                        border: user.theme === "gold" ? "2px solid var(--accent-gold)" : "1px solid rgba(255,255,255,0.06)",
                        padding: "16px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s"
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--accent-gold)" }}>Gold Velvet</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rich royal golden details.</span>
                    </button>
                  </div>
                </div>

                {/* Notifications Toggles */}
                <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: "600", display: "block", marginBottom: "16px" }}>Event Dispatch & Alerts</span>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={user.emailMarketing !== false}
                        onChange={(e) => handlePreferenceChange("emailMarketing", e.target.checked)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "var(--accent-gold)",
                          cursor: "pointer"
                        }}
                      />
                      <div>
                        <span style={{ fontSize: "0.88rem", fontWeight: "500", display: "block" }}>Platform Promotional Digests</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Receive monthly roundups of VIP events and upcoming showcases.</span>
                      </div>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={user.checkInAlerts !== false}
                        onChange={(e) => handlePreferenceChange("checkInAlerts", e.target.checked)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "var(--accent-gold)",
                          cursor: "pointer"
                        }}
                      />
                      <div>
                        <span style={{ fontSize: "0.88rem", fontWeight: "500", display: "block" }}>Gate Check-In Instant Alerts</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Dispatch push and email alerts instantly when VIP ticket holders check-in.</span>
                      </div>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={user.chatNotifications !== false}
                        onChange={(e) => handlePreferenceChange("chatNotifications", e.target.checked)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "var(--accent-gold)",
                          cursor: "pointer"
                        }}
                      />
                      <div>
                        <span style={{ fontSize: "0.88rem", fontWeight: "500", display: "block" }}>Chatroom Sound Alerts</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Play subtle audio cues when messages arrive in the event chat room.</span>
                      </div>
                    </label>

                  </div>
                </div>

                {/* Account Security Warnings */}
                <div style={{
                  padding: "20px",
                  background: "rgba(239, 68, 68, 0.04)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  borderRadius: "12px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  marginTop: "12px"
                }}>
                  <AlertCircle size={20} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <span style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#ef4444" }}>Security Control Zone</span>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      We are currently running in secure sandboxed session mode. Data saved here updates the local cache session storage and updates dynamic views on-the-fly.
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
      
      <style jsx>{`
        .glass-panel {
          transition: border-color 0.3s;
        }
        .hover-row {
          transition: background-color 0.2s;
        }
        .hover-row:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .hover-scale:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
