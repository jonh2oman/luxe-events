"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { database } from "@/lib/database";
import { 
  Sparkles, ShieldCheck, Ticket, Palette, Save, ArrowLeft,
  Settings, CheckCircle2, AlertTriangle, Eye, ShieldAlert, Award, Star
} from "lucide-react";

export default function TicketDesignerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Role Gate
  useEffect(() => {
    if (!loading && (!user || user.role !== "organizer")) {
      router.push("/dashboard/settings"); // fallback to settings credentials panel
    }
  }, [user, loading, router]);

  // Designer State
  const [designName, setDesignName] = useState("Midnight Solstice");
  const [material, setMaterial] = useState("holographic"); // holographic, gold_foil, liquid_silver, glass
  const [borderStyle, setBorderStyle] = useState("neon_purple"); // silver, gold_glow, neon_purple, double_border
  const [stamp, setStamp] = useState("star"); // star, crest, hologram_dot, none
  const [particleEffect, setParticleEffect] = useState("sparkles"); // sparkles, dust, stars, none
  const [fontFamily, setFontFamily] = useState("sans"); // sans, serif, mono
  const [barcodeType, setBarcodeType] = useState("qr_line"); // classic, matrix, qr_line
  const [badgeColor, setBadgeColor] = useState("#a855f7");
  const [textColor, setTextColor] = useState("#ffffff");

  // Save/Assign States
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // saving, success
  const [assignStatus, setAssignStatus] = useState(""); // success

  // 3D Card Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  useEffect(() => {
    if (user) {
      database.getEvents().then(setEvents);
    }
  }, [user]);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setRotateX(-y / 8);
    setRotateY(x / 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleSavePreset = async () => {
    setSaveStatus("saving");
    const newDesign = {
      name: designName,
      material,
      borderStyle,
      stamp,
      particleEffect,
      fontFamily,
      barcodeType,
      badgeColor,
      textColor
    };
    try {
      const saved = await database.saveTicketDesign(newDesign);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 3000);

      // If event selected, assign immediately
      if (selectedEventId && saved) {
        await database.assignDesignToEvent(selectedEventId, saved.id);
        setAssignStatus("success");
        setTimeout(() => setAssignStatus(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("");
    }
  };

  if (loading || !user || user.role !== "organizer") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "var(--text-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "2px" }}>
            Checking Backstage Credentials...
          </span>
        </div>
      </div>
    );
  }

  // Get material styles
  const getMaterialStyle = () => {
    switch (material) {
      case "gold_foil":
        return {
          background: "linear-gradient(135deg, #f5e3a0 0%, #d4af37 50%, #aa8010 100%)",
          color: "#27210e",
          boxShadow: "0 20px 40px rgba(212, 175, 55, 0.15)"
        };
      case "liquid_silver":
        return {
          background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #64748b 100%)",
          color: "#0f172a",
          boxShadow: "0 20px 40px rgba(255, 255, 255, 0.1)"
        };
      case "glass":
        return {
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          color: "#f8fafc",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
        };
      case "holographic":
      default:
        return {
          background: "linear-gradient(135deg, #f472b6 0%, #38bdf8 50%, #c084fc 100%)",
          color: "#0f0f18",
          boxShadow: "0 20px 40px rgba(192, 132, 252, 0.25)"
        };
    }
  };

  // Get border styles
  const getBorderStyle = () => {
    switch (borderStyle) {
      case "gold_glow":
        return "2px solid #d4af37";
      case "neon_purple":
        return "2px solid #a855f7";
      case "double_border":
        return "4px double rgba(255,255,255,0.25)";
      case "silver":
      default:
        return "1px solid rgba(255, 255, 255, 0.15)";
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px", color: "var(--text-primary)" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button 
          onClick={() => router.push("/dashboard/organizer")} 
          style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          className="nav-link"
        >
          <ArrowLeft size={16} />
          <span>Console</span>
        </button>
        <div style={{ borderLeft: "1px solid var(--border-accent)", paddingLeft: "16px" }}>
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "2px" }}>
            Backstage Workspace
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: "700", marginTop: "4px" }}>
            Custom Ticket Designer
          </h1>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "40px", alignItems: "start" }}>
        {/* Left column: Controls */}
        <div className="glass-panel" style={{ padding: "40px", background: "var(--glass-bg)", borderRadius: "20px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Palette size={18} style={{ color: "var(--accent-gold)" }} />
            Ticket Customizations
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Design Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Design Preset Name</label>
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="glass-input"
                placeholder="e.g. Solar Solstice Prismatic"
              />
            </div>

            {/* Material & Gradient Finishes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Material & Metallic Finish</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  onClick={() => setMaterial("holographic")}
                  style={{
                    background: material === "holographic" ? "rgba(192, 132, 252, 0.12)" : "rgba(255,255,255,0.02)",
                    border: material === "holographic" ? "2px solid #a855f7" : "1px solid var(--border-accent)",
                    padding: "12px", borderRadius: "10px", color: "#fff", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Holographic Glow
                </button>
                <button
                  onClick={() => setMaterial("gold_foil")}
                  style={{
                    background: material === "gold_foil" ? "rgba(212, 175, 55, 0.12)" : "rgba(255,255,255,0.02)",
                    border: material === "gold_foil" ? "2px solid var(--accent-gold)" : "1px solid var(--border-accent)",
                    padding: "12px", borderRadius: "10px", color: "#fff", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Chamber Gold Foil
                </button>
                <button
                  onClick={() => setMaterial("liquid_silver")}
                  style={{
                    background: material === "liquid_silver" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                    border: material === "liquid_silver" ? "2px solid #cbd5e1" : "1px solid var(--border-accent)",
                    padding: "12px", borderRadius: "10px", color: "#fff", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Liquid Silver
                </button>
                <button
                  onClick={() => setMaterial("glass")}
                  style={{
                    background: material === "glass" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                    border: material === "glass" ? "2px solid #fff" : "1px solid var(--border-accent)",
                    padding: "12px", borderRadius: "10px", color: "#fff", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Crystal Glass
                </button>
              </div>
            </div>

            {/* Border glow styling */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Border Style</label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
                className="glass-input"
                style={{ cursor: "pointer" }}
              >
                <option value="silver" style={{ background: "#0f0f12" }}>Thin Brushed Silver</option>
                <option value="gold_glow" style={{ background: "#0f0f12" }}>Gold Foil Glow</option>
                <option value="neon_purple" style={{ background: "#0f0f12" }}>Neon Purple Aura</option>
                <option value="double_border" style={{ background: "#0f0f12" }}>Double Vector Lines</option>
              </select>
            </div>

            {/* Font Typography and Barcode type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="glass-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="sans" style={{ background: "#0f0f12" }}>Outfit Sans</option>
                  <option value="serif" style={{ background: "#0f0f12" }}>Playfair Serif</option>
                  <option value="mono" style={{ background: "#0f0f12" }}>Fira Monospace</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Security Stamp</label>
                <select
                  value={stamp}
                  onChange={(e) => setStamp(e.target.value)}
                  className="glass-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="star" style={{ background: "#0f0f12" }}>VIP Star Badge</option>
                  <option value="crest" style={{ background: "#0f0f12" }}>Royal Crest Seal</option>
                  <option value="hologram_dot" style={{ background: "#0f0f12" }}>Security Dot Matrix</option>
                  <option value="none" style={{ background: "#0f0f12" }}>None</option>
                </select>
              </div>
            </div>

            {/* Custom Barcode & Particle styles */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Barcode Format</label>
                <select
                  value={barcodeType}
                  onChange={(e) => setBarcodeType(e.target.value)}
                  className="glass-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="classic" style={{ background: "#0f0f12" }}>Classic Linear Bar</option>
                  <option value="matrix" style={{ background: "#0f0f12" }}>DataMatrix Code</option>
                  <option value="qr_line" style={{ background: "#0f0f12" }}>QR Code Hybrid</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Particle Animation</label>
                <select
                  value={particleEffect}
                  onChange={(e) => setParticleEffect(e.target.value)}
                  className="glass-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="sparkles" style={{ background: "#0f0f12" }}>Pulsing Gold Sparkles</option>
                  <option value="dust" style={{ background: "#0f0f12" }}>Ambient Floating Dust</option>
                  <option value="stars" style={{ background: "#0f0f12" }}>Glittering Star Field</option>
                  <option value="none" style={{ background: "#0f0f12" }}>No Overlay</option>
                </select>
              </div>
            </div>

            {/* Color customization */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Foil Badge Color</label>
                <input
                  type="color"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  style={{ width: "100%", height: "45px", border: "none", borderRadius: "10px", cursor: "pointer", background: "transparent" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Dynamic Text Tint</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: "100%", height: "45px", border: "none", borderRadius: "10px", cursor: "pointer", background: "transparent" }}
                />
              </div>
            </div>

            {/* Assign Event Deck */}
            <div style={{ borderTop: "1px solid var(--border-accent)", paddingTop: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Assign to Published Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="glass-input"
                style={{ cursor: "pointer" }}
              >
                <option value="" style={{ background: "#0f0f12" }}>Select an Event (Assign on Save)</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id} style={{ background: "#0f0f12" }}>{ev.title}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
              <button
                onClick={handleSavePreset}
                disabled={saveStatus === "saving"}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px" }}
              >
                <Save size={16} />
                <span>{saveStatus === "saving" ? "Saving preset..." : "Save Design"}</span>
              </button>

              {saveStatus === "success" && (
                <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "600" }}>
                  <CheckCircle2 size={16} /> Template Saved!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Interactive 3D preview */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "100px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
            <Eye size={14} style={{ color: "var(--accent-gold)" }} />
            Dynamic 3D Gyroscope Preview
          </span>

          {/* Interactive Card Canvas */}
          <div 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              perspective: "1000px",
              cursor: "grab",
              width: "100%",
              height: "440px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <div
              style={{
                width: "320px",
                height: "420px",
                borderRadius: "24px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)",
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                border: getBorderStyle(),
                ...getMaterialStyle(),
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Particle Overlays */}
              {particleEffect !== "none" && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  pointerEvents: "none",
                  opacity: 0.6,
                  backgroundImage: particleEffect === "stars" 
                    ? "radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 80px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 280px 320px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 220px, #fff, rgba(0,0,0,0))"
                    : particleEffect === "dust"
                    ? "radial-gradient(3px 3px at 40px 100px, rgba(255,255,255,0.1), rgba(0,0,0,0)), radial-gradient(4px 4px at 200px 250px, rgba(255,255,255,0.08), rgba(0,0,0,0))"
                    : "radial-gradient(2px 2px at 90px 40px, #d4af37, rgba(0,0,0,0)), radial-gradient(2px 2px at 230px 180px, #f3e5ab, rgba(0,0,0,0)), radial-gradient(3px 3px at 120px 300px, #d4af37, rgba(0,0,0,0))",
                  animation: "shimmer 5s infinite linear"
                }} />
              )}

              {/* Shimmer glaze overlay */}
              {material === "holographic" && (
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 70%, rgba(255,255,255,0) 100%)",
                  backgroundSize: "200% 200%",
                  mixBlendMode: "overlay",
                  pointerEvents: "none",
                  animation: "shimmer 3s infinite linear"
                }} />
              )}

              {/* Top ticket content */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    background: badgeColor,
                    color: material === "gold_foil" || material === "liquid_silver" ? "#000" : "#fff",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.15)"
                  }}>
                    {material === "glass" ? "Premium VIP" : designName.split(" ")[0]}
                  </span>
                  
                  {stamp === "star" && <Star size={20} fill={textColor} color={textColor} />}
                  {stamp === "crest" && <Award size={20} color={textColor} />}
                  {stamp === "hologram_dot" && (
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: `radial-gradient(circle, ${badgeColor} 0%, rgba(0,0,0,0) 70%)`, border: `1px solid ${textColor}` }} />
                  )}
                </div>

                <h2 style={{
                  fontFamily: fontFamily === "serif" ? "var(--font-serif)" : fontFamily === "mono" ? "monospace" : "var(--font-sans)",
                  fontSize: "1.45rem",
                  fontWeight: "800",
                  lineHeight: "1.2",
                  color: material === "glass" ? "#fff" : textColor
                }}>
                  {events.find(e => e.id === selectedEventId)?.title || "Solstice Music Festival"}
                </h2>
                <span style={{ fontSize: "0.7rem", opacity: 0.6, display: "block", marginTop: "4px" }}>
                  {events.find(e => e.id === selectedEventId)?.location || "Aetheria Dome Stage Arena"}
                </span>
              </div>

              {/* Middle ticket content */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
                <div>
                  <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase" }}>Secured Row</span>
                  <span style={{ fontWeight: "600", fontFamily: fontFamily === "mono" ? "monospace" : "inherit" }}>VIP Row A</span>
                </div>
                <div>
                  <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase" }}>Secured Seat</span>
                  <span style={{ fontWeight: "600", fontFamily: fontFamily === "mono" ? "monospace" : "inherit" }}>Seat A15</span>
                </div>
                <div>
                  <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase" }}>Check-In Gate</span>
                  <span style={{ fontWeight: "600" }}>North Access</span>
                </div>
                <div>
                  <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase" }}>Pass ID</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: "600" }}>BK-0918273</span>
                </div>
              </div>

              {/* Bottom ticket content (Barcodes) */}
              <div style={{
                borderTop: "1px dashed rgba(0,0,0,0.15)",
                paddingTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", opacity: 0.5 }}>
                  LUXE-VERIFICATION-SECURE
                </div>

                {barcodeType === "classic" && (
                  <div style={{ display: "flex", gap: "2px", height: "30px", opacity: 0.85 }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} style={{ width: i % 3 === 0 ? "3px" : "1px", height: "100%", background: material === "glass" ? "#fff" : textColor }} />
                    ))}
                  </div>
                )}

                {barcodeType === "matrix" && (
                  <div style={{
                    width: "32px", height: "32px",
                    background: `repeating-conic-gradient(from 0deg, ${textColor} 0deg 90deg, transparent 90deg 180deg)`,
                    backgroundSize: "8px 8px",
                    opacity: 0.75
                  }} />
                )}

                {barcodeType === "qr_line" && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px"
                  }}>
                    <div style={{ width: "22px", height: "22px", background: `repeating-linear-gradient(45deg, ${textColor} 0px, ${textColor} 2px, transparent 2px, transparent 4px)`, opacity: 0.75 }} />
                    <div style={{ display: "flex", gap: "1px", height: "22px", opacity: 0.85 }}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ width: i % 2 === 0 ? "2px" : "1px", height: "100%", background: textColor }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", fontWeight: "300" }}>
            Hold and drag cursor across the card block to inspect reflective visual shading finishes.
          </p>
        </div>
      </div>
    </div>
  );
}
