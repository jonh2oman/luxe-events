"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { database } from "@/lib/database";
import { 
  ArrowLeft, Clock, CheckCircle2, ShoppingBag, MapPin, User,
  CheckCircle, Play, ShieldAlert, Award
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
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'dispatched'

  const fetchOrders = () => {
    database.getSeatServiceOrders().then(setOrders);
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      // Poll orders every 5 seconds for real-time feel
      const interval = setInterval(fetchOrders, 5000);
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
            Catering Operations
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.4rem", fontWeight: "700", marginTop: "4px" }}>
            VIP Seat Service Queue
          </h1>
        </div>
      </div>

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
    </div>
  );
}
