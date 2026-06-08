"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock, ArrowLeft, ShieldCheck, Armchair, Ticket, Users, Info } from "lucide-react";
import Link from "next/link";
import { database } from "@/lib/database";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

export default function EventDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>Loading premium seating map...</div>
      </div>
    }>
      <EventDetail />
    </Suspense>
  );
}

function EventDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const splitGroupId = searchParams ? searchParams.get("splitGroupId") : null;
  const splitSeatsStr = searchParams ? searchParams.get("seats") : null;
  const splitSeats = splitSeatsStr ? splitSeatsStr.split(",") : [];

  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitLink, setSplitLink] = useState("");
  const [presenceMap, setPresenceMap] = useState({});
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [perspective3D, setPerspective3D] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  const calculateSeatView = (seatId) => {
    if (!seatId) return null;
    const row = seatId.charAt(0);
    const col = parseInt(seatId.substring(1), 10);
    
    let proximity = 100;
    let angle = "Center";
    let viewQuality = "Excellent";
    
    if ("ABC".includes(row)) {
      proximity = 95 + (3 - "ABC".indexOf(row));
      viewQuality = "Unobstructed Direct View";
    } else if ("DEF".includes(row)) {
      proximity = 75 + (3 - "DEF".indexOf(row)) * 5;
      viewQuality = "Perfect Mid-Tier View";
    } else {
      proximity = 55 + (10 - col) * 2;
      viewQuality = "Wide Elevated Panoramic View";
    }
    
    if (col <= 3) {
      angle = "Left Wing";
    } else if (col >= 8) {
      angle = "Right Wing";
    } else {
      angle = "Premium Center Stage";
    }
    
    return {
      proximity,
      angle,
      viewQuality,
      description: `${angle} - ${proximity}% Stage Proximity. ${viewQuality}.`
    };
  };

  const playAcousticSample = (seatId) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      const delay = ctx.createDelay();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      const row = seatId.charAt(0);
      const col = parseInt(seatId.substring(1), 10) || 5;

      let volume = 0.15;
      let delayTime = 0.05;
      let filterFreq = 1200;
      let pan = 0.0;

      if (col <= 3) {
        pan = -0.7;
      } else if (col >= 8) {
        pan = 0.7;
      } else {
        pan = (col - 5) * 0.15;
      }

      if ("ABC".includes(row)) {
        volume = 0.22;
        delayTime = 0.015;
        filterFreq = 800;
        filter.type = "lowshelf";
        filter.gain.value = 12;
      } else if ("DEF".includes(row)) {
        volume = 0.14;
        delayTime = 0.08;
        filterFreq = 1400;
        filter.type = "peaking";
        filter.Q.value = 1.0;
        filter.gain.value = 2;
      } else {
        volume = 0.08;
        delayTime = 0.22;
        filterFreq = 900;
        filter.type = "lowpass";
      }

      const now = ctx.currentTime;
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 1.2);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(277.18, now);
      osc2.frequency.exponentialRampToValueAtTime(554.37, now + 1.2);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      delay.delayTime.setValueAtTime(delayTime, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);

      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(row >= 'G' ? 0.45 : 0.15, now);
      
      gainNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      
      if (panner) {
        panner.pan.setValueAtTime(pan, now);
        gainNode.connect(panner);
        delay.connect(panner);
        panner.connect(ctx.destination);
      } else {
        gainNode.connect(ctx.destination);
        delay.connect(ctx.destination);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);

      const toast = document.createElement("div");
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: rgba(212, 175, 55, 0.95);
        color: #060813;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.2);
        transition: opacity 0.3s ease-out;
      `;
      toast.innerText = `🎧 Acoustic Profile Audited: Panning ${pan > 0 ? "Right" : pan < 0 ? "Left" : "Center"} | Echo ${Math.floor(delayTime * 1000)}ms`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    } catch (e) {
      console.error("Web Audio failed", e);
    }
  };

  const handleApplyPromo = async () => {
    setPromoError("");
    setPromoSuccess("");
    if (!promoCodeInput.trim()) return;

    const promo = await database.validatePromoCode(promoCodeInput);
    if (promo) {
      setAppliedPromo(promo);
      setPromoSuccess(`Code ${promo.code} applied! Discount: ${promo.type === 'percent' ? promo.discount + '%' : database.formatPrice(promo.discount, user?.currency)}`);
    } else {
      setAppliedPromo(null);
      setPromoError("Invalid promotional code.");
    }
  };

  // Compute a stable session username if not authenticated
  const getSessionUser = () => {
    if (user?.name) return user.name;
    if (typeof window === "undefined") return "Guest";
    let cached = window.sessionStorage.getItem("luxe_anon_user");
    if (!cached) {
      cached = "Guest-" + Math.floor(1000 + Math.random() * 9000);
      window.sessionStorage.setItem("luxe_anon_user", cached);
    }
    return cached;
  };

  // Compute a unique client ID for this tab session to distinguish tabs/sessions
  const getClientId = () => {
    if (typeof window === "undefined") return "Guest:main";
    const userName = getSessionUser();
    let tabId = window.sessionStorage.getItem("luxe_tab_id");
    if (!tabId) {
      tabId = Math.random().toString(36).substring(2, 9);
      window.sessionStorage.setItem("luxe_tab_id", tabId);
    }
    return `${userName}:${tabId}`;
  };

  useEffect(() => {
    database.getEventById(id).then(currentEvent => {
      if (!currentEvent) {
        router.push("/");
      } else {
        setEvent(currentEvent);
        // Auto-select first available group seat if joining via split link
        if (splitSeats.length > 0 && currentEvent.seats) {
          const firstAvailable = currentEvent.seats.find(s => splitSeats.includes(s.id) && !s.isBooked);
          if (firstAvailable) {
            setSelectedSeats([firstAvailable]);
          }
        }
      }
    });
  }, [id, router, splitSeatsStr]);

  // Subscribe to real-time presence of other attendees
  useEffect(() => {
    if (!event) return;
    const clientId = getClientId();

    const unsubscribe = database.subscribeToPresence(event.id, clientId, (updatedPresence) => {
      setPresenceMap(updatedPresence);
    });

    return () => {
      database.updatePresence(event.id, clientId, null, "disconnect");
      unsubscribe();
    };
  }, [event, user]);

  // Handle local hovers
  const handleMouseEnterSeat = (seatId) => {
    if (!event) return;
    const isSelected = selectedSeats.some(s => s.id === seatId);
    if (isSelected) return; // Maintain selected presence
    const clientId = getClientId();
    database.updatePresence(event.id, clientId, seatId, "hover");
  };

  const handleMouseLeaveSeat = (seatId) => {
    if (!event) return;
    const isSelected = selectedSeats.some(s => s.id === seatId);
    if (isSelected) return;
    const clientId = getClientId();
    database.updatePresence(event.id, clientId, seatId, "unhover");
  };

  if (!event) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <div style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>Loading premium seating map...</div>
      </div>
    );
  }

  // Toggle seat selection
  const handleSeatClick = async (seat) => {
    if (seat.isBooked) return;
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const userName = getSessionUser();
    const clientId = getClientId();

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      database.updatePresence(event.id, clientId, seat.id, "hover");
    } else {
      // Hold the seat in database first
      const held = await database.holdSeats(event.id, [seat.id], userName);
      if (held) {
        setSelectedSeats([...selectedSeats, seat]);
        database.updatePresence(event.id, clientId, seat.id, "select");
      } else {
        alert(`Seat ${seat.id} is temporarily held by another attendee. Please choose a different seat.`);
      }
    }
  };

  // Calculate total price with optional promo code discount
  const basePrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === "percent") {
      discountAmount = (basePrice * appliedPromo.discount) / 100;
    } else {
      discountAmount = appliedPromo.discount;
    }
  }
  const totalPrice = Math.max(0, basePrice - discountAmount);

  const getPricingSplit = () => {
    let artistAmount = 0;
    let venueAmount = 0;
    let luxeAmount = 0;

    selectedSeats.forEach(seat => {
      if (seat.price >= 150) {
        artistAmount += seat.price * 0.85;
        venueAmount += seat.price * 0.10;
        luxeAmount += seat.price * 0.05;
      } else {
        artistAmount += seat.price * 0.75;
        venueAmount += seat.price * 0.15;
        luxeAmount += seat.price * 0.10;
      }
    });

    if (basePrice > 0 && discountAmount > 0) {
      const ratio = totalPrice / basePrice;
      artistAmount *= ratio;
      venueAmount *= ratio;
      luxeAmount *= ratio;
    }

    const totalCalculated = artistAmount + venueAmount + luxeAmount;
    
    return {
      artistAmount,
      venueAmount,
      luxeAmount,
      artistPercent: totalCalculated > 0 ? Math.round((artistAmount / totalCalculated) * 100) : 75,
      venuePercent: totalCalculated > 0 ? Math.round((venueAmount / totalCalculated) * 100) : 15,
      luxePercent: totalCalculated > 0 ? (100 - Math.round((artistAmount / totalCalculated) * 100) - Math.round((venueAmount / totalCalculated) * 100)) : 10
    };
  };

  // Run checkout booking
  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    setIsBooking(true);

    try {
      const seatIds = selectedSeats.map(s => s.id);
      const checkoutPrice = splitPayment 
        ? (selectedSeats[0].price * (totalPrice / basePrice)) 
        : totalPrice;
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          seats: splitPayment ? [seatIds[0]] : seatIds, // Checkout first seat if splitting
          totalPrice: checkoutPrice
        })
      });

      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // Book seats in local database (Sandbox simulation)
        if (!data.live) {
            if (splitPayment) {
              // Book first seat
              const booking = await database.bookSeats(event.id, [seatIds[0]], appliedPromo?.code);
              // Lock other seats for friends
              await database.holdSeats(event.id, seatIds.slice(1), "Split Group Hold");
              
              // Set group link
              const url = window.location.origin + `/events/${event.id}?splitGroupId=${booking.id}&seats=${seatIds.slice(1).join(",")}`;
              setSplitLink(url);
            } else {
              await database.bookSeats(event.id, seatIds, appliedPromo?.code);
            }
        }

        setIsBooking(false);
        setBookingSuccess(true);
        
        // Trigger high-end confetti explosion!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#d4af37", "#f8fafc", "#aa8010", "#a855f7"]
        });

        // Redirect only if not splitting payment
        if (!splitPayment) {
          setTimeout(() => {
            window.location.href = data.sessionUrl;
          }, 1500);
        }
      } else {
        throw new Error(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("Checkout failed: " + err.message);
      setIsBooking(false);
    }
  };

  return (
    <main style={{ padding: "0 24px", maxWidth: "1250px", margin: "0 auto", marginTop: "40px" }}>
      
      {/* Organizer Editor Alert Banner */}
      {user?.role === "organizer" && (
        <div className="glass-panel-gold pulse-border" style={{
          padding: "16px 24px",
          borderRadius: "16px",
          marginBottom: "24px",
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(12, 15, 36, 0.9) 100%)",
          border: "1px solid var(--accent-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          boxShadow: "0 0 15px rgba(212, 175, 55, 0.2)"
        }}>
          <div>
            <h4 style={{ color: "var(--accent-gold)", fontWeight: "600", fontSize: "1.05rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={18} color="var(--accent-gold)" /> Organizer View Mode
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "4px 0 0 0", lineHeight: "1.4" }}>
              You are viewing this experience details page. You can modify its seating configuration, details, or cancel the event.
            </p>
          </div>
          <Link href={`/dashboard/organizer?edit=${event.id}`} className="btn-primary" style={{
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: "600",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            textDecoration: "none",
            display: "inline-block"
          }}>
            Edit Event Details
          </Link>
        </div>
      )}

      {/* Group Split Booking Banner */}
      {splitGroupId && (
        <div className="glass-panel-gold pulse-border" style={{
          padding: "20px 24px",
          borderRadius: "16px",
          marginBottom: "24px",
          background: "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
          border: "1px solid var(--accent-gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)"
        }}>
          <div>
            <h4 style={{ color: "var(--accent-gold)", fontWeight: "600", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <Users size={18} color="var(--accent-gold)" /> Joined Group Split Booking
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "4px 0 0 0", lineHeight: "1.4" }}>
              You are joining booking group <strong>{splitGroupId}</strong>! Select one of the highlighted seats reserved for your group (<strong>{splitSeats.join(", ")}</strong>).
            </p>
          </div>
          <span style={{
            fontSize: "0.75rem",
            background: "rgba(168, 85, 247, 0.2)",
            color: "#a855f7",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            padding: "4px 10px",
            borderRadius: "100px",
            fontWeight: "600"
          }}>
            Active Split Invite
          </span>
        </div>
      )}
      
      {/* Back button */}
      <Link href="/" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "var(--text-secondary)",
        fontSize: "0.95rem",
        marginBottom: "24px"
      }} className="nav-link">
        <ArrowLeft size={16} /> Back to Experiences
      </Link>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "40px",
        alignItems: "start"
      }}>
        
        {/* Left Column: Event details */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Cover image & Title */}
          <div className="glass-panel" style={{ overflow: "hidden", borderRadius: "20px" }}>
            <div style={{ position: "relative", height: "280px", width: "100%" }}>
              <Image 
                src={event.image} 
                alt={event.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            
            <div style={{ padding: "32px" }}>
              <span style={{
                color: "var(--accent-gold)",
                fontWeight: "600",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "block",
                marginBottom: "8px"
              }}>{event.category}</span>
              
              <h1 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.4rem",
                fontWeight: "700",
                marginBottom: "12px",
                lineHeight: 1.1
              }}>{event.title}</h1>
              
              <p style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                fontWeight: "300",
                marginBottom: "24px",
                lineHeight: "1.6"
              }}>{event.description}</p>

              {/* Event Metadata */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Calendar size={18} color="var(--accent-gold)" />
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Date</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Clock size={18} color="var(--accent-gold)" />
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Time</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>{event.time}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <MapPin size={18} color="var(--accent-gold)" />
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Venue</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Tiers list */}
          <div className="glass-panel" style={{ padding: "32px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "20px" }}>Pricing Tiers</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {event.ticketTiers.map((tier, i) => (
                <div 
                  key={i} 
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: "600", fontSize: "0.95rem", display: "block" }}>{tier.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "300" }}>{tier.description}</span>
                  </div>
                  <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--accent-gold)" }}>{database.formatPrice(tier.price, user?.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Seating map & reservation panel */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div className="glass-panel" style={{ padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "600", margin: 0 }}>Interactive Seating Grid</h2>
              <button 
                onClick={() => setPerspective3D(!perspective3D)}
                className="btn-secondary"
                style={{
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  background: perspective3D ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "rgba(255, 255, 255, 0.03)",
                  color: perspective3D ? "#000" : "var(--text-secondary)",
                  border: perspective3D ? "none" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                }}
              >
                <Sparkles size={12} />
                <span>{perspective3D ? "3.5D View Active" : "Enable 3.5D View"}</span>
              </button>
            </div>

            {/* STAGE visualization */}
            <div style={{
              width: "80%",
              height: "40px",
              background: "rgba(212, 175, 55, 0.05)",
              border: "2px solid var(--accent-gold-glow)",
              borderBottom: "none",
              borderRadius: "100px 100px 0 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: perspective3D ? "70px" : "50px",
              position: "relative",
              boxShadow: "0 -10px 30px rgba(212, 175, 55, 0.15)",
              transform: perspective3D ? "perspective(800px) rotateX(15deg) scale(1.05)" : "none",
              transition: "all 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
            }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "700", letterSpacing: "5px", color: "var(--accent-gold)", textTransform: "uppercase" }}>STAGE</span>
              
              {/* Floating Stage Light Beams */}
              {perspective3D && (
                <>
                  <div style={{
                    position: "absolute",
                    top: "38px",
                    left: "20%",
                    width: "2px",
                    height: "120px",
                    background: "linear-gradient(to bottom, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0) 100%)",
                    transform: "rotate(25deg)",
                    transformOrigin: "top center",
                    filter: "blur(2px)",
                    pointerEvents: "none",
                    animation: "pulse 3s infinite alternate"
                  }} />
                  <div style={{
                    position: "absolute",
                    top: "38px",
                    right: "20%",
                    width: "2px",
                    height: "120px",
                    background: "linear-gradient(to bottom, rgba(218, 119, 6, 0.4) 0%, rgba(218, 119, 6, 0) 100%)",
                    transform: "rotate(-25deg)",
                    transformOrigin: "top center",
                    filter: "blur(2px)",
                    pointerEvents: "none",
                    animation: "pulse 3s infinite alternate-reverse"
                  }} />
                </>
              )}
            </div>

            {/* Grid seating map */}
            <div style={{
              display: "grid",
              // Dynamically adjust grid layout columns based on rows count
              gridTemplateColumns: `repeat(${event.cols || (event.id === "jazz-resonance" ? 6 : event.id === "symphony-lights" ? 8 : event.id === "neon-indie-showcase" ? 8 : 10)}, 1fr)`,
              gap: "8px",
              width: "100%",
              maxWidth: "500px",
              marginBottom: "40px",
              padding: "16px",
              background: "rgba(255, 255, 255, 0.01)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.03)",
              transformStyle: "preserve-3d",
              transform: perspective3D ? "perspective(1000px) rotateX(28deg) translateY(-10px) scale(0.96)" : "none",
              transition: "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)"
            }}>
              {event.seats.map((seat) => {
                const isSelected = selectedSeats.some(s => s.id === seat.id);
                const isCorridor = seat.tier === "Corridor / Aisle";

                if (isCorridor) {
                  return (
                    <div
                      key={seat.id}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        background: "transparent"
                      }}
                    />
                  );
                }
                
                // Find any other users hovering or selecting this seat
                const myUserName = getSessionUser();
                const occupants = Object.entries(presenceMap).filter(([u, state]) => 
                  u !== myUserName && state.seatId === seat.id
                );
                
                const isFriendHovering = occupants.some(([_, state]) => state.action === "hover");
                const isFriendSelecting = occupants.some(([_, state]) => state.action === "select");

                // Color configuration depending on seat status
                let seatColor = "rgba(255, 255, 255, 0.04)";
                let seatBorder = "1px solid rgba(255, 255, 255, 0.1)";
                let seatShadow = "none";
                let cursor = "pointer";
                const isGroupSeat = splitSeats.includes(seat.id);

                if (seat.isBooked) {
                  seatColor = "rgba(255, 255, 255, 0.01)";
                  seatBorder = "1px dashed rgba(255, 255, 255, 0.05)";
                  cursor = "not-allowed";
                } else if (isSelected) {
                  seatColor = "var(--accent-gold)";
                  seatBorder = "1px solid var(--accent-gold)";
                } else if (isFriendSelecting) {
                  seatColor = "rgba(168, 85, 247, 0.15)";
                  seatBorder = "2px solid #a855f7";
                  seatShadow = "0 0 12px rgba(168, 85, 247, 0.5)";
                } else if (isFriendHovering) {
                  seatColor = "rgba(59, 130, 246, 0.08)";
                  seatBorder = "2px solid #3b82f6";
                  seatShadow = "0 0 8px rgba(59, 130, 246, 0.4)";
                } else if (isGroupSeat) {
                  seatColor = "rgba(168, 85, 247, 0.12)";
                  seatBorder = "2px solid #a855f7";
                  seatShadow = "0 0 10px rgba(168, 85, 247, 0.4)";
                } else if (seat.tier.includes("Lounge") || seat.tier.includes("VIP")) {
                  seatBorder = "1px solid rgba(212, 175, 55, 0.35)"; // VIP seats gold outline
                }

                // Title tooltip
                let seatTitle = `${seat.id} (${seat.tier}) - ${database.formatPrice(seat.price, user?.currency)}`;
                if (isFriendSelecting) {
                  const selectNames = occupants.filter(([_, s]) => s.action === "select").map(([u]) => u).join(", ");
                  seatTitle += ` (Held by ${selectNames})`;
                } else if (isFriendHovering) {
                  const hoverNames = occupants.filter(([_, s]) => s.action === "hover").map(([u]) => u).join(", ");
                  seatTitle += ` (Eyeing by ${hoverNames})`;
                } else if (isGroupSeat && !seat.isBooked) {
                  seatTitle += ` (Reserved for your group)`;
                }

                // Determine custom classes
                let seatClass = "";
                if (isSelected) {
                  seatClass = "shimmer-bg";
                } else if (isFriendSelecting) {
                  seatClass = "pulse-border";
                } else if (isGroupSeat && !seat.isBooked) {
                  seatClass = "pulse-border";
                }

                return (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat)}
                    onMouseEnter={() => handleMouseEnterSeat(seat.id)}
                    onMouseLeave={() => handleMouseLeaveSeat(seat.id)}
                    disabled={seat.isBooked}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "6px",
                      background: seatColor,
                      border: seatBorder,
                      boxShadow: seatShadow,
                      cursor,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      color: isSelected ? "#060813" : seat.isBooked ? "var(--text-muted)" : "var(--text-primary)",
                      transform: perspective3D ? "translateZ(6px) rotateX(-5deg)" : "none",
                      transition: "all 0.2s ease, transform 0.6s ease",
                      position: "relative"
                    }}
                    title={seatTitle}
                    className={seatClass}
                  >
                    {!seat.isBooked && (
                      <span style={{ fontSize: "0.6rem" }}>{seat.id}</span>
                    )}

                    {/* Collaborative User Badges */}
                    {!seat.isBooked && occupants.map(([u, state]) => {
                      const initials = u.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
                      const badgeColor = state.action === "select" ? "#a855f7" : "#3b82f6";
                      return (
                        <span
                          key={u}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            background: badgeColor,
                            color: "#ffffff",
                            fontSize: "0.5rem",
                            padding: "1px 3px",
                            borderRadius: "3px",
                            fontWeight: "800",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                            pointerEvents: "none",
                            zIndex: 10,
                            border: "1px solid rgba(255,255,255,0.2)"
                          }}
                          title={`${u} is ${state.action === "select" ? "holding" : "eyeing"} this seat`}
                        >
                          {initials}
                        </span>
                      );
                    })}
                  </button>
                );
              })}
            </div>

            {/* Map Legend */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              paddingBottom: "24px",
              width: "100%",
              marginBottom: "32px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}></div>
                <span>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", border: "1px solid rgba(212, 175, 55, 0.35)", background: "rgba(255,255,255,0.04)" }}></div>
                <span>Premium/VIP</span>
              </div>
              {splitGroupId && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(168, 85, 247, 0.15)", border: "2px solid #a855f7", boxShadow: "0 0 5px rgba(168, 85, 247, 0.5)" }} className="pulse-border"></div>
                  <span style={{ color: "#a855f7", fontWeight: "600" }}>Group Seats</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--accent-gold)" }}></div>
                <span>Selected</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.05)" }}></div>
                <span>Booked</span>
              </div>
            </div>

            {/* Checkout panel */}
            <div style={{ width: "100%" }}>
              {selectedSeats.length > 0 ? (
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "16px" }}>Selected Seats</h4>

                  {/* Virtual Seat View Simulator */}
                  {(() => {
                    const lastSeat = selectedSeats[selectedSeats.length - 1];
                    const seatView = calculateSeatView(lastSeat.id);
                    if (!seatView) return null;
                    return (
                      <div className="glass-panel-gold" style={{
                        padding: "20px",
                        borderRadius: "12px",
                        marginBottom: "24px",
                        background: "rgba(212, 175, 55, 0.03)",
                        border: "1px solid rgba(212, 175, 55, 0.2)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        overflow: "hidden",
                        position: "relative"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Armchair size={14} color="var(--accent-gold)" />
                          <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "var(--accent-gold)" }}>
                            Virtual Stage View Simulator (Seat {lastSeat.id})
                          </span>
                        </div>

                        <div style={{
                          height: "90px",
                          background: "#020205",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.05)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "relative",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: "70px",
                            height: "14px",
                            background: "linear-gradient(to right, #d4af37, #a855f7)",
                            borderRadius: "10px 10px 0 0",
                            boxShadow: "0 0 15px rgba(212, 175, 55, 0.6)",
                            marginBottom: "12px",
                            transform: `scale(${seatView.proximity / 100})`,
                            transition: "transform 0.4s"
                          }} />

                          <div style={{
                            position: "absolute",
                            bottom: "20px",
                            width: "100%",
                            height: "40px",
                            background: "radial-gradient(ellipse at bottom, rgba(212, 175, 55, 0.15) 0%, transparent 70%)",
                            pointerEvents: "none"
                          }} />

                          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#fff" }}>
                            {seatView.angle} Perspective
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            {seatView.viewQuality}
                          </span>
                        </div>

                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, fontWeight: "300", lineHeight: "1.4" }}>
                          {seatView.description} Enjoy a premium 3D sound distribution and curated seat catering service.
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Acoustics profile:</span>
                          <button
                            onClick={() => playAcousticSample(lastSeat.id)}
                            style={{
                              background: "rgba(212, 175, 55, 0.1)",
                              border: "1px solid rgba(212, 175, 55, 0.3)",
                              color: "var(--accent-gold)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                          >
                            🔊 Audition Acoustics
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {selectedSeats.map((seat) => (
                      <div 
                        key={seat.id} 
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.9rem",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.02)"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Armchair size={14} color="var(--accent-gold)" />
                          <span>Seat {seat.id}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({seat.tier})</span>
                        </div>
                        <span style={{ fontWeight: "600" }}>{database.formatPrice(seat.price, user?.currency)}</span>
                      </div>
                    ))}
                  </div>

                  {selectedSeats.length > 1 && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "24px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "rgba(212, 175, 55, 0.03)",
                      border: "1px solid rgba(212, 175, 55, 0.15)"
                    }}>
                      <input 
                        type="checkbox" 
                        id="splitPay" 
                        checked={splitPayment}
                        onChange={(e) => setSplitPayment(e.target.checked)}
                        style={{ cursor: "pointer", accentColor: "var(--accent-gold)" }}
                      />
                      <label htmlFor="splitPay" style={{ fontSize: "0.85rem", cursor: "pointer", display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", color: "var(--accent-gold)" }}>Split payment with friends</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          Each pay: {database.formatPrice(totalPrice / selectedSeats.length, user?.currency)}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Promo Code Input */}
                  <div style={{
                    marginBottom: "24px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Have a Promo Code?</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input 
                        type="text" 
                        placeholder="e.g. VIP20" 
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        className="glass-input"
                        style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem", textTransform: "uppercase" }}
                      />
                      <button 
                        onClick={handleApplyPromo}
                        className="btn-secondary"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "6px", marginBottom: 0 }}>{promoError}</p>}
                    {promoSuccess && <p style={{ color: "#10b981", fontSize: "0.75rem", marginTop: "6px", marginBottom: 0 }}>{promoSuccess}</p>}
                  </div>

                  {/* Summary & Buttons */}
                  {showPriceBreakdown && selectedSeats.length > 0 && (() => {
                    const split = getPricingSplit();
                    return (
                      <div 
                        className="glass-panel" 
                        style={{
                          background: "rgba(6, 8, 19, 0.95)",
                          border: "1px solid rgba(212, 175, 55, 0.25)",
                          padding: "16px",
                          borderRadius: "12px",
                          marginBottom: "20px",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                          animation: "modalFadeIn 0.2s ease-out"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-gold)", letterSpacing: "1px" }}>
                            All-In Price Breakdown
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>100% Transparent</span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {/* Artist Share */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                              <span style={{ color: "var(--text-secondary)" }}>👨‍🎤 Artist / Performer Share ({split.artistPercent}%)</span>
                              <strong style={{ color: "var(--text-primary)" }}>{database.formatPrice(split.artistAmount, user?.currency)}</strong>
                            </div>
                            <div style={{ height: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${split.artistPercent}%`, height: "100%", background: "linear-gradient(90deg, #d4af37, #fbbf24)", borderRadius: "3px" }} />
                            </div>
                          </div>

                          {/* Venue Share */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                              <span style={{ color: "var(--text-secondary)" }}>🏛️ Venue & Staff Operations ({split.venuePercent}%)</span>
                              <strong style={{ color: "var(--text-primary)" }}>{database.formatPrice(split.venueAmount, user?.currency)}</strong>
                            </div>
                            <div style={{ height: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${split.venuePercent}%`, height: "100%", background: "linear-gradient(90deg, #cbd5e1, #94a3b8)", borderRadius: "3px" }} />
                            </div>
                          </div>

                          {/* Luxe Fee */}
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                              <span style={{ color: "var(--text-secondary)" }}>🎫 Luxe Platform Service Fee ({split.luxePercent}%)</span>
                              <strong style={{ color: "var(--text-primary)" }}>{database.formatPrice(split.luxeAmount, user?.currency)}</strong>
                            </div>
                            <div style={{ height: "6px", background: "rgba(255,255,255,0.03)", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ width: `${split.luxePercent}%`, height: "100%", background: "linear-gradient(90deg, #0d9488, #14b8a6)", borderRadius: "3px" }} />
                            </div>
                          </div>
                        </div>

                        <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "12px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px", marginBottom: 0 }}>
                          🛡️ All taxes and local delivery fees included. No surprises at checkout.
                        </p>
                      </div>
                    );
                  })()}

                  <div style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    paddingTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px"
                  }}>
                    <div>
                      {appliedPromo && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textDecoration: "line-through" }}>
                          Original: {database.formatPrice(basePrice, user?.currency)}
                        </span>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total Amount</span>
                        <button
                          onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "var(--accent-gold)",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                          className="nav-link"
                          title="Click to view all-in price breakdown"
                        >
                          <Info size={13} style={{ transform: "translateY(-1px)" }} />
                        </button>
                      </div>
                      <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>{database.formatPrice(totalPrice, user?.currency)}</span>
                    </div>
                    
                    <button 
                      onClick={handleBooking}
                      disabled={isBooking || bookingSuccess}
                      className="btn-primary" 
                      style={{
                        padding: "12px 36px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      {isBooking ? (
                        <span>Processing checkout...</span>
                      ) : bookingSuccess ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <ShieldCheck size={16} /> Booking Secured!
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Ticket size={16} /> Secure Checkout
                        </span>
                      )}
                    </button>
                  </div>

                  <p style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px"
                  }}>
                    <ShieldCheck size={12} color="#10b981" /> Powered by Stripe Sandbox. No real card charged.
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: "40px",
                  textAlign: "center",
                  border: "1px dashed rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  color: "var(--text-secondary)"
                }}>
                  <Armchair size={36} color="var(--text-muted)" style={{ margin: "0 auto 12px auto" }} />
                  <p style={{ fontSize: "0.95rem" }}>Select one or more seats from the grid above to start booking.</p>
                </div>
              )}
            </div>

          </div>

        </section>
      </div>

      {/* Split Payment Group Link Modal Overlay */}
      {splitLink && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(6, 8, 19, 0.8)",
          backdropFilter: "blur(10px)",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}>
          <div className="glass-panel-gold" style={{
            width: "100%",
            maxWidth: "500px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
            border: "1px solid var(--accent-gold)"
          }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.8rem", color: "var(--accent-gold)", marginBottom: "12px" }}>Your Seat is Secured!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "24px" }}>
              Share this reservation link with your group of friends. They have **10 minutes** to pay for their seats before the holds expire.
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              marginBottom: "32px"
            }}>
              <input 
                type="text" 
                readOnly
                value={splitLink}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "var(--accent-gold)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(splitLink);
                  alert("Group link copied to clipboard!");
                }}
                className="btn-secondary"
                style={{ padding: "6px 14px", fontSize: "0.8rem" }}
              >
                Copy
              </button>
            </div>

            <button 
              onClick={() => {
                window.location.href = "/dashboard/attendee";
              }}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Go to My Tickets
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
