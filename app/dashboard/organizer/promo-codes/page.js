"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Ticket, Trash2, Plus, Tag, Percent, Sparkles } from "lucide-react";
import { database } from "@/lib/database";

export default function PromoCodeManager() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("percent");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    const fetched = await database.getPromoCodes();
    setCodes(fetched);
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newCode.trim() || !discount) {
      setError("Please fill out all fields.");
      return;
    }

    if (isNaN(discount) || Number(discount) <= 0) {
      setError("Discount must be a positive number.");
      return;
    }

    if (type === "percent" && Number(discount) > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    const result = await database.createPromoCode({
      code: newCode.toUpperCase().trim(),
      discount: Number(discount),
      type
    });

    if (result) {
      setNewCode("");
      setDiscount("");
      setSuccess(`Promo code ${result.code} created successfully!`);
      loadCodes();
    } else {
      setError("Code already exists or creation failed.");
    }
  };

  const handleDeleteCode = async (codeStr) => {
    if (confirm(`Are you sure you want to delete promo code ${codeStr}?`)) {
      await database.deletePromoCode(codeStr);
      loadCodes();
    }
  };

  return (
    <main style={{ padding: "0 24px", maxWidth: "1000px", margin: "0 auto", marginTop: "40px" }}>
      
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

      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", marginBottom: "32px" }}>Promo Code Engine</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1.3fr",
        gap: "45px",
        alignItems: "start"
      }}>
        
        {/* Left Column: Create Promo Code Form */}
        <section className="glass-panel" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <Plus size={18} color="var(--accent-gold)" /> Create Promo Code
          </h2>

          <form onSubmit={handleCreateCode} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Promo Code Name</label>
              <input 
                type="text" 
                placeholder="e.g. VIPEARLYBIRD"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="glass-input"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Discount Value</label>
                <input 
                  type="number" 
                  placeholder="e.g. 20"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Discount Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="glass-input"
                  style={{ cursor: "pointer", background: "var(--bg-secondary)" }}
                >
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Fixed CAD ($)</option>
                </select>
              </div>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
            {success && <p style={{ color: "#10b981", fontSize: "0.85rem", margin: 0 }}>{success}</p>}

            <button type="submit" className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <Tag size={16} /> Generate Code
            </button>
          </form>
        </section>

        {/* Right Column: Active Promo Codes list */}
        <section className="glass-panel" style={{ padding: "32px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <Ticket size={18} color="var(--accent-gold)" /> Active Promo Codes ({codes.length})
          </h2>

          {codes.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-secondary)" }}>
              <Tag size={36} color="var(--text-muted)" style={{ marginBottom: "12px", opacity: 0.5 }} />
              <p style={{ fontSize: "0.95rem" }}>No active promotional codes found.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {codes.map((code) => (
                <div 
                  key={code.code}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    transition: "border-color 0.2s"
                  }}
                  className="promo-card"
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "var(--accent-gold)", letterSpacing: "0.5px" }}>{code.code}</span>
                      <span style={{
                        fontSize: "0.75rem",
                        background: "rgba(255,255,255,0.06)",
                        padding: "2px 8px",
                        borderRadius: "100px",
                        fontWeight: "500",
                        color: "var(--text-secondary)"
                      }}>
                        {code.type === "percent" ? `${code.discount}% Off` : `$${code.discount} Off`}
                      </span>
                    </div>
                    
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginTop: "6px" }}>
                      Used: <strong>{code.usageCount || 0} times</strong>
                    </span>
                  </div>

                  <button 
                    onClick={() => handleDeleteCode(code.code)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "50%",
                      transition: "color 0.2s, background 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }}
                    title="Delete promo code"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Test Hint */}
          <div style={{
            marginTop: "32px",
            padding: "16px",
            borderRadius: "12px",
            background: "rgba(212, 175, 55, 0.03)",
            border: "1px solid rgba(212, 175, 55, 0.15)",
            display: "flex",
            gap: "12px"
          }}>
            <Sparkles size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              <strong>Testing Promo Codes:</strong> You can apply any active code in the event checkout summary section before paying to see the price drop automatically!
            </div>
          </div>
        </section>

      </div>

    </main>
  );
}
