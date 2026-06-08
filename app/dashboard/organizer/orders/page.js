"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { database } from "@/lib/database";
import { 
  ArrowLeft, Clock, CheckCircle2, ShoppingBag, MapPin, User,
  CheckCircle, Play, ShieldAlert, Award, MessageSquare, Trash2, Send, Sparkles
} from "lucide-react";

export default function SeatServiceQueuePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Role Gate
  useEffect(() => {
    if (!loading && (!user || user.role !== "organizer")) {
      router.push("/dashboard/settings");
    }
  }, [user, loading, router]);

  // State
  const [activeConsoleTab, setActiveConsoleTab] = useState("orders"); // 'orders' | 'qa'
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'dispatched'

  // Q&A State
  const [questions, setQuestions] = useState([]);
  const [replies, setReplies] = useState({});
  const [qaFilter, setQaFilter] = useState("all"); // 'all' | 'pending' | 'answered'
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const fetchOrders = () => {
    database.getSeatServiceOrders().then(setOrders);
  };

  const fetchQuestions = () => {
    database.getFanQuestions().then(setQuestions);
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchQuestions();
      // Poll orders and Q&A every 5 seconds for real-time feel
      const interval = setInterval(() => {
        fetchOrders();
        fetchQuestions();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleDispatchOrder = async (orderId) => {
    try {
      await database.updateOrderStatus(orderId, "dispatched");
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerQuestion = async (qId) => {
    const replyText = replies[qId] || "";
    if (!replyText.trim()) return;

    try {
      const success = await database.answerFanQuestion(qId, replyText);
      if (success) {
        setReplies(prev => ({ ...prev, [qId]: "" }));
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to dismiss this fan question?")) return;
    try {
      const success = await database.deleteFanQuestion(qId);
      if (success) {
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
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

  const filteredOrders = orders.filter(order => {
    if (filter === "pending") return order.status === "pending";
    if (filter === "dispatched") return order.status === "dispatched";
    return true;
  });

  const filteredQuestions = questions.filter(q => {
    if (qaFilter === "pending") return q.status === "pending";
    if (qaFilter === "answered") return q.status === "answered";
    return true;
  });

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
            {activeConsoleTab === "orders" ? "Catering Operations" : "Artist Experience"}
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: "700", marginTop: "4px" }}>
            {activeConsoleTab === "orders" ? "VIP Seat Service Queue" : "Backstage Fan Mail & Q&A"}
          </h1>
        </div>
      </div>

      {/* Console Tab Selector */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border-accent)",
        borderRadius: "12px",
        padding: "4px",
        marginBottom: "32px",
        maxWidth: "520px",
        gap: "8px"
      }}>
        <button
          onClick={() => setActiveConsoleTab("orders")}
          style={{
            flex: 1,
            background: activeConsoleTab === "orders" ? "var(--accent-gold)" : "transparent",
            color: activeConsoleTab === "orders" ? "#060813" : "var(--text-secondary)",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontWeight: "600",
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <ShoppingBag size={16} />
          <span>VIP Catering Orders</span>
          {orders.filter(o => o.status === "pending").length > 0 && (
            <span style={{
              background: activeConsoleTab === "orders" ? "#060813" : "var(--accent-gold)",
              color: activeConsoleTab === "orders" ? "var(--accent-gold)" : "#060813",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "2px 6px",
              borderRadius: "10px",
              marginLeft: "4px"
            }}>
              {orders.filter(o => o.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveConsoleTab("qa")}
          style={{
            flex: 1,
            background: activeConsoleTab === "qa" ? "var(--accent-gold)" : "transparent",
            color: activeConsoleTab === "qa" ? "#060813" : "var(--text-secondary)",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontWeight: "600",
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <MessageSquare size={16} />
          <span>Artist Q&A Fan Board</span>
          {questions.filter(q => q.status === "pending").length > 0 && (
            <span style={{
              background: activeConsoleTab === "qa" ? "#060813" : "#8b5cf6",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "2px 6px",
              borderRadius: "10px",
              marginLeft: "4px"
            }}>
              {questions.filter(q => q.status === "pending").length}
            </span>
          )}
        </button>
      </div>

      {activeConsoleTab === "orders" && (
        <>
          {/* Tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--border-accent)",
            marginBottom: "32px",
            gap: "24px"
          }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: filter === "all" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: filter === "all" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: filter === "all" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: filter === "pending" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: filter === "pending" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: filter === "pending" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              Pending ({orders.filter(o => o.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("dispatched")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: filter === "dispatched" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: filter === "dispatched" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: filter === "dispatched" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              Dispatched ({orders.filter(o => o.status === "dispatched").length})
            </button>
          </div>

          {/* Orders Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: "24px 32px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "16px",
                    flexWrap: "wrap",
                    gap: "20px"
                  }}
                >
                  {/* Order Metadata */}
                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{
                      background: order.status === "pending" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                      border: order.status === "pending" ? "1px solid #ef4444" : "1px solid #10b981",
                      color: order.status === "pending" ? "#ef4444" : "#10b981",
                      width: "50px", height: "50px", borderRadius: "12px",
                      display: "flex", justifyContent: "center", alignItems: "center",
                      flexShrink: 0
                    }}>
                      <ShoppingBag size={22} />
                    </div>
                    
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>#{order.id}</span>
                        <span style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border-accent)",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          color: "var(--accent-gold)",
                          fontWeight: "600",
                          display: "flex", alignItems: "center", gap: "4px"
                        }}>
                          <MapPin size={10} /> Seat {order.seatId}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <User size={14} style={{ color: "var(--text-muted)" }} />
                        {order.userName}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Event: {order.eventId === "solstice-2026" ? "Solstice Music Festival" : "Resonance Jazz Night"}
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "240px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Ordered Items</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {order.items.map((item, index) => (
                        <div key={index} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", gap: "20px" }}>
                          <span style={{ color: "var(--text-primary)" }}>
                            {item.name} <strong style={{ color: "var(--accent-gold)" }}>x{item.count}</strong>
                          </span>
                          <span style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {database.formatPrice(item.price * item.count, user?.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order total & Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", minWidth: "200px", justifyContent: "flex-end", flexGrow: 1 }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Order Total</span>
                      <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--accent-gold)", fontFamily: "monospace" }}>
                        {database.formatPrice(order.total, user?.currency)}
                      </span>
                    </div>

                    {order.status === "pending" ? (
                      <button
                        onClick={() => handleDispatchOrder(order.id)}
                        className="btn-primary"
                        style={{ padding: "10px 20px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <Play size={14} fill="#060813" />
                        <span>Dispatch</span>
                      </button>
                    ) : (
                      <span style={{
                        color: "#10b981", fontSize: "0.85rem", fontWeight: "600",
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        padding: "10px 20px", borderRadius: "30px"
                      }}>
                        <CheckCircle2 size={14} />
                        <span>Dispatched</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ padding: "80px 40px", textAlign: "center" }}>
                <Clock size={36} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: "600" }}>No orders in this stream</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
                  Active VIP Seat Service orders will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeConsoleTab === "qa" && (
        <>
          {/* Q&A Filter Tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid var(--border-accent)",
            marginBottom: "32px",
            gap: "24px"
          }}>
            <button
              onClick={() => setQaFilter("all")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: qaFilter === "all" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: qaFilter === "all" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: qaFilter === "all" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              All Questions ({questions.length})
            </button>
            <button
              onClick={() => setQaFilter("pending")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: qaFilter === "pending" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: qaFilter === "pending" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: qaFilter === "pending" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              Pending ({questions.filter(q => q.status === "pending").length})
            </button>
            <button
              onClick={() => setQaFilter("answered")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: qaFilter === "answered" ? "2px solid var(--accent-gold)" : "2px solid transparent",
                color: qaFilter === "answered" ? "var(--text-primary)" : "var(--text-secondary)",
                padding: "12px 4px",
                fontSize: "1rem",
                fontWeight: qaFilter === "answered" ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="nav-link"
            >
              Answered ({questions.filter(q => q.status === "answered").length})
            </button>
          </div>

          {/* Q&A Questions Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => {
                const isEditing = editingQuestionId === q.id;
                return (
                  <div 
                    key={q.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: "24px 32px", 
                      display: "flex", 
                      flexDirection: "column",
                      background: "var(--glass-bg)",
                      border: q.status === "answered" ? "1px solid rgba(212, 175, 55, 0.2)" : "1px solid var(--glass-border)",
                      borderRadius: "16px",
                      gap: "16px",
                      position: "relative"
                    }}
                  >
                    {/* Top Row: Meta and Badges */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>#{q.id}</span>
                        <span style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border-accent)",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "0.75rem",
                          color: "var(--text-primary)",
                          fontWeight: "500"
                        }}>
                          {q.eventTitle}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <User size={12} /> {q.userName} ({q.userEmail})
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{q.timestamp}</span>
                        {q.status === "answered" ? (
                          <span style={{
                            background: "rgba(212, 175, 55, 0.1)",
                            border: "1px solid var(--accent-gold)",
                            color: "var(--accent-gold)",
                            borderRadius: "12px",
                            padding: "2px 10px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <Sparkles size={10} /> Answered
                          </span>
                        ) : (
                          <span style={{
                            background: "rgba(168, 85, 247, 0.1)",
                            border: "1px solid #a855f7",
                            color: "#a855f7",
                            borderRadius: "12px",
                            padding: "2px 10px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <div style={{ fontSize: "1.1rem", fontStyle: "italic", color: "var(--text-primary)", fontFamily: "var(--font-serif)", borderLeft: "3px solid var(--border-accent)", paddingLeft: "16px", margin: "8px 0" }}>
                      “{q.questionText}”
                    </div>

                    {/* Reply Display & Forms */}
                    {q.status === "answered" && !isEditing ? (
                      <div style={{
                        background: "rgba(212, 175, 55, 0.03)",
                        border: "1px solid rgba(212, 175, 55, 0.15)",
                        borderRadius: "12px",
                        padding: "16px",
                        position: "relative"
                      }}>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: "var(--accent-gold)",
                          display: "block",
                          marginBottom: "6px"
                        }}>
                          Artist Reply
                        </span>
                        <p style={{ fontSize: "0.95rem", margin: 0, fontStyle: "italic", color: "var(--text-primary)" }}>
                          {q.reply}
                        </p>
                        
                        {/* Edit / Dismiss Row for Answered Question */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                          <button
                            onClick={() => {
                              setEditingQuestionId(q.id);
                              setReplies(prev => ({ ...prev, [q.id]: q.reply }));
                            }}
                            className="nav-link"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            Edit Reply
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Dismiss</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Reply Formulation Panel (Pending or Edit mode) */
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        background: "rgba(255, 255, 255, 0.01)",
                        border: "1px solid var(--border-accent)",
                        borderRadius: "12px",
                        padding: "16px"
                      }}>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                        }}>
                          {isEditing ? "Modify Backstage Response" : "Formulate Backstage Response"}
                        </span>
                        
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                          <textarea
                            value={replies[q.id] || ""}
                            onChange={(e) => setReplies(prev => ({ ...prev, [q.id]: e.target.value }))}
                            placeholder="Type artist or organizer reply..."
                            style={{
                              flex: 1,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border-accent)",
                              borderRadius: "8px",
                              padding: "10px 14px",
                              color: "var(--text-primary)",
                              fontSize: "0.9rem",
                              fontFamily: "inherit",
                              resize: "none",
                              minHeight: "60px",
                              outline: "none",
                              transition: "border 0.2s"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "var(--accent-gold)"}
                            onBlur={(e) => e.target.style.borderColor = "var(--border-accent)"}
                          />
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <button
                              onClick={() => {
                                handleAnswerQuestion(q.id);
                                if (isEditing) setEditingQuestionId(null);
                              }}
                              disabled={!(replies[q.id] || "").trim()}
                              className="btn-primary"
                              style={{
                                padding: "10px 18px",
                                fontSize: "0.85rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <Send size={14} />
                              <span>{isEditing ? "Save" : "Reply"}</span>
                            </button>
                            
                            {isEditing ? (
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                style={{
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid var(--border-accent)",
                                  color: "var(--text-secondary)",
                                  borderRadius: "8px",
                                  padding: "8px 18px",
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  textAlign: "center"
                                }}
                              >
                                Cancel
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                style={{
                                  background: "rgba(239, 68, 68, 0.08)",
                                  border: "1px solid rgba(239, 68, 68, 0.2)",
                                  color: "#ef4444",
                                  borderRadius: "8px",
                                  padding: "8px 18px",
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  justifyContent: "center"
                                }}
                              >
                                <Trash2 size={12} />
                                <span>Dismiss</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="glass-panel" style={{ padding: "80px 40px", textAlign: "center" }}>
                <MessageSquare size={36} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: "600" }}>No questions found</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
                  Attendee Q&A or fan mail for backstage will appear here.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
