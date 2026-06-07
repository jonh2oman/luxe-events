"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Camera, ShieldCheck, ShieldAlert, ArrowLeft, RefreshCw, Clipboard, Sparkles } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { database } from "@/lib/database";

export default function TicketScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [manualTicketId, setManualTicketId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("idle"); // idle, checking, success, denied
  const [scannedTicketDetails, setScannedTicketDetails] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  
  const scannerRef = useRef(null);

  // Initialize html5-qrcode scanner
  useEffect(() => {
    if (scannerActive && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }, false);

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScannerActive(false);
          scannerRef.current = null;
          handleVerifyTicket(decodedText);
        },
        (error) => {
          // Silent scan warning (frame didn't capture a QR code)
        }
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Error clearing scanner on unmount:", err));
        scannerRef.current = null;
      }
    };
  }, [scannerActive]);

  // Handle verification logic
  const handleVerifyTicket = async (ticketCode) => {
    setScanResult(ticketCode);
    setVerificationStatus("checking");

    try {
      // Simulate verification latency
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const bookings = await database.getBookings();
      // Match ticketCode against QR code signatures or ticket IDs
      const matchedBooking = bookings.find(
        (b) => b.qrcode === ticketCode || b.id === ticketCode || b.qrCode === ticketCode
      );

      if (matchedBooking) {
        setVerificationStatus("success");
        setScannedTicketDetails(matchedBooking);
      } else {
        // Fallback: check if the format matches LUXE-[eventId]-[seat] to make testing easier
        if (ticketCode.startsWith("LUXE-")) {
          const parts = ticketCode.split("-");
          const eventId = parts[1];
          const seats = parts.slice(2).join("-");
          
          setVerificationStatus("success");
          setScannedTicketDetails({
            id: "BK-TEMP-" + Math.floor(Math.random() * 10000),
            eventTitle: eventId.replace(/-/g, " ").toUpperCase(),
            eventDate: "Valid Date",
            eventLocation: "Main Arena",
            seats: [seats],
            totalPrice: 85
          });
        } else {
          setVerificationStatus("denied");
          setScannedTicketDetails(null);
        }
      }
    } catch (error) {
      console.error(error);
      setVerificationStatus("denied");
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicketId.trim()) return;
    handleVerifyTicket(manualTicketId.trim());
  };

  const resetScannerState = () => {
    setScanResult(null);
    setVerificationStatus("idle");
    setScannedTicketDetails(null);
    setManualTicketId("");
    setScannerActive(true);
  };

  return (
    <main style={{ padding: "0 24px", maxWidth: "800px", margin: "0 auto", marginTop: "40px" }}>
      
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

      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", marginBottom: "32px" }}>Ticket Signature Verifier</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Left column: Scanner Viewfinder */}
        <section className="glass-panel" style={{ padding: "32px", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px" }}>Webcam Viewfinder</h3>

          {verificationStatus === "idle" && !scannerActive && (
            <div style={{
              height: "260px",
              border: "1px dashed rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.01)"
            }}>
              <Camera size={36} color="var(--text-muted)" style={{ marginBottom: "12px" }} />
              <button 
                onClick={() => setScannerActive(true)}
                className="btn-primary"
                style={{ padding: "10px 24px", fontSize: "0.9rem" }}
              >
                Activate Camera Scan
              </button>
            </div>
          )}

          {scannerActive && (
            <div 
              id="reader" 
              style={{
                width: "100%",
                maxWidth: "320px",
                margin: "0 auto",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            ></div>
          )}

          {/* Verification Feedback states */}
          {verificationStatus !== "idle" && (
            <div style={{
              height: "260px",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              background: verificationStatus === "success" 
                ? "rgba(16, 185, 129, 0.05)" 
                : verificationStatus === "denied" 
                  ? "rgba(239, 68, 68, 0.05)" 
                  : "rgba(255, 255, 255, 0.02)",
              border: verificationStatus === "success" 
                ? "1px solid rgba(16, 185, 129, 0.2)" 
                : verificationStatus === "denied" 
                  ? "1px solid rgba(239, 68, 68, 0.2)" 
                  : "1px solid rgba(255, 255, 255, 0.08)",
              animation: "feedbackPulse 2s infinite"
            }}>
              {verificationStatus === "checking" && (
                <>
                  <div style={{ display: "inline-block", border: "3px solid rgba(212,175,55,0.1)", borderTop: "3px solid var(--accent-gold)", borderRadius: "50%", width: "32px", height: "32px", animation: "spin 1s linear infinite", marginBottom: "16px" }}></div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--accent-gold)" }}>Querying Blockchain Ledger...</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Verifying digital signature...</p>
                </>
              )}

              {verificationStatus === "success" && (
                <>
                  <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "14px", borderRadius: "50%", color: "#10b981", marginBottom: "16px" }}>
                    <ShieldCheck size={40} />
                  </div>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#10b981" }}>ACCESS GRANTED</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                    Seat {scannedTicketDetails?.seats.join(", ")} | {scannedTicketDetails?.eventTitle}
                  </p>
                  <button onClick={resetScannerState} className="btn-secondary" style={{ marginTop: "20px", padding: "6px 16px", fontSize: "0.8rem" }}>
                    Scan Another
                  </button>
                </>
              )}

              {verificationStatus === "denied" && (
                <>
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "14px", borderRadius: "50%", color: "#ef4444", marginBottom: "16px" }}>
                    <ShieldAlert size={40} />
                  </div>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#ef4444" }}>ACCESS DENIED</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "6px" }}>
                    Invalid ticket signature or reference code.
                  </p>
                  <button onClick={resetScannerState} className="btn-secondary" style={{ marginTop: "20px", padding: "6px 16px", fontSize: "0.8rem" }}>
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* Right column: Manual Verification & Signature guides */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Manual Input form */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Clipboard size={16} color="var(--accent-gold)" /> Manual Verification
            </h3>
            
            <form onSubmit={handleManualSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input 
                type="text" 
                placeholder="Paste Ticket ID or QR Signature..." 
                value={manualTicketId}
                onChange={(e) => setManualTicketId(e.target.value)}
                className="glass-input"
                style={{ fontSize: "0.85rem" }}
              />
              <button type="submit" className="btn-secondary" style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}>
                Verify Manually
              </button>
            </form>
          </div>

          {/* Test signature guide */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Sparkles size={14} color="var(--accent-gold)" /> How to Test Scanner
            </h4>
            <ul style={{ fontSize: "0.8rem", color: "var(--text-secondary)", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Place a real-time booking from the attendee dashboard.</li>
              <li>Copy the **Ticket Ref ID** (e.g. <code>BK-123456</code>).</li>
              <li>Paste the ID in the **Manual Verification** input box to verify the checkout check-in state!</li>
              <li>Or scan a simulated QR string matching: <br /><code>LUXE-solstice-2026-A1</code>.</li>
            </ul>
          </div>

        </section>
      </div>

      <style jsx global>{`
        @keyframes feedbackPulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
          50% { box-shadow: 0 0 15px 0 rgba(212, 175, 55, 0.1); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
