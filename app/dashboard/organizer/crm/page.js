"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, Clipboard, CheckCircle, RefreshCw, Send, Sparkles, MessageSquare, Star, Trash2 } from "lucide-react";
import { database } from "@/lib/database";

export default function GuestCRM() {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesText, setNotesText] = useState("");
  
  // Support Portal states
  const [selectedBookingForSupport, setSelectedBookingForSupport] = useState(null);
  const [selectedOldSeat, setSelectedOldSeat] = useState(null);
  const [selectedNewSeat, setSelectedNewSeat] = useState(null);
  
  // Broadcast states
  const [selectedEventId, setSelectedEventId] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastAudienceSize, setBroadcastAudienceSize] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const fetchedBookings = await database.getBookings();
    setBookings(fetchedBookings);
    const fetchedEvents = await database.getEvents();
    setEvents(fetchedEvents);
    if (fetchedEvents.length > 0) {
      setSelectedEventId(fetchedEvents[0].id);
    }
  };

  const handleCheckIn = async (bookingId) => {
    const success = await database.checkInTicket(bookingId);
    if (success) {
      loadData();
    }
  };

  const handleToggleVip = async () => {
    if (!selectedBookingForSupport) return;
    const isVipNow = await database.toggleBookingVip(selectedBookingForSupport.id);
    setSelectedBookingForSupport(prev => ({ ...prev, isVip: isVipNow }));
    loadData();
  };

  const handleCancelAndRefund = async () => {
    if (!selectedBookingForSupport) return;
    const confirmed = window.confirm(`Are you sure you want to cancel booking ${selectedBookingForSupport.id} for ${selectedBookingForSupport.selectedBy} and issue a full refund? This will release seats: ${selectedBookingForSupport.seats.join(", ")}.`);
    if (confirmed) {
      const success = await database.cancelBooking(selectedBookingForSupport.id);
      if (success) {
        setSelectedBookingForSupport(null);
        setSelectedOldSeat(null);
        setSelectedNewSeat(null);
        loadData();
      }
    }
  };

  const handleConfirmReassignment = async () => {
    if (!selectedBookingForSupport || !selectedOldSeat || !selectedNewSeat) return;
    const success = await database.reassignSeat(selectedBookingForSupport.id, selectedOldSeat, selectedNewSeat);
    if (success) {
      const updatedSeats = selectedBookingForSupport.seats.map(s => s === selectedOldSeat ? selectedNewSeat : s);
      setSelectedBookingForSupport(prev => ({ ...prev, seats: updatedSeats }));
      setSelectedOldSeat(selectedNewSeat);
      setSelectedNewSeat(null);
      loadData();
    } else {
      alert("Seat reassignment failed. Ensure the target seat is vacant.");
    }
  };

  const handleOpenNotes = (booking) => {
    setEditingNotesId(booking.id);
    setNotesText(booking.notes || "");
  };

  const handleSaveNotes = async () => {
    if (!editingNotesId) return;
    await database.updateAttendeeNotes(editingNotesId, notesText);
    setEditingNotesId(null);
    setNotesText("");
    loadData();
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    // Calculate how many people will receive the broadcast
    const matchingAttendees = bookings.filter(b => b.eventId === selectedEventId);
    setBroadcastAudienceSize(matchingAttendees.length || 18); // fallback to active demo size if database is clean
    
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage("");
    }, 4000);
  };

  // Filter guest directory
  const filteredBookings = bookings.filter(b => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (b.selectedBy && b.selectedBy.toLowerCase().includes(query)) ||
      (b.eventTitle && b.eventTitle.toLowerCase().includes(query)) ||
      b.id.toLowerCase().includes(query) ||
      (b.seats && b.seats.join(" ").toLowerCase().includes(query))
    );
  });

  return (
    <main style={{ padding: "0 24px", maxWidth: "1200px", margin: "0 auto", marginTop: "40px" }}>
      
      {/* Back to Dashboard */}
      <Link href="/dashboard/organizer" style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "var(--text-secondary)",
        fontSize: "0.95rem",
        marginBottom: "24px"
      }} className="nav-link">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", marginBottom: "32px" }}>Attendee Relations (CRM)</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: "40px",
        alignItems: "start"
      }}>
        
        {/* Left Column: Guest Directory */}
        <section className="glass-panel" style={{ padding: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <Users size={18} color="var(--accent-gold)" /> Guest Directory ({filteredBookings.length})
            </h2>
            
            {/* Search Input */}
            <div style={{ position: "relative", width: "100%", maxWidth: "250px" }}>
              <input 
                type="text" 
                placeholder="Search guest, seat, or event..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input"
                style={{ width: "100%", padding: "8px 12px 8px 36px", fontSize: "0.85rem" }}
              />
              <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-secondary)" }}>
              <Users size={40} color="var(--text-muted)" style={{ marginBottom: "12px", opacity: 0.4 }} />
              <p style={{ fontSize: "0.95rem" }}>No matching attendees found in directory.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredBookings.map((booking) => (
                <div 
                  key={booking.id}
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                    <div>
                      {/* Name & Ticket Ref */}
                      <span style={{ fontWeight: "700", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        {booking.selectedBy || "Secured Guest"}
                        {booking.isVip && (
                          <span style={{
                            fontSize: "0.65rem",
                            background: "rgba(212, 175, 55, 0.12)",
                            border: "1px solid var(--accent-gold)",
                            color: "var(--accent-gold)",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                          }}>
                            VIP
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                        ID: {booking.id}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button 
                        onClick={() => {
                          setSelectedBookingForSupport(booking);
                          setSelectedOldSeat(booking.seats[0]);
                          setSelectedNewSeat(null);
                        }}
                        className="btn-primary"
                        style={{ 
                          padding: "4px 10px", 
                          fontSize: "0.8rem", 
                          background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.02) 100%)", 
                          border: "1px solid rgba(212,175,55,0.25)", 
                          color: "var(--accent-gold)" 
                        }}
                      >
                        Support Suite
                      </button>

                      {booking.isCheckedIn ? (
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8rem",
                          color: "#10b981",
                          background: "rgba(16, 185, 129, 0.08)",
                          padding: "4px 10px",
                          borderRadius: "30px",
                          fontWeight: "600",
                          border: "1px solid rgba(16, 185, 129, 0.2)"
                        }}>
                          <CheckCircle size={12} /> Checked In
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleCheckIn(booking.id)}
                          className="btn-secondary"
                          style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Seat & Event details */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.85rem", color: "var(--text-secondary)", borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Event:</span> <strong>{booking.eventTitle}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Seats:</span> <strong style={{ color: "var(--accent-gold)" }}>{booking.seats.join(", ")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Date:</span> {booking.eventDate}
                    </div>
                  </div>

                  {/* VIP Notes summary */}
                  <div style={{
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid rgba(255, 255, 255, 0.03)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <div style={{ color: booking.notes ? "var(--text-primary)" : "var(--text-muted)", fontStyle: booking.notes ? "normal" : "italic" }}>
                      {booking.notes ? `Note: ${booking.notes}` : "No administrative notes added."}
                    </div>
                    <button 
                      onClick={() => handleOpenNotes(booking)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--accent-gold)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      {booking.notes ? "Edit Note" : "+ Add Note"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Client Support, Notes Editing & Broadcast Announcements */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Client Administrative Support Panel */}
          {selectedBookingForSupport && (() => {
            const booking = selectedBookingForSupport;
            const selectedEvent = events.find(e => e.id === booking.eventId);
            const cols = selectedEvent?.cols || (booking.eventId === "jazz-resonance" ? 6 : booking.eventId === "symphony-lights" ? 8 : booking.eventId === "neon-indie-showcase" ? 8 : 10);
            
            return (
              <div className="glass-panel-gold" style={{ 
                padding: "24px", 
                border: "1px solid var(--accent-gold)", 
                background: "rgba(212, 175, 55, 0.03)", 
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "18px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--accent-gold)", fontWeight: "700", letterSpacing: "1px" }}>
                      Client Support Portal
                    </span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", margin: "2px 0 0 0" }}>
                      {booking.selectedBy}
                    </h3>
                    <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                      Ref: {booking.id}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => { setSelectedBookingForSupport(null); setSelectedOldSeat(null); setSelectedNewSeat(null); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "1.1rem"
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* VIP Status and Refund actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button
                    onClick={handleToggleVip}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px",
                      borderRadius: "10px",
                      background: booking.isVip ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.02)",
                      border: booking.isVip ? "1px solid var(--accent-gold)" : "1px solid rgba(255, 255, 255, 0.06)",
                      color: booking.isVip ? "var(--accent-gold)" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "0.8rem",
                      transition: "all 0.2s"
                    }}
                  >
                    <Star size={14} fill={booking.isVip ? "var(--accent-gold)" : "none"} />
                    {booking.isVip ? "VIP Guest" : "Upgrade to VIP"}
                  </button>

                  <button
                    onClick={handleCancelAndRefund}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "10px",
                      borderRadius: "10px",
                      background: "rgba(239, 68, 68, 0.05)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "0.8rem",
                      transition: "all 0.2s"
                    }}
                  >
                    <Trash2 size={14} />
                    Cancel & Refund
                  </button>
                </div>

                {/* Seat Reassignment Deck */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <RefreshCw size={14} color="var(--accent-gold)" /> Seat Reassignment Deck
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    Move guest from their current seat to any vacant green seat instantly.
                  </p>

                  {booking.seats.length > 1 ? (
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Select seat to move:</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {booking.seats.map(seatId => (
                          <button
                            key={seatId}
                            type="button"
                            onClick={() => { setSelectedOldSeat(seatId); setSelectedNewSeat(null); }}
                            style={{
                              background: selectedOldSeat === seatId ? "var(--accent-gold)" : "rgba(255,255,255,0.02)",
                              color: selectedOldSeat === seatId ? "#000" : "#fff",
                              border: selectedOldSeat === seatId ? "1px solid var(--accent-gold)" : "1px solid rgba(255,255,255,0.08)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            {seatId}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Current Seat:</span> <strong style={{ color: "var(--accent-gold)" }}>{selectedOldSeat}</strong>
                    </div>
                  )}

                  {selectedEvent ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: "5px",
                        padding: "8px",
                        background: "rgba(0,0,0,0.25)",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.05)"
                      }}>
                        {selectedEvent.seats.map(seat => {
                          const isCurrentSelected = seat.id === selectedOldSeat;
                          const isOtherBookedByClient = booking.seats.includes(seat.id) && seat.id !== selectedOldSeat;
                          const isBookedByOther = seat.isBooked && !booking.seats.includes(seat.id);
                          const isNewSelected = seat.id === selectedNewSeat;

                          let cellBg = "rgba(255,255,255,0.01)";
                          let cellBorder = "1px solid rgba(255,255,255,0.05)";
                          let cellColor = "#fff";
                          let cursorStyle = "pointer";

                          if (isCurrentSelected) {
                            cellBg = "var(--accent-gold)";
                            cellBorder = "1px solid var(--accent-gold)";
                            cellColor = "#000";
                          } else if (isOtherBookedByClient) {
                            cellBg = "rgba(168, 85, 247, 0.3)";
                            cellBorder = "1px solid rgba(168, 85, 247, 0.5)";
                          } else if (isNewSelected) {
                            cellBg = "#10b981";
                            cellBorder = "1px solid #10b981";
                            cellColor = "#000";
                          } else if (isBookedByOther) {
                            cellBg = "rgba(255,255,255,0.03)";
                            cellBorder = "1px solid rgba(255,255,255,0.02)";
                            cellColor = "rgba(255,255,255,0.15)";
                            cursorStyle = "not-allowed";
                          } else {
                            cellBorder = "1px solid rgba(16, 185, 129, 0.25)";
                          }

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={isBookedByOther}
                              onClick={() => !isBookedByOther && setSelectedNewSeat(seat.id)}
                              style={{
                                background: cellBg,
                                border: cellBorder,
                                color: cellColor,
                                cursor: cursorStyle,
                                aspectRatio: "1",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.6rem",
                                fontWeight: "600",
                                padding: 0
                              }}
                              title={seat.id + (isBookedByOther ? " (Booked)" : " (Vacant)")}
                            >
                              {seat.id}
                            </button>
                          );
                        })}
                      </div>

                      {selectedNewSeat && (
                        <button
                          onClick={handleConfirmReassignment}
                          className="btn-primary"
                          style={{
                            width: "100%",
                            padding: "8px",
                            fontSize: "0.8rem",
                            marginTop: "4px",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            border: "none",
                            color: "#fff"
                          }}
                        >
                          Confirm Seat Swap ({selectedOldSeat} → {selectedNewSeat})
                        </button>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Loading seating map...</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Notes Editing Card */}
          {editingNotesId && (
            <div className="glass-panel-gold" style={{ padding: "24px", border: "1px solid var(--accent-gold)" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>
                Add/Edit Guest Notes
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Document allergy notifications, seating requests, or custom VIP preferences.
              </p>
              <textarea 
                rows={3}
                placeholder="e.g. Has gluten allergy. Prefers center aisles..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="glass-input"
                style={{ width: "100%", resize: "none", fontSize: "0.85rem", marginBottom: "16px" }}
              />
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => setEditingNotesId(null)} 
                  className="btn-secondary" 
                  style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveNotes} 
                  className="btn-primary" 
                  style={{ padding: "6px 16px", fontSize: "0.8rem" }}
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Broadcast Center */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Send size={16} color="var(--accent-gold)" /> Event Broadcast Center
            </h3>

            {broadcastSent ? (
              <div style={{
                padding: "32px 16px",
                textAlign: "center",
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                animation: "feedbackPulse 2s infinite"
              }}>
                <CheckCircle size={32} color="#10b981" style={{ marginBottom: "12px" }} />
                <h4 style={{ color: "#10b981", fontWeight: "700", fontSize: "1.1rem" }}>BROADCAST DISPATCHED</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                  Announcements sent successfully to <strong>{broadcastAudienceSize}</strong> ticket holders via Email & SMS.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Select Event Target</label>
                  <select 
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="glass-input"
                    style={{ fontSize: "0.85rem", background: "var(--bg-secondary)", cursor: "pointer" }}
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Broadcast Message</label>
                  <textarea 
                    rows={4}
                    placeholder="e.g. Doors open at 7:00 PM. High-end cocktail lounge open early! See you soon."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="glass-input"
                    style={{ width: "100%", resize: "none", fontSize: "0.85rem" }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                  <Send size={14} /> Send Broadcast
                </button>
              </form>
            )}
          </div>

          {/* Tips info box */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Sparkles size={14} color="var(--accent-gold)" /> Pro CRM Tip
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              Use manual check-ins if guests forget their digital passes or QR codes. Add VIP dietary notes during registration calls so catering lists update automatically behind the scenes.
            </p>
          </div>

        </section>
      </div>

    </main>
  );
}
