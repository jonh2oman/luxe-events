"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sparkles, Calendar, Plus, DollarSign, Users, Award, TrendingUp, Cpu, 
  CheckCircle, Camera, Tag, ClipboardList, Layout, QrCode, Bell, CreditCard, 
  ArrowRight, ShieldCheck, ArrowUpRight 
} from "lucide-react";
import { database } from "@/lib/database";
import { useAuth } from "@/context/AuthContext";

export default function OrganizerDashboard() {
  const { user, loading, login, signUp } = useAuth();
  
  // Auth Gate states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [layoutTemplates, setLayoutTemplates] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  
  // Dashboard operational states
  const [bookings, setBookings] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [plannerTasks, setPlannerTasks] = useState([]);
  const [vipNotification, setVipNotification] = useState(null);
  
  // AI assist state
  const [prompt, setPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // New Event form state
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLoc, setFormLoc] = useState("");
  const [formPrice, setFormPrice] = useState(40);
  const [eventAdded, setEventAdded] = useState(false);

  useEffect(() => {
    setAnalytics(database.getOrganizerAnalytics());
    database.getEvents().then(allEvents => {
      setEvents(allEvents);
    });
    database.getBookings().then(allBookings => {
      setBookings(allBookings);
    });
    database.getPromoCodes().then(allCodes => {
      setPromoCodes(allCodes);
    });
    database.getPlannerTasks().then(allTasks => {
      setPlannerTasks(allTasks);
    });

    // Load custom layouts
    const templates = localStorage.getItem("luxe_layout_templates");
    if (templates) {
      const parsed = JSON.parse(templates);
      setLayoutTemplates(parsed);
      if (parsed.length > 0) {
        setSelectedTemplateName(parsed[0].name);
      }
    }
  }, []);

  const aiLoadingSteps = [
    "Analyzing target market & music demographics...",
    "Querying Gemini models for optimal pricing strategy...",
    "Drafting premium copy & marketing tagline...",
    "Generating suggested timeline & schedules..."
  ];

  // AI copywriting prompt helper
  const handleAIAssist = () => {
    if (!prompt.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    setLoadingStep(0);

    // Animate loader steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < aiLoadingSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(stepInterval);
      setAiLoading(false);
      
      // Seed values based on input
      const matchesJazz = prompt.toLowerCase().includes("jazz") || prompt.toLowerCase().includes("lounge") || prompt.toLowerCase().includes("classical");
      const matchesElectro = prompt.toLowerCase().includes("rave") || prompt.toLowerCase().includes("techno") || prompt.toLowerCase().includes("club");

      let generatedCopy = {
        title: "Neon Soundscapes: An Ambient Evening",
        subtitle: "Immersive audio-visual syntheses and digital reflections.",
        description: "Step into an auditory sanctuary where soundscapes come alive. Luxe Events presents an exclusive performance combining multi-instrumental synthesis, spatial acoustics, and real-time holographic art mapping. Ideal for enthusiasts of modern ambient wave and visual installations.",
        price: 55,
        tiers: [
          { name: "General Admission", price: 55, description: "Standing access to the main sound floor." },
          { name: "VIP Acoustical Ring", price: 110, description: "Elevated pod seating designed for optimized sonic clarity. Includes artist talk." }
        ],
        timeline: [
          { time: "19:00", event: "Doors Open & Ambient Soundscape Warmup" },
          { time: "20:00", event: "Act I: Synthesizer & Spatial Projections" },
          { time: "21:30", event: "Act II: Live Audiovisual Collaboration" },
          { time: "22:30", event: "Artist Meet-and-Greet in VIP Lounge" }
        ]
      };

      if (matchesJazz) {
        generatedCopy = {
          title: "Vervain Brass: Autumn Soul Sessions",
          subtitle: "A classy night of modern brass solos and smooth blues bass.",
          description: "Indulge in a curated jazz experience. This exclusive evening features the legendary Vervain Trio playing acoustic soul standards with special guest vocalists. Staged inside our minimalist glass greenhouse, providing a stunning natural backdrop of the autumn night skyline.",
          price: 60,
          tiers: [
            { name: "Standard Bistro Seating", price: 60, description: "Standard seating at high-top tables." },
            { name: "First Tier Stage Booth", price: 125, description: "VIP table directly beside the stage. Includes select bottle pairings." }
          ],
          timeline: [
            { time: "18:30", event: "Doors & Champagne Welcome" },
            { time: "19:30", event: "Vervain Trio Main Set (Acoustic)" },
            { time: "21:00", event: "Vervain Session Fusion (Electric)" },
            { time: "22:00", event: "Late Night After-Jam & Bar Lounge Open" }
          ]
        };
      } else if (matchesElectro) {
        generatedCopy = {
          title: "Glitch Reactor: Cybernetic Rave",
          subtitle: "High-octane industrial techno under an iron scaffold warehouse.",
          description: "Prepare your senses for a sonic assault. Glitch Reactor features underground electronic pioneers performing live modular synth sets inside the dark warehouse vaults. Surrounded by dynamic laser rigs and strobing gold lights, this is a premium clubbing event for nightlife purists.",
          price: 45,
          tiers: [
            { name: "Warehouse Core Floor", price: 45, description: "General entry to main warehouse hangar." },
            { name: "Upper Rail VIP Mezzanine", price: 85, description: "Premium view of laser production, express skip-the-line entrance, and private bar." }
          ],
          timeline: [
            { time: "22:00", event: "Doors Open & Resident DJ Set" },
            { time: "23:30", event: "Modular Synthesis live hardware set" },
            { time: "01:00", event: "Glitch Reactor headliner set" },
            { time: "04:00", event: "Curtain Close" }
          ]
        };
      }

      setAiResponse(generatedCopy);

      // Auto-populate the event form with AI generated copy
      setFormTitle(generatedCopy.title);
      setFormSubtitle(generatedCopy.subtitle);
      setFormDesc(generatedCopy.description);
      setFormPrice(generatedCopy.price);
    }, 4000);
  };

  // Handle manual/AI event submission
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    if (!formTitle || !formDate || !formLoc) return;

    const ticketTiers = aiResponse?.tiers || [
      { name: "General Admission", price: parseInt(formPrice), description: "Access to the event." }
    ];

    // Find selected layout template
    const activeTemplate = layoutTemplates.find(t => t.name === selectedTemplateName);
    let seats = null;

    if (activeTemplate) {
      seats = activeTemplate.grid.map(cell => ({
        id: cell.id,
        row: cell.row,
        number: cell.number,
        tier: cell.tier === "Corridor / Aisle" ? "Corridor / Aisle" : cell.tier,
        price: cell.tier === "VIP Lounge" && aiResponse ? aiResponse.tiers[1]?.price || 120 : cell.tier === "VIP Terrace" && aiResponse ? aiResponse.tiers[1]?.price || 85 : parseInt(formPrice),
        isBooked: cell.tier === "Corridor / Aisle", // Corridor blocks are immediately "booked" to disable selection
        selectedBy: null
      }));
    }

    const newEvent = await database.createEvent({
      title: formTitle,
      subtitle: formSubtitle || "A premium experience host by Luxe.",
      description: formDesc || "No description provided.",
      category: "Music",
      date: formDate,
      time: formTime || "19:00 - 22:00",
      location: formLoc,
      price: parseInt(formPrice),
      image: "/images/indie_showcase.jpg", // Default placeholder from generated assets
      organizer: "Luxe Owner",
      ticketTiers,
      seats, // Pass custom seats map!
      cols: activeTemplate ? activeTemplate.cols : 8
    });

    if (newEvent) {
      setEventAdded(true);
      const allEvents = await database.getEvents();
      setEvents(allEvents);
      
      // Clear form
      setFormTitle("");
      setFormSubtitle("");
      setFormDesc("");
      setFormDate("");
      setFormTime("");
      setFormLoc("");
      setFormPrice(40);
      setAiResponse(null);

      setTimeout(() => {
        setEventAdded(false);
      }, 3000);
    }
  };

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
            Loading organizer space...
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
              {isRegister ? "Create Profile" : "Organizer Portal"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "8px", fontWeight: "300" }}>
              Please sign in to access the backstage control suite and organizer metrics.
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
              {authSubmitting ? "Authenticating..." : isRegister ? "Register & Enter" : "Unlock Backstage"}
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

  if (!analytics) return null;

  const totalBookedSeats = bookings.reduce((acc, b) => acc + (b.seats ? b.seats.length : 1), 0);
  const totalCheckedIn = bookings.filter(b => b.isCheckedIn).reduce((acc, b) => acc + (b.seats ? b.seats.length : 1), 0);
  const checkInRate = totalBookedSeats > 0 ? Math.round((totalCheckedIn / totalBookedSeats) * 100) : 0;
  
  const completedTasks = plannerTasks.filter(t => t.status === "done").length;
  const totalTasks = plannerTasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const recentCheckIns = bookings
    .filter(b => b.isCheckedIn)
    .slice(-3)
    .reverse(); // latest first

  return (
    <main style={{ padding: "0 24px", maxWidth: "1250px", margin: "0 auto", marginTop: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user?.logo ? (
            <img 
              src={user.logo} 
              alt="Organization Logo" 
              style={{ width: "50px", height: "50px", borderRadius: "50%", border: "2px solid var(--accent-gold)", objectFit: "cover" }} 
            />
          ) : (
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(212, 175, 55, 0.1)",
              border: "2px solid rgba(212, 175, 55, 0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "var(--accent-gold)",
              fontFamily: "var(--font-serif)",
              fontSize: "1.4rem",
              fontWeight: "700"
            }}>
              L
            </div>
          )}
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: "700", margin: 0 }}>
              {database.translate("organizerDashboard", user?.language)}
            </h1>
            {user?.businessName && (
              <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)", letterSpacing: "1px", textTransform: "uppercase", fontWeight: "600", display: "block", marginTop: "2px" }}>
                {user.businessName}
              </span>
            )}
          </div>
        </div>
        
        {/* Tier status indicator */}
        <div style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "8px 16px",
          borderRadius: "20px",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ color: "var(--text-secondary)" }}>Plan:</span>
          <strong style={{
            color: user?.subscription === "Enterprise" ? "#a855f7" : user?.subscription === "Pro" ? "var(--accent-gold)" : "var(--text-primary)",
            textTransform: "uppercase",
            fontSize: "0.8rem",
            letterSpacing: "0.5px"
          }}>
            Luxe {user?.subscription || "Pro"}
          </strong>
        </div>
      </div>

      {/* Grid of basic metrics widgets */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        marginBottom: "40px"
      }}>
        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--accent-gold)" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>{database.translate("revenue", user?.language)}</span>
            <span style={{ fontSize: "1.6rem", fontWeight: "700" }}>{database.formatPrice(analytics.totalRevenue, user?.currency)}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--accent-gold)" }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>{database.translate("ticketsSold", user?.language)}</span>
            <span style={{ fontSize: "1.6rem", fontWeight: "700" }}>{analytics.totalTicketsSold}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--accent-gold)" }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Active Campaigns</span>
            <span style={{ fontSize: "1.6rem", fontWeight: "700" }}>{analytics.activeEvents}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "12px", borderRadius: "12px", color: "#10b981" }}>
            <CreditCard size={24} />
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Stripe Payout (Pending)</span>
            <span style={{ fontSize: "1.3rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              {database.formatPrice(4820, user?.currency)} <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16, 185, 129, 0.08)", padding: "2px 6px", borderRadius: "4px" }}>Auto</span>
            </span>
          </div>
        </div>
      </section>

      {/* Operations Control Deck Section */}
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
        <ShieldCheck size={20} color="var(--accent-gold)" /> {database.translate("backstageControlSuite", user?.language)}
      </h2>
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "40px"
      }}>
        {/* CRM */}
        <Link href="/dashboard/organizer/crm" style={{ display: "block" }}>
          <div className="glass-panel" style={{ 
            padding: "20px", 
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "var(--accent-gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
          }}>
            <div style={{ background: "rgba(168, 85, 247, 0.1)", padding: "10px", borderRadius: "10px", color: "#a855f7", width: "max-content", marginBottom: "14px" }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>{database.translate("guestCRM", user?.language)}</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.3" }}>{database.translate("crmDesc", user?.language)}</p>
          </div>
        </Link>

        {/* Promo Codes */}
        <Link href="/dashboard/organizer/promo-codes" style={{ display: "block" }}>
          <div className="glass-panel" style={{ 
            padding: "20px", 
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "var(--accent-gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
          }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "10px", color: "#10b981", width: "max-content", marginBottom: "14px" }}>
              <Tag size={20} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>{database.translate("promoEngine", user?.language)}</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.3" }}>{database.translate("promoDesc", user?.language)}</p>
          </div>
        </Link>

        {/* Kanban Board */}
        <Link href="/dashboard/organizer/planner" style={{ display: "block" }}>
          <div className="glass-panel" style={{ 
            padding: "20px", 
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "var(--accent-gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
          }}>
            <div style={{ background: "rgba(14, 165, 233, 0.1)", padding: "10px", borderRadius: "10px", color: "#0ea5e9", width: "max-content", marginBottom: "14px" }}>
              <ClipboardList size={20} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>{database.translate("backstagePlanner", user?.language)}</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.3" }}>{database.translate("plannerDesc", user?.language)}</p>
          </div>
        </Link>

        {/* Layout Templates */}
        <Link href="/dashboard/organizer/design-layout" style={{ display: "block" }}>
          <div className="glass-panel" style={{ 
            padding: "20px", 
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "var(--accent-gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
          }}>
            <div style={{ background: "rgba(244, 63, 94, 0.1)", padding: "10px", borderRadius: "10px", color: "#f43f5e", width: "max-content", marginBottom: "14px" }}>
              <Layout size={20} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>{database.translate("layoutDesigner", user?.language)}</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.3" }}>{database.translate("layoutDesc", user?.language)}</p>
          </div>
        </Link>

        {/* Ticket Scanner */}
        <Link href="/dashboard/organizer/scan" style={{ display: "block" }}>
          <div className="glass-panel" style={{ 
            padding: "20px", 
            cursor: "pointer",
            transition: "all 0.3s ease",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.borderColor = "var(--accent-gold)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
          }}>
            <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "10px", borderRadius: "10px", color: "var(--accent-gold)", width: "max-content", marginBottom: "14px" }}>
              <QrCode size={20} />
            </div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>{database.translate("gateScanner", user?.language)}</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.3" }}>{database.translate("gateDesc", user?.language)}</p>
          </div>
        </Link>
      </section>

      {/* Analytics Charts and Create Event Forms */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "40px",
        alignItems: "start",
        marginBottom: "60px"
      }}>
        
        {/* Left column: AI Generator & Event Creator */}
        <section style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* AI Strategy Assister */}
          <div className="glass-panel-gold" style={{ padding: "32px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Cpu size={18} color="var(--accent-gold)" /> AI Strategy & Copy Creator
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "300", marginBottom: "20px" }}>
              Describe your event idea in plain text (e.g. \"intimate rooftop jazz session with cocktails\" or \"underground industrial warehouse techno party\") and let our AI agent draft the marketing tagline, ticketing structure, and full description.
            </p>

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <input 
                type="text"
                placeholder="What kind of concert/event are you planning?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
              <button 
                onClick={handleAIAssist}
                disabled={aiLoading}
                className="btn-primary"
                style={{
                  padding: "0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap"
                }}
              >
                <Sparkles size={16} /> Assist Me
              </button>
            </div>

            {/* AI Loading state */}
            {aiLoading && (
              <div style={{
                padding: "24px",
                background: "rgba(255,255,255,0.01)",
                border: "1px dashed rgba(212,175,55,0.2)",
                borderRadius: "12px",
                textAlign: "center"
              }} className="shimmer-bg">
                <div style={{ display: "inline-block", border: "3px solid rgba(212,175,55,0.1)", borderTop: "3px solid var(--accent-gold)", borderRadius: "50%", width: "24px", height: "24px", animation: "spin 1s linear infinite", marginBottom: "12px" }}></div>
                <p style={{ fontSize: "0.9rem", color: "var(--accent-gold)" }}>{aiLoadingSteps[loadingStep]}</p>
              </div>
            )}

            {/* AI Results panel */}
            {aiResponse && (
              <div style={{
                padding: "24px",
                background: "rgba(212, 175, 55, 0.03)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                borderRadius: "16px",
                marginTop: "20px"
              }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                  <CheckCircle size={12} /> AI Strategy Generated (Autofilled Below)
                </span>
                
                <h4 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "6px" }}>{aiResponse.title}</h4>
                <p style={{ fontStyle: "italic", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>\"{aiResponse.subtitle}\"</p>
                
                <div style={{ marginBottom: "16px", fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>Suggested Pricing:</span>
                  <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                    {aiResponse.tiers.map((t, idx) => (
                      <span key={idx} style={{ background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {t.name}: {database.formatPrice(t.price, user?.currency)}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem" }}>
                  <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>Event Timeline:</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px" }}>
                    {aiResponse.timeline.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "8px" }}>
                        <span style={{ color: "var(--accent-gold)", fontWeight: "700" }}>{item.time}</span>
                        <span>{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event creation form */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "24px" }}>Launch New Experience</h2>
            
            {eventAdded && (
              <div style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid #10b981",
                color: "#10b981",
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <CheckCircle size={16} /> Experience successfully listed on the active Luxe discovery board!
              </div>
            )}

            <form onSubmit={handleSubmitEvent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Event Name" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="glass-input" 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Tagline</label>
                  <input 
                    type="text" 
                    placeholder="Brief Tagline" 
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="glass-input" 
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Tell your attendees about the experience..." 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="glass-input"
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="glass-input" 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Time Range</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 19:00 - 22:00" 
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="glass-input" 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Venue / Location</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Venue, City" 
                    value={formLoc}
                    onChange={(e) => setFormLoc(e.target.value)}
                    className="glass-input" 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Base Price ({user?.currency || "CAD"})</label>
                  <input 
                    type="number" 
                    required 
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="glass-input" 
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>Seating Layout Template</label>
                  <Link href="/dashboard/organizer/design-layout" style={{ fontSize: "0.75rem", color: "var(--accent-gold)" }}>
                    + Design Custom Layout
                  </Link>
                </div>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="glass-input"
                  style={{ background: "rgba(12, 15, 36, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)", cursor: "pointer" }}
                >
                  {layoutTemplates.map((template, idx) => (
                    <option key={idx} value={template.name} style={{ background: "#0c0f24", color: "#f8fafc" }}>
                      {template.name} ({template.rows}x{template.cols} Grid)
                    </option>
                  ))}
                  <option value="" style={{ background: "#0c0f24", color: "#f8fafc" }}>Default Rectangular Grid (40 seats)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
                <Plus size={16} /> Publish Experience
              </button>
            </form>
          </div>

          {/* Promo Code Campaigns Performance */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <Tag size={18} color="var(--accent-gold)" /> Promo Code Revenue Impact
              </h3>
              <Link href="/dashboard/organizer/promo-codes" style={{ fontSize: "0.75rem", color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: "2px" }} className="nav-link">
                Manage Codes <ArrowRight size={12} />
              </Link>
            </div>

            {promoCodes.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                No active promo codes to track.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "10px 8px", fontWeight: "600" }}>Code</th>
                      <th style={{ padding: "10px 8px", fontWeight: "600" }}>Discount</th>
                      <th style={{ padding: "10px 8px", fontWeight: "600", textAlign: "center" }}>Uses</th>
                      <th style={{ padding: "10px 8px", fontWeight: "600", textAlign: "right" }}>Attributed Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((code) => {
                      const matchingBookings = bookings.filter(b => b.promoCodeUsed === code.code);
                      const uses = code.usageCount || matchingBookings.length;
                      const attributedRevenue = matchingBookings.reduce((acc, b) => acc + b.totalPrice, 0) + (uses * 45); // simulated base revenue
                      
                      return (
                        <tr key={code.code} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "12px 8px", fontWeight: "700", color: "var(--accent-gold)" }}>{code.code}</td>
                          <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>
                            {code.type === "percent" ? `${code.discount}% Off` : `${database.formatPrice(code.discount, user?.currency)} Off`}
                          </td>
                          <td style={{ padding: "12px 8px", textAlign: "center" }}>{uses}</td>
                          <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", color: "var(--text-primary)" }}>
                            {database.formatPrice(attributedRevenue, user?.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right column: Analytics graphs */}
        <section style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Live Check-In Velocity Speedometer & Guest Ticker */}
          <div className="glass-panel-gold" style={{ padding: "32px", border: "1px solid rgba(212, 175, 55, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <QrCode size={18} color="var(--accent-gold)" /> Live Gate Check-In
              </h3>
              <span style={{ 
                fontSize: "0.7rem", 
                background: "rgba(16, 185, 129, 0.08)", 
                color: "#10b981", 
                padding: "4px 10px", 
                borderRadius: "100px", 
                fontWeight: "700", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                border: "1px solid rgba(16, 185, 129, 0.15)"
              }}>
                <span className="live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></span> Live Gates Open
              </span>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "24px" }}>
              {/* Circular gauge */}
              <div style={{ position: "relative", width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="90" height="90" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeDasharray={`${checkInRate}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#aa8010" />
                      <stop offset="100%" stopColor="var(--accent-gold)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "var(--accent-gold)"
                }}>
                  {checkInRate}%
                </div>
              </div>

              {/* Counts */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  {totalCheckedIn} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "400" }}>/ {totalBookedSeats} Checked In</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                  Arrivals Rate: {totalCheckedIn > 0 ? (totalCheckedIn * 3.5).toFixed(0) : 0} arrivals/hour
                </span>
              </div>
            </div>

            {/* VIP Ticker / Notifications */}
            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "16px" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", display: "block", marginBottom: "10px" }}>
                Recent Arrivals
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recentCheckIns.length === 0 ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No gate activity recorded yet.</span>
                ) : (
                  recentCheckIns.map(b => {
                    const isVIP = b.notes && (b.notes.toLowerCase().includes("vip") || b.notes.toLowerCase().includes("performer"));
                    return (
                      <div 
                        key={b.id} 
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: isVIP ? "rgba(212, 175, 55, 0.05)" : "rgba(255, 255, 255, 0.01)",
                          border: isVIP ? "1px solid rgba(212, 175, 55, 0.2)" : "1px solid rgba(255, 255, 255, 0.03)"
                        }}
                        className={isVIP ? "vip-glow" : ""}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isVIP ? "var(--accent-gold)" : "#10b981" }}></div>
                          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: isVIP ? "var(--accent-gold)" : "var(--text-primary)" }}>
                            {b.selectedBy || "Secured Guest"}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {isVIP ? "VIP Notes" : "Standard"} • {b.checkInTime}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Backstage Operations Status */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                <ClipboardList size={18} color="var(--accent-gold)" /> Backstage Operations Status
              </h3>
              <Link href="/dashboard/organizer/planner" style={{ fontSize: "0.75rem", color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: "2px" }} className="nav-link">
                Go to Board <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
                  <span style={{ fontWeight: "500" }}>Preparation Checklist Completed</span>
                  <span style={{ fontWeight: "700", color: "var(--accent-gold)" }}>{completedTasks} / {totalTasks} Tasks ({taskCompletionRate}%)</span>
                </div>
                <div style={{
                  height: "8px",
                  width: "100%",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{
                    width: `${taskCompletionRate}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #aa8010, var(--accent-gold))",
                    borderRadius: "4px",
                    transition: "width 0.5s ease"
                  }}></div>
                </div>
              </div>

              {/* Display 3 incomplete tasks */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                {plannerTasks.filter(t => t.status !== "done").slice(0, 3).map(task => (
                  <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{task.title}</span>
                    <span style={{
                      fontSize: "0.65rem",
                      fontWeight: "600",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: task.status === "in_progress" ? "rgba(212,175,55,0.08)" : "rgba(244,63,94,0.08)",
                      color: task.status === "in_progress" ? "var(--accent-gold)" : "#f43f5e"
                    }}>
                      {task.status === "in_progress" ? "Active" : "Todo"}
                    </span>
                  </div>
                ))}
                {plannerTasks.filter(t => t.status !== "done").length === 0 && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>All backstage items completed!</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Sales velocity mock graph */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              <TrendingUp size={16} color="var(--accent-gold)" /> Sales Velocity (Weekly)
            </h3>
            
            {/* Visual HTML Bar chart */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              height: "200px",
              padding: "0 10px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "16px"
            }}>
              {analytics.salesVelocity.map((day, idx) => {
                const maxSales = Math.max(...analytics.salesVelocity.map(d => d.sales));
                const barHeight = (day.sales / maxSales) * 160; // Max height 160px
                
                return (
                  <div key={idx} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    gap: "8px"
                  }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>{day.sales}</span>
                    <div style={{
                      width: "24px",
                      height: `${barHeight}px`,
                      background: "linear-gradient(to top, var(--accent-gold) 0%, #aa8010 100%)",
                      borderRadius: "4px 4px 0 0",
                      boxShadow: "0 4px 10px rgba(212, 175, 55, 0.15)",
                      transition: "height 0.5s ease"
                    }} className="shimmer-bg"></div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>{day.date.split(" ")[1]}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>Daily ticket conversions (June 1 - June 7)</p>
          </div>

          {/* Demographics chart */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              <Users size={16} color="var(--accent-gold)" /> Attendee Demographics
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {analytics.demographics.map((demo, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                    <span style={{ fontWeight: "500" }}>{demo.group} Age Group</span>
                    <span style={{ fontWeight: "700", color: "var(--accent-gold)" }}>{demo.percentage}%</span>
                  </div>
                  <div style={{
                    height: "8px",
                    width: "100%",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div style={{
                      width: `${demo.percentage}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #aa8010, var(--accent-gold))",
                      borderRadius: "4px"
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Campaign lists */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px" }}>Your Listed Campaigns</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {events.map((event) => (
                <div 
                  key={event.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.03)"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "600", fontSize: "0.9rem", display: "block" }}>{event.title}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{event.date}</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .live-dot {
          animation: ping-pulse 1.5s infinite;
        }
        @keyframes ping-pulse {
          0% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.3; transform: scale(0.9); }
        }
        .vip-glow {
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
          animation: vip-glow-pulse 2s infinite alternate;
        }
        @keyframes vip-glow-pulse {
          0% { border-color: rgba(212, 175, 55, 0.15); }
          100% { border-color: rgba(212, 175, 55, 0.4); }
        }
      `}</style>
    </main>
  );
}
