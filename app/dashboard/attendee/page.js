"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Ticket, Calendar, MapPin, Send, MessageSquare, Users, Sparkles, AlertCircle,
  HelpCircle, ShieldCheck, CheckCircle2, ShoppingBag, Award, Star, Settings, Play, Video, RefreshCw, DollarSign
} from "lucide-react";
import { database } from "@/lib/database";
import { useAuth } from "@/context/AuthContext";

export default function AttendeeDashboard() {
  const { user, loading, login, signUp } = useAuth();
  const router = useRouter();
  
  // Auth Gate states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState("client");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Auto-redirect organizer to dashboard/organizer
  useEffect(() => {
    if (user && user.role === "organizer") {
      router.push("/dashboard/organizer");
    }
  }, [user, router]);

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attendingFriends, setAttendingFriends] = useState([]);
  
  // Custom states for Phase 9
  const [designs, setDesigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [activeTabSub, setActiveTabSub] = useState("chat"); // 'chat' | 'service' | 'swap' | 'stream'
  const [orderItems, setOrderItems] = useState([
    { name: "Luxe Vesper Martini", price: 18, count: 0 },
    { name: "Truffle Infused Fries", price: 14, count: 0 },
    { name: "Grand Cru Champagne Flute", price: 28, count: 0 },
    { name: "Wagyu Sliders (3x)", price: 22, count: 0 },
    { name: "Fiji Artesian Water", price: 6, count: 0 }
  ]);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // P2P swap forms state
  const [swapSenderSeat, setSwapSenderSeat] = useState("");
  const [swapRecipientName, setSwapRecipientName] = useState("");
  const [swapRecipientSeat, setSwapRecipientSeat] = useState("");
  const [swapSuccessMsg, setSwapSuccessMsg] = useState("");
  const [swapErrorMsg, setSwapErrorMsg] = useState("");

  // Phase 10 Offline States
  const [isOffline, setIsOffline] = useState(false);
  const [simulateOffline, setSimulateOffline] = useState(false);
  
  // Phase 10 Resale listings
  const [resaleListings, setResaleListings] = useState([]);
  const [resalePriceInput, setResalePriceInput] = useState("");
  const [resaleSuccessMsg, setResaleSuccessMsg] = useState("");
  const [resaleErrorMsg, setResaleErrorMsg] = useState("");
  const [showResaleControls, setShowResaleControls] = useState(false);

  // Soundcheck visualizer state
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState(Array.from({ length: 24 }, () => 15));

  // Phase 11 Q&A states
  const [fanQuestions, setFanQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // 3D Tilt Rotate coordinates
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  // Collaborative lighting state
  const [lightingMode, setLightingMode] = useState("laser_sweep");
  
  const chatEndRef = useRef(null);

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const fetchBookingsAndSwaps = () => {
    if (user) {
      const offlineMode = isOffline || simulateOffline;
      if (offlineMode) {
        // Load bookings, swaps, events, and designs from cache
        const cachedBookings = JSON.parse(localStorage.getItem(`luxe_offline_bookings_${user.email}`)) || [];
        const cachedSwaps = JSON.parse(localStorage.getItem(`luxe_offline_swaps_${user.name}`)) || [];
        const cachedEvents = JSON.parse(localStorage.getItem("luxe_offline_events")) || [];
        const cachedDesigns = JSON.parse(localStorage.getItem("luxe_offline_designs")) || [];
        const cachedResale = JSON.parse(localStorage.getItem("luxe_offline_resale")) || [];
        
        setBookings(cachedBookings);
        setSwaps(cachedSwaps);
        setResaleListings(cachedResale);
        if (cachedEvents.length > 0) setEvents(cachedEvents);
        if (cachedDesigns.length > 0) setDesigns(cachedDesigns);
        
        if (cachedBookings.length > 0) {
          if (!selectedBooking) {
            setSelectedBooking(cachedBookings[0]);
          } else {
            const current = cachedBookings.find(b => b.id === selectedBooking.id);
            setSelectedBooking(current || cachedBookings[0]);
          }
        } else {
          setSelectedBooking(null);
        }
      } else {
        // Online fetch
        database.getBookings(user.email).then(fetchedBookings => {
          setBookings(fetchedBookings);
          // Cache it
          localStorage.setItem(`luxe_offline_bookings_${user.email}`, JSON.stringify(fetchedBookings));
          
          if (fetchedBookings.length > 0) {
            if (!selectedBooking) {
              setSelectedBooking(fetchedBookings[0]);
            } else {
              const current = fetchedBookings.find(b => b.id === selectedBooking.id);
              setSelectedBooking(current || fetchedBookings[0]);
            }
          } else {
            setSelectedBooking(null);
          }
        });
        
        database.getP2PSwaps(user.name).then(fetchedSwaps => {
          setSwaps(fetchedSwaps);
          localStorage.setItem(`luxe_offline_swaps_${user.name}`, JSON.stringify(fetchedSwaps));
        });

        database.getEvents().then(allEvents => {
          setEvents(allEvents);
          localStorage.setItem("luxe_offline_events", JSON.stringify(allEvents));
        });

        database.getTicketDesigns().then(allDesigns => {
          setDesigns(allDesigns);
          localStorage.setItem("luxe_offline_designs", JSON.stringify(allDesigns));
        });

        database.getResaleListings().then(listings => {
          setResaleListings(listings);
          localStorage.setItem("luxe_offline_resale", JSON.stringify(listings));
        });
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookingsAndSwaps();
    }
  }, [user, isOffline, simulateOffline]);

  // Update chat and friends when selected ticket changes
  useEffect(() => {
    if (selectedBooking) {
      // Reset seat selection for swaps
      setSwapSenderSeat(selectedBooking.seats[0] || "");
      
      const offlineMode = isOffline || simulateOffline;
      if (offlineMode) {
        // Load cached messages
        const cachedMsgs = JSON.parse(localStorage.getItem(`luxe_offline_msgs_${selectedBooking.eventId}`)) || [];
        setMessages(cachedMsgs);
        setAttendingFriends([]);
        return;
      }

      // Subscribe to real-time chat messages
      const unsubscribe = database.subscribeToMessages(selectedBooking.eventId, (msgs) => {
        setMessages(msgs);
        localStorage.setItem(`luxe_offline_msgs_${selectedBooking.eventId}`, JSON.stringify(msgs));
      });

      const friends = database.getAttendingFriends(selectedBooking.eventId);
      setAttendingFriends(friends);

      return () => unsubscribe();
    }
  }, [selectedBooking, isOffline, simulateOffline]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Music visualizer simulation animation
  useEffect(() => {
    let interval;
    if (activeTabSub === "stream" && isVisualizing) {
      interval = setInterval(() => {
        setVisualizerBars(Array.from({ length: 24 }, () => Math.floor(Math.random() * 55) + 8));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [activeTabSub, isVisualizing]);

  // Lighting BroadcastChannel listener & Q&A loader
  useEffect(() => {
    if (!selectedBooking) return;
    const channel = new BroadcastChannel(`luxe_lighting_${selectedBooking.eventId}`);
    channel.onmessage = (event) => {
      if (event.data && event.data.type === "LIGHTING_CHANGE") {
        setLightingMode(event.data.mode);
      }
    };
    
    const stored = localStorage.getItem(`luxe_lighting_${selectedBooking.eventId}`);
    if (stored) {
      setLightingMode(stored);
    } else {
      setLightingMode("laser_sweep");
    }

    // Load Q&A questions and poll every 5s
    const loadQuestions = () => {
      database.getFanQuestions(selectedBooking.eventId).then(setFanQuestions);
    };
    loadQuestions();
    const qInterval = setInterval(loadQuestions, 5000);

    return () => {
      channel.close();
      clearInterval(qInterval);
    };
  }, [selectedBooking]);

  useEffect(() => {
    if (lightingMode) {
      document.documentElement.setAttribute("data-atmosphere", lightingMode);
    } else {
      document.documentElement.removeAttribute("data-atmosphere");
    }
  }, [lightingMode]);

  // Handle sending chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedBooking || !user) return;

    const sentMsg = await database.sendMessage(selectedBooking.eventId, user.name, newMessage);
    if (sentMsg) {
      setNewMessage("");
    }
  };

  // Handle submitting Q&A question to artist
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !selectedBooking || !user) return;

    setSubmittingQuestion(true);
    try {
      const success = await database.submitFanQuestion({
        eventId: selectedBooking.eventId,
        eventTitle: selectedBooking.eventTitle,
        userName: user.name,
        userEmail: user.email,
        questionText: newQuestionText
      });
      if (success) {
        setNewQuestionText("");
        // Refresh local Q&A list
        database.getFanQuestions(selectedBooking.eventId).then(setFanQuestions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Play synthetic premium chime on ticket click
  const playTicketChime = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq, time, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = ctx.currentTime;
      playTone(523.25, now, 0.4); // C5
      playTone(659.25, now + 0.12, 0.6); // E5
    } catch (e) {
      console.error("Audio chime failed", e);
    }
  };

  // 3D Card Tilt handlers
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

  const getMaterialStyle = (material) => {
    switch (material) {
      case "gold_foil":
        return {
          background: "linear-gradient(135deg, #f5e3a0 0%, #d4af37 50%, #aa8010 100%)",
          color: "#27210e",
          boxShadow: "0 20px 40px rgba(212, 175, 55, 0.25)"
        };
      case "liquid_silver":
        return {
          background: "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #64748b 100%)",
          color: "#0f172a",
          boxShadow: "0 20px 40px rgba(255, 255, 255, 0.15)"
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
          boxShadow: "0 20px 40px rgba(192, 132, 252, 0.3)"
        };
    }
  };

  const getBorderStyle = (borderStyle) => {
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

  const updateOrderItemCount = (index, delta) => {
    setOrderItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const newCount = Math.max(0, item.count + delta);
        return { ...item, count: newCount };
      }
      return item;
    }));
  };

  const handlePlaceOrder = async () => {
    if (!selectedBooking || !user) return;
    const itemsOrdered = orderItems.filter(item => item.count > 0);
    if (itemsOrdered.length === 0) return;
    
    const total = itemsOrdered.reduce((sum, item) => sum + item.price * item.count, 0);
    const orderData = {
      eventId: selectedBooking.eventId,
      seatId: swapSenderSeat || selectedBooking.seats[0],
      userName: user.name,
      items: itemsOrdered,
      total
    };
    
    const result = await database.placeSeatServiceOrder(orderData);
    if (result) {
      setOrderSuccess(true);
      setOrderItems(prev => prev.map(item => ({ ...item, count: 0 })));
      setTimeout(() => setOrderSuccess(false), 4000);
    }
  };

  const handlePrintTicket = () => {
    if (!selectedBooking) return;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    const activeDesign = designs.find(d => d.id === (events.find(e => e.id === selectedBooking.eventId)?.ticketDesignId)) || {
      material: "gold_foil",
      borderStyle: "gold_glow",
      stamp: "star",
      fontFamily: "serif"
    };

    const fontStyle = activeDesign.fontFamily === "serif" ? "Georgia, serif" : activeDesign.fontFamily === "mono" ? "Courier New, monospace" : "Arial, sans-serif";

    printWindow.document.write(`
      <html>
        <head>
          <title>Luxe Events Ticket - ${selectedBooking.eventTitle}</title>
          <style>
            body {
              background: #fff;
              color: #000;
              font-family: ${fontStyle};
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .ticket-container {
              width: 100%;
              max-width: 480px;
              border: 3px double #d4af37;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              background: #fafafa;
              position: relative;
            }
            .header {
              border-bottom: 1px dashed #ccc;
              padding-bottom: 20px;
              margin-bottom: 20px;
              text-align: center;
            }
            .header h1 {
              font-size: 24px;
              margin: 0;
              color: #b89218;
            }
            .header p {
              margin: 5px 0 0 0;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #555;
            }
            .title {
              font-size: 22px;
              font-weight: 700;
              margin: 10px 0;
            }
            .detail-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 20px 0;
              font-size: 14px;
            }
            .detail-item {
              margin-bottom: 10px;
            }
            .label {
              font-size: 10px;
              text-transform: uppercase;
              color: #666;
              letter-spacing: 1px;
            }
            .value {
              font-weight: 600;
              margin-top: 2px;
            }
            .footer {
              border-top: 1px dashed #ccc;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .barcode-placeholder {
              font-size: 10px;
              color: #666;
            }
            .stamp {
              position: absolute;
              top: 25px;
              right: 25px;
              font-size: 24px;
              color: rgba(212,175,55,0.4);
              font-weight: 800;
              border: 3px solid rgba(212,175,55,0.4);
              padding: 5px 10px;
              border-radius: 5px;
              transform: rotate(-15deg);
              text-transform: uppercase;
            }
            @media print {
              body { padding: 0; }
              .ticket-container { box-shadow: none; border-color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="stamp">${activeDesign.stamp === 'star' ? '★ STAR' : activeDesign.stamp === 'crest' ? '♛ CREST' : 'LUXE'}</div>
            <div class="header">
              <p>OFFICIAL DIGITAL PASS</p>
              <h1>LUXE CONCERT EXPERIENCE</h1>
            </div>
            
            <div class="title">${selectedBooking.eventTitle}</div>
            <div style="font-size: 13px; color: #555; margin-bottom: 15px;">${selectedBooking.eventLocation}</div>
            
            <div class="detail-grid">
              <div class="detail-item">
                <div class="label">Date & Time</div>
                <div class="value">${selectedBooking.eventDate}</div>
              </div>
              <div class="detail-item">
                <div class="label">Seats Secured</div>
                <div class="value" style="color: #b89218;">${selectedBooking.seats.join(", ")}</div>
              </div>
              <div class="detail-item">
                <div class="label">Gate Entry</div>
                <div class="value">North Gate Access</div>
              </div>
              <div class="detail-item">
                <div class="label">Booking Reference</div>
                <div class="value" style="font-family: monospace;">${selectedBooking.id}</div>
              </div>
            </div>
            
            <div class="footer">
              <div class="barcode-placeholder">
                SECURE QR GATEWAY VERIFIED
              </div>
              <div style="font-size: 24px; font-weight: bold; letter-spacing: 1px;">
                ||| | || || | |||
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleListResale = async () => {
    if (!selectedBooking) return;
    const price = parseInt(resalePriceInput);
    if (isNaN(price) || price <= 0) {
      setResaleErrorMsg("Please enter a valid price.");
      return;
    }
    if (price > selectedBooking.price) {
      setResaleErrorMsg(`Resale price cannot exceed the original face value: ${database.formatPrice(selectedBooking.price, user?.currency)}`);
      return;
    }

    const listing = await database.listTicketForResale(selectedBooking.id, price);
    if (listing) {
      setResaleSuccessMsg("Ticket successfully listed on the Fan Resale Exchange!");
      setResaleErrorMsg("");
      setShowResaleControls(false);
      fetchBookingsAndSwaps();
      setTimeout(() => setResaleSuccessMsg(""), 4000);
    } else {
      setResaleErrorMsg("Failed to list ticket for resale.");
    }
  };

  const handleDelistResale = async () => {
    if (!selectedBooking) return;
    const success = await database.delistTicketForResale(selectedBooking.id);
    if (success) {
      setResaleSuccessMsg("Ticket delisted from the Fan Resale Exchange.");
      setResaleErrorMsg("");
      fetchBookingsAndSwaps();
      setTimeout(() => setResaleSuccessMsg(""), 4000);
    } else {
      setResaleErrorMsg("Failed to delist ticket.");
    }
  };

  const handleProposeSwap = async (e) => {
    e.preventDefault();
    setSwapSuccessMsg("");
    setSwapErrorMsg("");

    if (!selectedBooking || !user) return;
    if (!swapSenderSeat || !swapRecipientName.trim() || !swapRecipientSeat.trim()) {
      setSwapErrorMsg("All fields are required.");
      return;
    }

    if (swapRecipientName.toLowerCase() === user.name.toLowerCase()) {
      setSwapErrorMsg("You cannot swap seats with yourself.");
      return;
    }

    const swapData = {
      eventId: selectedBooking.eventId,
      eventTitle: selectedBooking.eventTitle,
      senderName: user.name,
      senderSeat: swapSenderSeat,
      recipientName: swapRecipientName.trim(),
      recipientSeat: swapRecipientSeat.trim()
    };

    const result = await database.createSeatSwapOffer(swapData);
    if (result) {
      setSwapSuccessMsg("Swap offer sent successfully!");
      setSwapRecipientName("");
      setSwapRecipientSeat("");
      database.getP2PSwaps(user.name).then(setSwaps);
    } else {
      setSwapErrorMsg("Failed to send swap offer.");
    }
  };

  const handleUpdateSwapStatus = async (swapId, status) => {
    const success = await database.updateSeatSwapStatus(swapId, status);
    if (success) {
      fetchBookingsAndSwaps();
    }
  };

  const changeLightingMode = (mode) => {
    setLightingMode(mode);
    localStorage.setItem(`luxe_lighting_${selectedBooking.eventId}`, mode);
    
    const channel = new BroadcastChannel(`luxe_lighting_${selectedBooking.eventId}`);
    channel.postMessage({ type: "LIGHTING_CHANGE", mode });
    channel.close();
  };

  const getLightingStyle = (mode) => {
    switch (mode) {
      case "golden_nebula":
        return {
          background: "linear-gradient(135deg, rgba(146, 64, 14, 0.2) 0%, rgba(6, 8, 19, 0.95) 60%, rgba(217, 119, 6, 0.1) 100%)",
          borderColor: "rgba(212, 175, 55, 0.35)",
          shadow: "0 10px 30px rgba(212, 175, 55, 0.15)"
        };
      case "neon_pulse":
        return {
          background: "linear-gradient(135deg, rgba(157, 23, 77, 0.2) 0%, rgba(6, 8, 19, 0.95) 60%, rgba(76, 29, 149, 0.15) 100%)",
          borderColor: "rgba(236, 72, 153, 0.35)",
          shadow: "0 10px 30px rgba(236, 72, 153, 0.15)"
        };
      case "deep_ocean":
        return {
          background: "linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(6, 8, 19, 0.95) 60%, rgba(8, 145, 178, 0.1) 100%)",
          borderColor: "rgba(13, 148, 136, 0.35)",
          shadow: "0 10px 30px rgba(13, 148, 136, 0.15)"
        };
      case "laser_sweep":
      default:
        return {
          background: "linear-gradient(135deg, rgba(76, 29, 149, 0.2) 0%, rgba(6, 8, 19, 0.95) 60%, rgba(30, 27, 75, 0.15) 100%)",
          borderColor: "rgba(168, 85, 247, 0.35)",
          shadow: "0 10px 30px rgba(168, 85, 247, 0.15)"
        };
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);
    try {
      if (isRegister) {
        if (!nameInput.trim()) throw new Error("Name is required");
        await signUp(nameInput, emailInput, passwordInput, roleInput);
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
            Loading attendee space...
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
              {isRegister ? "Create Profile" : "Attendee Portal"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "8px", fontWeight: "300" }}>
              Please sign in to view your secured tickets, chat in live lounges, and coordinate with friends.
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
                      onClick={() => setRoleInput("client")}
                      style={{
                        background: roleInput === "client" ? "var(--accent-gold)" : "transparent",
                        color: roleInput === "client" ? "#000" : "var(--text-secondary)",
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
                      onClick={() => setRoleInput("organizer")}
                      style={{
                        background: roleInput === "organizer" ? "var(--accent-gold)" : "transparent",
                        color: roleInput === "organizer" ? "#000" : "var(--text-secondary)",
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
                    placeholder="Julian Sterling" 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
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
              {authSubmitting ? "Authenticating..." : isRegister ? "Register & Enter" : "Unlock Dashboard"}
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

  return (
    <main style={{ padding: "0 24px", maxWidth: "1250px", margin: "0 auto", marginTop: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", margin: 0 }}>Attendee Dashboard</h1>
        
        {/* Outage simulator switch */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.02)", padding: "6px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500" }}>Simulate Gate Outage</span>
          <button 
            onClick={() => setSimulateOffline(!simulateOffline)}
            style={{
              background: simulateOffline ? "#d97706" : "rgba(255,255,255,0.08)",
              border: "1px solid " + (simulateOffline ? "#d97706" : "rgba(255,255,255,0.15)"),
              color: simulateOffline ? "#000" : "var(--text-secondary)",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.7rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {simulateOffline ? "DISCONNECTED" : "ONLINE"}
          </button>
        </div>
      </div>

      {/* Zero-Signal Wallet Guard Banner */}
      {(isOffline || simulateOffline) && (
        <div className="glass-panel-gold pulse-border" style={{
          padding: "16px 24px",
          borderRadius: "16px",
          marginBottom: "32px",
          background: "linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(6, 8, 19, 0.95) 100%)",
          border: "1px solid #d97706",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          boxShadow: "0 0 15px rgba(217, 119, 6, 0.2)"
        }}>
          <div>
            <h4 style={{ color: "#d97706", fontWeight: "600", fontSize: "1.05rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              🛡️ Zero-Signal Wallet Guard Active
            </h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "4px 0 0 0", lineHeight: "1.4" }}>
              Offline mode is active. Your tickets are loaded directly from the secure local client-side cache. Gate entries are fully operational.
            </p>
          </div>
          <span style={{
            fontSize: "0.75rem",
            background: "rgba(217, 119, 6, 0.1)",
            color: "#d97706",
            border: "1px solid rgba(217, 119, 6, 0.3)",
            padding: "4px 10px",
            borderRadius: "100px",
            fontWeight: "600"
          }}>
            Secure Offline Cache
          </span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{
          padding: "80px 40px",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <AlertCircle size={48} color="var(--accent-gold)" style={{ marginBottom: "16px" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: "600", marginBottom: "8px" }}>No active tickets found</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "24px", fontWeight: "300" }}>
            You haven't booked any premium experiences yet. Choose an event and lock down your preferred seats.
          </p>
          <Link href="/">
            <button className="btn-primary">Discover Events</button>
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.3fr",
          gap: "40px",
          alignItems: "start"
        }}>
          {/* Left Column: Tickets list */}
          <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-secondary)" }}>Your Tickets ({bookings.length})</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {bookings.map((booking) => {
                const isSelected = selectedBooking?.id === booking.id;
                return (
                  <div 
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={isSelected ? "glass-panel-gold" : "glass-panel"}
                    style={{
                      padding: "20px",
                      cursor: "pointer",
                      display: "flex",
                      gap: "16px",
                      transition: "transform 0.3s, border-color 0.3s",
                      borderColor: isSelected ? "var(--accent-gold)" : "var(--glass-border)"
                    }}
                  >
                    {/* Small thumbnail */}
                    <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                      <Image 
                        src={booking.eventImage}
                        alt={booking.eventTitle}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    
                    {/* Ticket info summary */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px", color: isSelected ? "var(--accent-gold)" : "var(--text-primary)" }}>
                        {booking.eventTitle}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                        <Calendar size={12} />
                        <span>{booking.eventDate}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)" }}>
                        Seats: {booking.seats.join(", ")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Premium 3D-Ticket Rendering */}
            {selectedBooking && (() => {
              const selectedEvent = events.find(e => e.id === selectedBooking.eventId);
              const ticketDesignId = selectedEvent?.ticketDesignId;
              const activeDesign = designs.find(d => d.id === ticketDesignId) || {
                material: "holographic",
                borderStyle: "neon_purple",
                stamp: "star",
                particleEffect: "sparkles",
                fontFamily: "sans",
                barcodeType: "qr_line",
                badgeColor: "#a855f7",
                textColor: "#ffffff"
              };
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
                    Interactive 3D Gyroscope Ticket (Click to chime)
                  </span>

                  <div 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={playTicketChime}
                    style={{
                      perspective: "1000px",
                      cursor: "pointer",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "20px 0"
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "360px",
                        height: "440px",
                        borderRadius: "24px",
                        padding: "32px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)",
                        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                        border: getBorderStyle(activeDesign.borderStyle),
                        ...getMaterialStyle(activeDesign.material),
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.6)"
                      }}
                    >
                      {/* Particle Overlays */}
                      {activeDesign.particleEffect !== "none" && (
                        <div style={{
                          position: "absolute",
                          top: 0, left: 0, right: 0, bottom: 0,
                          pointerEvents: "none",
                          opacity: 0.65,
                          backgroundImage: activeDesign.particleEffect === "stars" 
                            ? "radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 80px, #fff, rgba(0,0,0,0)), radial-gradient(2px 2px at 280px 320px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 220px, #fff, rgba(0,0,0,0))"
                            : activeDesign.particleEffect === "dust"
                            ? "radial-gradient(3px 3px at 40px 100px, rgba(255,255,255,0.1), rgba(0,0,0,0)), radial-gradient(4px 4px at 200px 250px, rgba(255,255,255,0.08), rgba(0,0,0,0))"
                            : "radial-gradient(2px 2px at 90px 40px, #d4af37, rgba(0,0,0,0)), radial-gradient(2px 2px at 230px 180px, #f3e5ab, rgba(0,0,0,0)), radial-gradient(3px 3px at 120px 300px, #d4af37, rgba(0,0,0,0))",
                          animation: "shimmer 6s infinite linear"
                        }} />
                      )}

                      {/* Holographic shimmer overlay */}
                      {activeDesign.material === "holographic" && (
                        <div style={{
                          position: "absolute",
                          top: 0, left: 0, right: 0, bottom: 0,
                          background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.2) 65%, rgba(255,255,255,0) 100%)",
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
                            letterSpacing: "2.5px",
                            background: activeDesign.badgeColor || "var(--accent-gold)",
                            color: activeDesign.material === "gold_foil" || activeDesign.material === "liquid_silver" ? "#000" : "#fff",
                            padding: "5px 12px",
                            borderRadius: "20px",
                            border: "1px solid rgba(255,255,255,0.2)"
                          }}>
                            {activeDesign.material === "glass" ? "VIP GUEST" : (activeDesign.name ? activeDesign.name.split(" ")[0] : "OFFICIAL")}
                          </span>
                          
                          {activeDesign.stamp === "star" && <Star size={20} fill={activeDesign.textColor || "#fff"} color={activeDesign.textColor || "#fff"} />}
                          {activeDesign.stamp === "crest" && <Award size={20} color={activeDesign.textColor || "#fff"} />}
                          {activeDesign.stamp === "hologram_dot" && (
                            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: `radial-gradient(circle, ${activeDesign.badgeColor || '#a855f7'} 0%, rgba(0,0,0,0) 70%)`, border: `1px solid ${activeDesign.textColor || '#fff'}` }} />
                          )}
                        </div>

                        <h2 style={{
                          fontFamily: activeDesign.fontFamily === "serif" ? "var(--font-serif)" : activeDesign.fontFamily === "mono" ? "monospace" : "var(--font-sans)",
                          fontSize: "1.6rem",
                          fontWeight: "850",
                          lineHeight: "1.2",
                          color: activeDesign.material === "glass" ? "#fff" : (activeDesign.textColor || "#fff"),
                          letterSpacing: "-0.5px"
                        }}>
                          {selectedBooking.eventTitle}
                        </h2>
                        <span style={{ fontSize: "0.75rem", opacity: 0.7, display: "block", marginTop: "6px", fontWeight: "300" }}>
                          {selectedBooking.eventLocation}
                        </span>
                      </div>

                      {/* Middle ticket content */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "0.82rem" }}>
                        <div>
                          <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "1px" }}>Date & Time</span>
                          <span style={{ fontWeight: "600", fontFamily: activeDesign.fontFamily === "mono" ? "monospace" : "inherit" }}>{selectedBooking.eventDate}</span>
                        </div>
                        <div>
                          <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "1px" }}>Seats Secured</span>
                          <span style={{ fontWeight: "700", color: activeDesign.material === "glass" ? "var(--accent-gold)" : (activeDesign.textColor || "var(--accent-gold)"), fontFamily: activeDesign.fontFamily === "mono" ? "monospace" : "inherit" }}>
                            {selectedBooking.seats.join(", ")}
                          </span>
                        </div>
                        <div>
                          <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "1px" }}>Check-In Gate</span>
                          <span style={{ fontWeight: "600" }}>North Gate Access</span>
                        </div>
                        <div>
                          <span style={{ opacity: 0.5, display: "block", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "1px" }}>Booking Ref</span>
                          <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: "600" }}>{selectedBooking.id.substring(0, 10)}</span>
                        </div>
                      </div>

                      {/* Bottom ticket content (Barcodes) */}
                      <div style={{
                        borderTop: "1px dashed rgba(255,255,255,0.15)",
                        paddingTop: "18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <div style={{ fontFamily: "monospace", fontSize: "0.65rem", opacity: 0.6 }}>
                          LUXE SECURE GATEWAY
                        </div>

                        {activeDesign.barcodeType === "classic" && (
                          <div style={{ display: "flex", gap: "2.5px", height: "32px", opacity: 0.9 }}>
                            {Array.from({ length: 18 }).map((_, i) => (
                              <div key={i} style={{ width: i % 4 === 0 ? "3.5px" : i % 3 === 0 ? "1px" : "2px", height: "100%", background: activeDesign.material === "glass" ? "#fff" : (activeDesign.textColor || "#fff") }} />
                            ))}
                          </div>
                        )}

                        {activeDesign.barcodeType === "matrix" && (
                          <div style={{
                            width: "34px", height: "34px",
                            background: `repeating-conic-gradient(from 0deg, ${activeDesign.textColor || '#fff'} 0deg 90deg, transparent 90deg 180deg)`,
                            backgroundSize: "8.5px 8.5px",
                            opacity: 0.8,
                            borderRadius: "2px"
                          }} />
                        )}

                        {activeDesign.barcodeType === "qr_line" && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: "8px"
                          }}>
                            <div style={{ width: "24px", height: "24px", background: `repeating-linear-gradient(45deg, ${activeDesign.textColor || '#fff'} 0px, ${activeDesign.textColor || '#fff'} 2px, transparent 2px, transparent 4.5px)`, opacity: 0.8 }} />
                            <div style={{ display: "flex", gap: "1.5px", height: "24px", opacity: 0.9 }}>
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} style={{ width: i % 3 === 0 ? "2.5px" : "1.5px", height: "100%", background: activeDesign.textColor || '#fff' }} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Phase 10 Ticket Action Deck */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "360px", margin: "0 auto", width: "100%" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={handlePrintTicket}
                        className="btn-primary" 
                        style={{ flex: 1, padding: "10px 14px", fontSize: "0.85rem", fontWeight: "600", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}
                      >
                        🖨️ Print Pass
                      </button>

                      {selectedBooking.status !== "resold" && (
                        <button 
                          onClick={() => {
                            if (selectedBooking.resaleListed) {
                              handleDelistResale();
                            } else {
                              setResalePriceInput(selectedBooking.price || 40);
                              setResaleSuccessMsg("");
                              setResaleErrorMsg("");
                              setShowResaleControls(!showResaleControls);
                            }
                          }}
                          style={{
                            flex: 1,
                            background: selectedBooking.resaleListed ? "rgba(239, 68, 68, 0.1)" : "rgba(212, 175, 55, 0.05)",
                            border: "1px solid " + (selectedBooking.resaleListed ? "#ef4444" : "rgba(212, 175, 55, 0.3)"),
                            color: selectedBooking.resaleListed ? "#ef4444" : "var(--accent-gold)",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            justifyContent: "center"
                          }}
                        >
                          {selectedBooking.resaleListed ? "❌ Delist Resale" : "💰 Sell Ticket"}
                        </button>
                      )}
                    </div>

                    {showResaleControls && (
                      <div className="glass-panel" style={{ padding: "16px", borderRadius: "16px", marginTop: "8px", border: "1px solid rgba(212, 175, 55, 0.2)" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px", color: "var(--accent-gold)" }}>Face-Value Resale Listing</h4>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                          Specify listing price. Maximum allowed: face value ({database.formatPrice(selectedBooking.price, user?.currency)}).
                        </p>
                        
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <input 
                            type="number" 
                            max={selectedBooking.price}
                            value={resalePriceInput}
                            onChange={(e) => setResalePriceInput(e.target.value)}
                            className="glass-input" 
                            style={{ padding: "8px", fontSize: "0.85rem", width: "100px" }}
                          />
                          <button 
                            onClick={handleListResale}
                            className="btn-primary" 
                            style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                          >
                            Confirm List
                          </button>
                        </div>
                        {resaleErrorMsg && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "6px", margin: 0 }}>{resaleErrorMsg}</p>}
                      </div>
                    )}

                    {resaleSuccessMsg && (
                      <p style={{ color: "#10b981", fontSize: "0.8rem", textAlign: "center", marginTop: "4px", margin: 0 }}>
                        {resaleSuccessMsg}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Right Column: Tabbed Lounge Area */}
          {selectedBooking && (() => {
            const currentLighting = getLightingStyle(lightingMode);
            return (
              <section style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}>
                {/* Tabs bar */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "6px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}>
                  <button
                    onClick={() => setActiveTabSub("chat")}
                    style={{
                      background: activeTabSub === "chat" ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "transparent",
                      color: activeTabSub === "chat" ? "#060813" : "var(--text-secondary)",
                      border: "none",
                      padding: "10px 4px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <MessageSquare size={14} />
                    <span style={{ fontSize: "0.68rem" }}>Lounge Chat</span>
                  </button>
                  <button
                    onClick={() => setActiveTabSub("service")}
                    style={{
                      background: activeTabSub === "service" ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "transparent",
                      color: activeTabSub === "service" ? "#060813" : "var(--text-secondary)",
                      border: "none",
                      padding: "10px 4px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span style={{ fontSize: "0.68rem" }}>Seat Service</span>
                  </button>
                  <button
                    onClick={() => setActiveTabSub("swap")}
                    style={{
                      background: activeTabSub === "swap" ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "transparent",
                      color: activeTabSub === "swap" ? "#060813" : "var(--text-secondary)",
                      border: "none",
                      padding: "10px 4px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <RefreshCw size={14} />
                    <span style={{ fontSize: "0.68rem" }}>Seat Swaps</span>
                  </button>
                  <button
                    onClick={() => setActiveTabSub("stream")}
                    style={{
                      background: activeTabSub === "stream" ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "transparent",
                      color: activeTabSub === "stream" ? "#060813" : "var(--text-secondary)",
                      border: "none",
                      padding: "10px 4px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <Video size={14} />
                    <span style={{ fontSize: "0.68rem" }}>Soundcheck</span>
                  </button>
                  <button
                    onClick={() => setActiveTabSub("exchange")}
                    style={{
                      background: activeTabSub === "exchange" ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "transparent",
                      color: activeTabSub === "exchange" ? "#060813" : "var(--text-secondary)",
                      border: "none",
                      padding: "10px 4px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <DollarSign size={14} />
                    <span style={{ fontSize: "0.68rem" }}>Resale Hub</span>
                  </button>
                  <button
                    onClick={() => setActiveTabSub("venue")}
                    style={{
                      background: activeTabSub === "venue" ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "transparent",
                      color: activeTabSub === "venue" ? "#060813" : "var(--text-secondary)",
                      border: "none",
                      padding: "10px 4px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
                    }}
                  >
                    <MapPin size={14} />
                    <span style={{ fontSize: "0.68rem" }}>Venue Guide</span>
                  </button>
                </div>

                {/* Tab Content 1: Lounge Chat */}
                {activeTabSub === "chat" && (
                  <div 
                    className="glass-panel" 
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "580px",
                      borderRadius: "20px",
                      border: `1px solid ${currentLighting.borderColor}`,
                      background: currentLighting.background,
                      boxShadow: currentLighting.shadow,
                      position: "relative",
                      overflow: "hidden",
                      transition: "background 0.8s, border-color 0.8s, box-shadow 0.8s"
                    }}
                  >
                    {/* Collaborative Lighting Controller (Floating mini-bar) */}
                    <div style={{
                      background: "rgba(6, 8, 19, 0.6)",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      padding: "12px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      zIndex: 5
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sparkles size={14} color="var(--accent-gold)" />
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>Lounge Atmosphere</span>
                      </div>
                      
                      <div style={{ display: "flex", gap: "6px" }}>
                        {[
                          { id: "laser_sweep", label: "Laser", color: "#a855f7" },
                          { id: "golden_nebula", label: "Gold", color: "#d4af37" },
                          { id: "neon_pulse", label: "Pulse", color: "#ec4899" },
                          { id: "deep_ocean", label: "Ocean", color: "#0d9488" }
                        ].map((mode) => {
                          const isActive = lightingMode === mode.id;
                          return (
                            <button
                              key={mode.id}
                              onClick={() => changeLightingMode(mode.id)}
                              style={{
                                background: isActive ? mode.color : "rgba(255,255,255,0.03)",
                                color: isActive ? "#000" : "var(--text-secondary)",
                                border: `1px solid ${mode.color}44`,
                                fontSize: "0.65rem",
                                padding: "4px 8px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "700",
                                transition: "all 0.3s"
                              }}
                            >
                              {mode.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Attending Friends list in chat tab */}
                    <div style={{
                      padding: "12px 20px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      background: "rgba(6, 8, 19, 0.3)",
                      zIndex: 2
                    }}>
                      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
                        {attendingFriends.length > 0 ? (
                          attendingFriends.map((friend, i) => (
                            <div 
                              key={i} 
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(255, 255, 255, 0.03)",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                border: "1px solid rgba(255,255,255,0.05)",
                                flexShrink: 0
                              }}
                            >
                              <div style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)",
                                color: "#060813",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.65rem",
                                fontWeight: "700"
                              }}>
                                {friend.avatar}
                              </div>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: "500" }}>{friend.name}</span>
                              {friend.active && (
                                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981" }}></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Invite friends to this exclusive lounge.</span>
                        )}
                      </div>
                    </div>

                    {/* Messages area */}
                    <div style={{
                      flex: 1,
                      padding: "20px 24px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      zIndex: 2
                    }}>
                      {messages.map((msg) => {
                        const isSelf = msg.user === user?.name;
                        return (
                          <div 
                            key={msg.id}
                            style={{
                              alignSelf: isSelf ? "flex-end" : "flex-start",
                              maxWidth: "80%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isSelf ? "flex-end" : "flex-start"
                            }}
                          >
                            <div style={{
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                              marginBottom: "3px",
                              display: "flex",
                              gap: "6px"
                            }}>
                              <span style={{ fontWeight: "600" }}>{msg.user}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            
                            <div style={{
                              background: isSelf ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "rgba(255,255,255,0.03)",
                              color: isSelf ? "#060813" : "var(--text-primary)",
                              padding: "10px 14px",
                              borderRadius: isSelf ? "14px 14px 0 14px" : "0 14px 14px 14px",
                              border: isSelf ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                              fontSize: "0.85rem",
                              wordBreak: "break-word"
                            }}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef}></div>
                    </div>

                    {/* Input box */}
                    <form 
                      onSubmit={handleSendMessage}
                      style={{
                        padding: "16px 20px",
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        gap: "10px",
                        background: "rgba(6, 8, 19, 0.55)",
                        zIndex: 2
                      }}
                    >
                      <input 
                        type="text"
                        placeholder={`Message the lounge...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{
                          flex: 1,
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "30px",
                          padding: "10px 18px",
                          color: "var(--text-primary)",
                          outline: "none",
                          fontSize: "0.85rem"
                        }}
                      />
                      <button 
                        type="submit"
                        style={{
                          background: "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)",
                          border: "none",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          cursor: "pointer",
                          color: "#060813",
                          flexShrink: 0
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}

                {/* Tab Content 2: AI Seat Service Concierge */}
                {activeTabSub === "service" && (
                  <div className="glass-panel" style={{ padding: "32px", borderRadius: "20px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", minHeight: "500px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                      <ShoppingBag size={20} color="var(--accent-gold)" />
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>VIP Seating Service Concierge</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Order refreshments directly delivered to your seat</p>
                      </div>
                    </div>

                    {/* Seat Selector Dropdown */}
                    <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Deliver to Seat:</span>
                      <select
                        value={swapSenderSeat}
                        onChange={(e) => setSwapSenderSeat(e.target.value)}
                        className="glass-input"
                        style={{ padding: "6px 12px", width: "auto", cursor: "pointer" }}
                      >
                        {selectedBooking.seats.map(seat => (
                          <option key={seat} value={seat} style={{ background: "#060813" }}>{seat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Menu items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                      {orderItems.map((item, index) => (
                        <div 
                          key={item.name} 
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 16px",
                            borderRadius: "14px",
                            background: item.count > 0 ? "rgba(212, 175, 55, 0.05)" : "rgba(255,255,255,0.01)",
                            border: item.count > 0 ? "1px solid rgba(212, 175, 55, 0.25)" : "1px solid rgba(255,255,255,0.04)",
                            transition: "all 0.2s"
                          }}
                        >
                          <div>
                            <span style={{ display: "block", fontSize: "0.88rem", fontWeight: "600", color: item.count > 0 ? "var(--accent-gold)" : "var(--text-primary)" }}>{item.name}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{database.formatPrice(item.price, user?.currency)}</span>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button
                              onClick={() => updateOrderItemCount(index, -1)}
                              style={{
                                width: "24px", height: "24px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)",
                                background: "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center"
                              }}
                            >
                              -
                            </button>
                            <span style={{ width: "16px", textAlign: "center", fontSize: "0.9rem", fontWeight: "700" }}>{item.count}</span>
                            <button
                              onClick={() => updateOrderItemCount(index, 1)}
                              style={{
                                width: "24px", height: "24px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)",
                                background: "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center"
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total & Checkout */}
                    {(() => {
                      const activeItems = orderItems.filter(i => i.count > 0);
                      const total = activeItems.reduce((sum, item) => sum + item.price * item.count, 0);
                      
                      return (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "0.95rem" }}>
                            <span style={{ color: "var(--text-secondary)" }}>Total Amount</span>
                            <span style={{ fontWeight: "700", color: "var(--accent-gold)" }}>{database.formatPrice(total, user?.currency)}</span>
                          </div>

                          {orderSuccess ? (
                            <div style={{
                              background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", color: "#10b981",
                              padding: "12px", borderRadius: "10px", textAlign: "center", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                            }}>
                              <CheckCircle2 size={16} /> Order Dispatched to Seat {swapSenderSeat || selectedBooking.seats[0]}!
                            </div>
                          ) : (
                            <button
                              onClick={handlePlaceOrder}
                              disabled={total === 0}
                              className="btn-primary"
                              style={{ width: "100%", padding: "12px", fontWeight: "600" }}
                            >
                              Place Order to Seat {swapSenderSeat || selectedBooking.seats[0]}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Tab Content 3: Seat Swaps */}
                {activeTabSub === "swap" && (
                  <div className="glass-panel" style={{ padding: "32px", borderRadius: "20px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", minHeight: "500px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                      <RefreshCw size={20} color="var(--accent-gold)" />
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>P2P Seat Swaps & Trades</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Negotiate seat trades with other verified attendees</p>
                      </div>
                    </div>

                    {/* Active Swap Proposals (Inbox) */}
                    <div style={{ marginBottom: "28px" }}>
                      <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--accent-gold)", marginBottom: "12px" }}>Negotiations Inbox</h4>
                      {swaps.length === 0 ? (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No active seat trade negotiations found.</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {swaps.map(swap => {
                            const isIncoming = swap.recipientName.toLowerCase() === user.name.toLowerCase();
                            return (
                              <div 
                                key={swap.id}
                                style={{
                                  background: "rgba(255,255,255,0.02)",
                                  border: "1px solid rgba(255,255,255,0.05)",
                                  padding: "12px 16px",
                                  borderRadius: "12px"
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                  <span style={{ fontSize: "0.75rem", background: "var(--glass-bg-accent)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "20px", color: "var(--text-secondary)" }}>
                                    {isIncoming ? "Incoming Offer" : "Sent Offer"}
                                  </span>
                                  <span style={{
                                    fontSize: "0.75rem", fontWeight: "600",
                                    color: swap.status === "accepted" ? "#10b981" : swap.status === "rejected" ? "#ef4444" : "var(--accent-gold)"
                                  }}>
                                    {swap.status.toUpperCase()}
                                  </span>
                                </div>

                                <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", marginBottom: "10px" }}>
                                  {isIncoming 
                                    ? `Offer from ${swap.senderName}: swap your seat ${swap.recipientSeat} for their seat ${swap.senderSeat}.`
                                    : `Trade proposal to ${swap.recipientName}: your seat ${swap.senderSeat} for their seat ${swap.recipientSeat}.`
                                  }
                                </p>

                                {swap.status === "pending" && isIncoming && (
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                    <button
                                      onClick={() => handleUpdateSwapStatus(swap.id, "accepted")}
                                      style={{
                                        background: "#10b981", color: "#000", border: "none", padding: "6px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.75rem"
                                      }}
                                    >
                                      Accept Swap
                                    </button>
                                    <button
                                      onClick={() => handleUpdateSwapStatus(swap.id, "rejected")}
                                      style={{
                                        background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid #ef4444", padding: "6px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.75rem"
                                      }}
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Propose a trade form */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                      <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--accent-gold)", marginBottom: "14px" }}>Propose New Seat Swap</h4>
                      
                      {swapErrorMsg && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "10px" }}>{swapErrorMsg}</div>}
                      {swapSuccessMsg && <div style={{ color: "#10b981", fontSize: "0.8rem", marginBottom: "10px" }}>{swapSuccessMsg}</div>}

                      <form onSubmit={handleProposeSwap} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Your Seat</label>
                            <select
                              value={swapSenderSeat}
                              onChange={(e) => setSwapSenderSeat(e.target.value)}
                              className="glass-input"
                              style={{ padding: "8px", cursor: "pointer" }}
                            >
                              {selectedBooking.seats.map(s => (
                                <option key={s} value={s} style={{ background: "#060813" }}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Recipient Seat</label>
                            <input 
                              type="text"
                              required
                              placeholder="e.g. B12"
                              value={swapRecipientSeat}
                              onChange={(e) => setSwapRecipientSeat(e.target.value)}
                              className="glass-input"
                              style={{ padding: "8px" }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Recipient Username</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Julian Sterling"
                            value={swapRecipientName}
                            onChange={(e) => setSwapRecipientName(e.target.value)}
                            className="glass-input"
                            style={{ padding: "8px" }}
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ padding: "10px", marginTop: "6px", fontWeight: "600", fontSize: "0.85rem" }}
                        >
                          Dispatch Trade Offer
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Tab Content 4: Backstage Soundcheck visualizer */}
                {activeTabSub === "stream" && (
                  <div className="glass-panel" style={{ padding: "32px", borderRadius: "20px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", minHeight: "500px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                      <Video size={20} color="var(--accent-gold)" />
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Backstage Soundcheck Lounge</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Simulated direct livestream of the soundcheck rehearsals</p>
                      </div>
                    </div>

                    {/* Livestream screen frame */}
                    <div style={{
                      background: "#020205",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      height: "220px",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: "20px",
                      boxShadow: "inset 0 0 30px rgba(168, 85, 247, 0.1)"
                    }}>
                      {/* Floating livestream status */}
                      <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isVisualizing ? "#ef4444" : "rgba(255,255,255,0.25)", animation: isVisualizing ? "pulse 1.5s infinite" : "none" }} />
                        <span style={{ fontSize: "0.65rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: isVisualizing ? "#ef4444" : "var(--text-muted)" }}>
                          {isVisualizing ? "LIVE REHEARSAL" : "FEED OFF-LINE"}
                        </span>
                      </div>

                      <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Users size={10} /> {isVisualizing ? "284 online" : "0"}
                        </span>
                      </div>

                      {/* Video feedback display */}
                      {isVisualizing ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%", justifyContent: "center", padding: "40px" }}>
                          {/* Animated sound wave bars */}
                          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px", marginBottom: "16px" }}>
                            {visualizerBars.map((barHeight, i) => (
                              <div 
                                key={i} 
                                style={{
                                  width: "5px",
                                  height: `${barHeight}px`,
                                  background: "linear-gradient(to top, var(--accent-gold) 0%, #a855f7 100%)",
                                  borderRadius: "4px",
                                  transition: "height 0.1s ease-in-out"
                                }}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-primary)" }}>
                            Artist Soundcheck - Rehearsing Setlist
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                          <button 
                            onClick={() => setIsVisualizing(true)}
                            style={{
                              width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)",
                              border: "none", color: "#000", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer",
                              boxShadow: "0 10px 20px rgba(212, 175, 55, 0.2)"
                            }}
                          >
                            <Play size={20} fill="#000" />
                          </button>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>Start Backstage Soundcheck Stream</span>
                        </div>
                      )}
                    </div>

                    {/* Stream info and console */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "1px" }}>Backstage Feed Info</span>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        Tune in directly to check out the stage set-up, sound quality, and artist soundcheck rehearsals before gate opening. Rehearsal streams are reserved strictly for Premium VIP ticket holders.
                      </p>

                      {isVisualizing && (
                        <button
                          onClick={() => setIsVisualizing(false)}
                          style={{
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                            padding: "8px", borderRadius: "10px", color: "var(--text-secondary)", cursor: "pointer", marginTop: "10px",
                            fontSize: "0.8rem", fontWeight: "600"
                          }}
                        >
                          Disconnect Livestream Feed
                        </button>
                      )}
                    </div>

                    {/* Q&A / Fan Mail Box */}
                    <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <Sparkles size={16} color="var(--accent-gold)" />
                        <h4 style={{ fontSize: "1rem", fontWeight: "600" }}>Backstage Artist Q&A & Fan Mail</h4>
                      </div>

                      <form onSubmit={handleSubmitQuestion} style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                        <textarea
                          placeholder="Type your question or message for the artist here..."
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          className="glass-input"
                          rows={3}
                          style={{ width: "100%", resize: "none", fontSize: "0.85rem", padding: "12px", background: "rgba(255,255,255,0.02)" }}
                          maxLength={300}
                          required
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {300 - newQuestionText.length} characters remaining
                          </span>
                          <button
                            type="submit"
                            disabled={submittingQuestion || !newQuestionText.trim()}
                            className="btn-primary"
                            style={{ padding: "8px 24px", fontSize: "0.8rem", fontWeight: "600" }}
                          >
                            {submittingQuestion ? "Sending..." : "Send Backstage"}
                          </button>
                        </div>
                      </form>

                      {/* Question History */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "1px" }}>
                          Sent Mail ({fanQuestions.length})
                        </span>
                        
                        {fanQuestions.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                            {fanQuestions.map((q) => (
                              <div 
                                key={q.id} 
                                className="glass-panel" 
                                style={{ 
                                  padding: "16px", 
                                  border: q.status === "answered" ? "1px solid rgba(212, 175, 55, 0.25)" : "1px solid rgba(255, 255, 255, 0.05)",
                                  background: q.status === "answered" ? "rgba(212, 175, 55, 0.03)" : "rgba(255, 255, 255, 0.01)",
                                  borderRadius: "12px"
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{q.timestamp}</span>
                                  {q.status === "answered" ? (
                                    <span style={{ fontSize: "0.68rem", color: "var(--accent-gold)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                      💬 Answered
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "0.68rem", color: "#a855f7", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                      ⏳ Pending Review
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>
                                  “{q.questionText}”
                                </p>
                                
                                {q.status === "answered" && q.reply && (
                                  <div style={{ 
                                    marginTop: "12px", 
                                    paddingTop: "12px", 
                                    borderTop: "1px solid rgba(212, 175, 55, 0.15)",
                                    color: "var(--text-primary)"
                                  }}>
                                    <span style={{ fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-gold)", display: "block", marginBottom: "4px" }}>
                                      Artist Reply:
                                    </span>
                                    <p style={{ fontSize: "0.82rem", fontStyle: "italic", margin: 0, color: "var(--accent-gold-hover)" }}>
                                      {q.reply}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                            No questions sent yet. Ask something to the artist!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 5: P2P Resale Hub */}
                {activeTabSub === "exchange" && (
                  <div className="glass-panel" style={{ padding: "32px", borderRadius: "20px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", minHeight: "500px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <DollarSign size={20} color="var(--accent-gold)" />
                        <div>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Fan Resale Exchange</h3>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Secure face-value ticket exchange with 0% resale fees</p>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--accent-gold)", background: "rgba(212,175,55,0.1)", border: "1px solid var(--accent-gold)", padding: "4px 8px", borderRadius: "6px", fontWeight: "700" }}>
                        100% FACE VALUE CAPPED
                      </span>
                    </div>

                    {(isOffline || simulateOffline) ? (
                      <div style={{ textAlign: "center", padding: "40px" }}>
                        <AlertCircle size={32} color="#d97706" style={{ marginBottom: "12px" }} />
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Marketplace features are disabled in offline mode.</p>
                      </div>
                    ) : resaleListings.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "16px" }}>
                        <Ticket size={32} color="var(--text-muted)" style={{ marginBottom: "12px", opacity: 0.5 }} />
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "4px" }}>No tickets listed currently</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>All listed campaigns are fully booked. Check back later for fan resales.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {resaleListings.map((listing) => {
                          const isOwnListing = listing.sellerName.toLowerCase() === user.name.toLowerCase();
                          return (
                            <div 
                              key={listing.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "16px",
                                borderRadius: "12px",
                                background: "rgba(255,255,255,0.01)",
                                border: "1px solid rgba(255,255,255,0.04)"
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: "600", fontSize: "0.9rem", display: "block" }}>{listing.eventTitle}</span>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{listing.eventDate} • Seats: {listing.seats.join(", ")}</span>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>Seller: {isOwnListing ? "You" : listing.sellerName}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontWeight: "750", color: "var(--accent-gold)", fontSize: "1rem" }}>
                                  {database.formatPrice(listing.price, user?.currency)}
                                </span>
                                {isOwnListing ? (
                                  <button
                                    onClick={() => handleDelistResale()}
                                    style={{
                                      background: "rgba(239, 68, 68, 0.1)",
                                      border: "1px solid #ef4444",
                                      color: "#ef4444",
                                      padding: "6px 12px",
                                      borderRadius: "8px",
                                      fontSize: "0.75rem",
                                      fontWeight: "600",
                                      cursor: "pointer"
                                    }}
                                  >
                                    Delist
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Purchase resale ticket for ${database.formatPrice(listing.price, user?.currency)}?`)) {
                                        const result = await database.buyResaleListing(listing.id, user.name, user.email);
                                        if (result) {
                                          alert("Ticket purchased successfully! Fresh pass has been added to your wallet.");
                                          fetchBookingsAndSwaps();
                                        } else {
                                          alert("Resale purchase failed.");
                                        }
                                      }
                                    }}
                                    className="btn-primary"
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "0.75rem",
                                      fontWeight: "600",
                                      borderRadius: "8px"
                                    }}
                                  >
                                    Secure Buy
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content 6: Venue companion survival guide */}
                {activeTabSub === "venue" && (
                  <div className="glass-panel" style={{ padding: "32px", borderRadius: "20px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", minHeight: "500px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                      <MapPin size={20} color="var(--accent-gold)" />
                      <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Venue Guide & Logistics</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Survival companion for {selectedBooking.eventTitle}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {/* Event schedule timeline */}
                      <div>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", display: "block", marginBottom: "12px", letterSpacing: "1px" }}>Set Times Timeline</span>
                        <div style={{ background: "rgba(0,0,0,0.15)", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "var(--text-secondary)" }}>18:00</span>
                            <span style={{ fontWeight: "600" }}>Doors Open & VIP Lounge Access</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "var(--text-secondary)" }}>19:15</span>
                            <span style={{ fontWeight: "600" }}>Support Artist Act</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "var(--text-secondary)" }}>20:30</span>
                            <span style={{ color: "var(--accent-gold)", fontWeight: "700" }}>Headliner Act performance</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                            <span style={{ color: "var(--text-secondary)" }}>23:00</span>
                            <span style={{ color: "#ef4444", fontWeight: "600" }}>Curfew & Final Bar Calls</span>
                          </div>
                        </div>
                      </div>

                      {/* Venue Guidelines */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "14px", borderRadius: "12px" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>🎒 Bag Policy</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: "500" }}>Clear bags only. Maximum size 12" x 6" x 12".</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "14px", borderRadius: "12px" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>📷 Camera Policy</span>
                          <span style={{ fontSize: "0.8rem", fontWeight: "500" }}>No professional cameras. Phones allowed.</span>
                        </div>
                      </div>

                      {/* Transit & Uber Dropoff */}
                      <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", padding: "16px", borderRadius: "12px" }}>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", display: "block", marginBottom: "8px", letterSpacing: "1px" }}>Transit & Directions</span>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0 0 8px 0", lineHeight: "1.4" }}>
                          Uber/Lyft drop-off point is located at the **North Portal Gate 2**. VIP Parking is reserved at parking lot C (show this digital ticket for entry).
                        </p>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Subway: J, M, Z lines to Center Station.</span>
                      </div>

                      {/* Drink Bar Menu preview */}
                      <div>
                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", display: "block", marginBottom: "12px", letterSpacing: "1px" }}>Bar Lounge Section Menu</span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.8rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.1)", padding: "8px 12px", borderRadius: "8px" }}>
                            <span>Luxe Martini</span>
                            <span style={{ color: "var(--accent-gold)" }}>$18</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.1)", padding: "8px 12px", borderRadius: "8px" }}>
                            <span>Craft IPA</span>
                            <span style={{ color: "var(--accent-gold)" }}>$9</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.1)", padding: "8px 12px", borderRadius: "8px" }}>
                            <span>Grand Cru Flute</span>
                            <span style={{ color: "var(--accent-gold)" }}>$28</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.1)", padding: "8px 12px", borderRadius: "8px" }}>
                            <span>Truffle Fries</span>
                            <span style={{ color: "var(--accent-gold)" }}>$14</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </section>
            );
          })()}
        </div>
      )}
    </main>
  );
}
