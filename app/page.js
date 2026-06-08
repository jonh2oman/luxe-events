"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, MapPin, Tag, ArrowRight, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { database } from "@/lib/database";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    database.getEvents().then(allEvents => {
      setEvents(allEvents);
      setFeaturedEvents(allEvents.filter(e => e.featured));
    });
  }, []);

  // Filter events based on search & category
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || 
      event.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <main style={{ padding: "0 24px", maxWidth: "1200px", margin: "0 auto", marginTop: "40px" }}>
      
      {/* Premium Hero Carousel Banner */}
      {featuredEvents.length > 0 && (
        <section className="glass-panel-gold" style={{
          position: "relative",
          height: "480px",
          overflow: "hidden",
          borderRadius: "24px",
          display: "flex",
          alignItems: "flex-end",
          padding: "40px",
          marginBottom: "60px",
          border: "1px solid rgba(212, 175, 55, 0.15)",
        }}>
          {/* Background image with overlay */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}>
            <Image 
              src={featuredEvents[0].image}
              alt={featuredEvents[0].title}
              fill
              priority
              style={{ objectFit: "cover" }}
            />
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to top, rgba(6, 8, 19, 0.95) 0%, rgba(6, 8, 19, 0.4) 50%, rgba(0,0,0,0) 100%)",
            }}></div>
          </div>

          {/* Hero Content */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: "600px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(212, 175, 55, 0.15)",
              border: "1px solid var(--accent-gold)",
              padding: "4px 12px",
              borderRadius: "20px",
              marginBottom: "16px"
            }}>
              <Sparkles size={14} color="var(--accent-gold)" />
              <span style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-gold)", letterSpacing: "1px" }}>Featured Experience</span>
            </div>
            
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontSize: "3rem",
              fontWeight: "700",
              lineHeight: 1.1,
              marginBottom: "12px",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)"
            }}>{featuredEvents[0].title}</h1>
            
            <p style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              marginBottom: "24px",
              fontWeight: "300"
            }}>{featuredEvents[0].subtitle}</p>
            
            <div style={{ display: "flex", gap: "24px", marginBottom: "32px", color: "var(--text-primary)", fontSize: "0.95rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={16} color="var(--accent-gold)" />
                <span>{new Date(featuredEvents[0].date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={16} color="var(--accent-gold)" />
                <span>{featuredEvents[0].location}</span>
              </div>
            </div>

            <Link href={`/events/${featuredEvents[0].id}`}>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Reserve Premium Seats <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        marginBottom: "60px"
      }}>
        <div className="glass-panel" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--accent-gold)" }}>
            <Compass size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>Social Experiences</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>See where your friends are heading and join real-time chatrooms prior to doors opening.</p>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--accent-gold)" }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>Interactive Seating</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Our clean glassmorphic seating map lets you choose the perfect viewpoint in real time.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ background: "rgba(212, 175, 55, 0.1)", padding: "12px", borderRadius: "12px", color: "var(--accent-gold)" }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>Guaranteed Checkout</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Every booking is processed securely with immediate 3D-ticket creation and seat locking.</p>
          </div>
        </div>
      </section>

      {/* Discovery Section (Search & Filter Bar) */}
      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: "24px" }}>Discover Experiences</h2>
        
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px"
        }}>
          {/* Search bar */}
          <div className="glass-panel" style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 16px",
            borderRadius: "30px",
            flex: "1",
            minWidth: "300px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: "10px" }} />
            <input 
              type="text" 
              placeholder="Search concerts, venues, artist details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                padding: "12px 0",
                fontSize: "0.95rem",
                outline: "none"
              }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "4px",
            borderRadius: "30px",
            border: "1px solid rgba(255, 255, 255, 0.05)"
          }}>
            {["All", "Music", "Arts"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "transparent",
                  color: selectedCategory === cat ? "#060813" : "var(--text-secondary)",
                  padding: "8px 24px",
                  borderRadius: "20px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: "0.9rem"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "32px"
          }}>
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                className="glass-panel" 
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "20px",
                  overflow: "hidden",
                  transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.borderColor = "var(--glass-border-gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--glass-border)";
                }}
              >
                {/* Card Image */}
                <div style={{ position: "relative", height: "200px", width: "100%" }}>
                  <Image 
                    src={event.image} 
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "rgba(6, 8, 19, 0.75)",
                    backdropFilter: "blur(4px)",
                    padding: "6px 12px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <Tag size={12} color="var(--accent-gold)" />
                    <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--accent-gold)" }}>{event.category}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: "1" }}>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "8px" }}>{event.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "300", marginBottom: "20px", flex: "1" }}>
                    {event.subtitle}
                  </p>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginTop: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={14} color="var(--accent-gold)" />
                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MapPin size={14} color="var(--accent-gold)" />
                        <span style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "240px"
                        }}>{event.location}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Tickets from</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-primary)" }}>{database.formatPrice(event.price, user?.currency)}</span>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <button className="btn-secondary" style={{ padding: "8px 18px", borderRadius: "18px", fontSize: "0.85rem" }}>
                          Choose Seats
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>No premium experiences found matching your query.</p>
          </div>
        )}
      </section>
    </main>
  );
}
