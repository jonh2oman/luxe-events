"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ticket, Calendar, MapPin, Send, MessageSquare, Users, Sparkles, AlertCircle } from "lucide-react";
import { database } from "@/lib/database";
import { useAuth } from "@/context/AuthContext";

export default function AttendeeDashboard() {
  const { user, loading, login, signUp } = useAuth();
  
  // Auth Gate states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attendingFriends, setAttendingFriends] = useState([]);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      database.getBookings(user.email).then(fetchedBookings => {
        setBookings(fetchedBookings);
        if (fetchedBookings.length > 0) {
          setSelectedBooking(fetchedBookings[0]);
        } else {
          setSelectedBooking(null);
        }
      });
    }
  }, [user]);

  // Update chat and friends when selected ticket changes
  useEffect(() => {
    if (selectedBooking) {
      // Subscribe to real-time chat messages
      const unsubscribe = database.subscribeToMessages(selectedBooking.eventId, (msgs) => {
        setMessages(msgs);
      });

      const friends = database.getAttendingFriends(selectedBooking.eventId);
      setAttendingFriends(friends);

      return () => unsubscribe();
    }
  }, [selectedBooking]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending chat message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedBooking || !user) return;

    const sentMsg = await database.sendMessage(selectedBooking.eventId, user.name, newMessage);
    if (sentMsg) {
      setNewMessage("");
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
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", marginBottom: "32px" }}>Attendee Dashboard</h1>

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
            {selectedBooking && (
              <div className="glass-panel" style={{
                position: "relative",
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
                border: "1px solid var(--glass-border-gold)",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column"
              }}>
                {/* Header ribbon */}
                <div style={{
                  background: "linear-gradient(90deg, #aa8010, var(--accent-gold), #aa8010)",
                  height: "8px",
                  width: "100%"
                }}></div>

                <div style={{ padding: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--accent-gold)", letterSpacing: "1px", fontWeight: "700" }}>Official Entry Ticket</span>
                      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: "700", marginTop: "4px" }}>{selectedBooking.eventTitle}</h3>
                    </div>
                    <Ticket size={24} color="var(--accent-gold)" />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px", fontSize: "0.85rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Date & Time</span>
                      <span style={{ fontWeight: "500" }}>{selectedBooking.eventDate}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Venue</span>
                      <span style={{ fontWeight: "500" }}>{selectedBooking.eventLocation}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Seats Secured</span>
                      <span style={{ fontWeight: "600", color: "var(--accent-gold)" }}>{selectedBooking.seats.join(", ")}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Secured Amount</span>
                      <span style={{ fontWeight: "500" }}>{database.formatPrice(selectedBooking.totalPrice, user?.currency)}</span>
                    </div>
                  </div>

                  {/* QR Code section */}
                  <div style={{
                    borderTop: "1px dashed rgba(255,255,255,0.1)",
                    paddingTop: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Ticket Ref</span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-primary)" }}>{selectedBooking.id}</span>
                    </div>

                    {/* QR Code design box */}
                    <div style={{
                      background: "white",
                      padding: "8px",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}>
                      <div style={{
                        width: "80px",
                        height: "80px",
                        background: "repeating-linear-gradient(45deg, #000 0px, #000 4px, #fff 4px, #fff 8px)",
                        opacity: 0.85
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Chat & Friends */}
          {selectedBooking && (
            <section style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}>
              
              {/* Friends list */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Users size={16} color="var(--accent-gold)" /> 
                  Friends Attending This Event
                </h3>
                
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {attendingFriends.length > 0 ? (
                    attendingFriends.map((friend, i) => (
                      <div 
                        key={i} 
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "rgba(255, 255, 255, 0.03)",
                          padding: "6px 12px",
                          borderRadius: "20px",
                          border: "1px solid rgba(255,255,255,0.05)"
                        }}
                      >
                        <div style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)",
                          color: "#060813",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: "700"
                        }}>
                          {friend.avatar}
                        </div>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: "500" }}>{friend.name}</span>
                        {friend.active && (
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Invite your friends to see them here.</p>
                  )}
                </div>
              </div>

              {/* Chat Module */}
              <div className="glass-panel" style={{
                display: "flex",
                flexDirection: "column",
                height: "500px",
                borderRadius: "20px"
              }}>
                {/* Chat header */}
                <div style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <MessageSquare size={18} color="var(--accent-gold)" />
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "600" }}>{selectedBooking.eventTitle} Lounge Chat</h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Exclusive to ticket holders</span>
                  </div>
                </div>

                {/* Messages area */}
                <div style={{
                  flex: 1,
                  padding: "24px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
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
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginBottom: "4px",
                          display: "flex",
                          gap: "6px"
                        }}>
                          <span style={{ fontWeight: "600" }}>{msg.user}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        
                        <div style={{
                          background: isSelf ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "rgba(255,255,255,0.03)",
                          color: isSelf ? "#060813" : "var(--text-primary)",
                          padding: "10px 16px",
                          borderRadius: isSelf ? "16px 16px 0 16px" : "0 16px 16px 16px",
                          border: isSelf ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                          fontSize: "0.9rem",
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
                    padding: "16px 24px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    gap: "12px",
                    background: "rgba(6, 8, 19, 0.3)"
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
                      padding: "10px 20px",
                      color: "var(--text-primary)",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                  <button 
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)",
                      border: "none",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      color: "#060813"
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

            </section>
          )}
        </div>
      )}
    </main>
  );
}
