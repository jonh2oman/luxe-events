"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Layout, Sparkles, Plus, Save, Trash2, CheckCircle2, RotateCcw } from "lucide-react";

export default function SeatingDesigner() {
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [templateName, setTemplateName] = useState("Main Hangar Lounge");
  const [grid, setGrid] = useState([]);
  const [selectedTier, setSelectedTier] = useState("General Admission");
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  const tiers = [
    { name: "General Admission", color: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)" },
    { name: "VIP Terrace", color: "rgba(212, 175, 55, 0.08)", border: "1px solid rgba(212, 175, 55, 0.35)" },
    { name: "VIP Lounge", color: "rgba(212, 175, 55, 0.2)", border: "1px solid var(--accent-gold)" },
    { name: "Corridor / Aisle", color: "transparent", border: "1px dashed rgba(255, 255, 255, 0.02)" }
  ];

  // Initialize custom layout grid based on rows and columns
  useEffect(() => {
    const newGrid = [];
    for (let r = 0; r < rows; r++) {
      const rowName = String.fromCharCode(65 + r);
      for (let c = 1; c <= cols; c++) {
        newGrid.push({
          id: `${rowName}${c}`,
          row: rowName,
          number: c,
          tier: "General Admission",
          price: 45
        });
      }
    }
    setGrid(newGrid);
  }, [rows, cols]);

  // Load saved templates
  useEffect(() => {
    const templates = localStorage.getItem("luxe_layout_templates");
    if (templates) {
      setSavedTemplates(JSON.parse(templates));
    } else {
      const defaultPresets = [
        {
          name: "Vapor Hangar (Corridors)",
          rows: 6,
          cols: 8,
          grid: Array.from({ length: 48 }, (_, i) => {
            const row = String.fromCharCode(65 + Math.floor(i / 8));
            const col = (i % 8) + 1;
            // Create a center aisle (Corridor) at column 4 & 5
            const isAisle = col === 4 || col === 5;
            return {
              id: `${row}${col}`,
              row,
              number: col,
              tier: isAisle ? "Corridor / Aisle" : row === "A" ? "VIP Lounge" : "General Admission",
              price: row === "A" ? 120 : 45
            };
          })
        }
      ];
      localStorage.setItem("luxe_layout_templates", JSON.stringify(defaultPresets));
      setSavedTemplates(defaultPresets);
    }
  }, []);

  // Update a specific cell's tier
  const handleCellClick = (cellId) => {
    setGrid(grid.map(cell => {
      if (cell.id === cellId) {
        let price = 45;
        if (selectedTier === "VIP Lounge") price = 150;
        else if (selectedTier === "VIP Terrace") price = 85;
        else if (selectedTier === "Corridor / Aisle") price = 0;
        
        return { ...cell, tier: selectedTier, price };
      }
      return cell;
    }));
  };

  // Save the custom template configuration
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;

    const newTemplate = {
      name: templateName,
      rows,
      cols,
      grid
    };

    const updated = [...savedTemplates.filter(t => t.name !== templateName), newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem("luxe_layout_templates", JSON.stringify(updated));

    setSuccessMsg(`Template "${templateName}" successfully saved!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Delete a template
  const handleDeleteTemplate = (nameToDelete) => {
    const updated = savedTemplates.filter(t => t.name !== nameToDelete);
    setSavedTemplates(updated);
    localStorage.setItem("luxe_layout_templates", JSON.stringify(updated));
  };

  // Apply a template preset
  const handleApplyTemplate = (template) => {
    setTemplateName(template.name);
    setRows(template.rows);
    setCols(template.cols);
    setGrid(template.grid);
  };

  return (
    <main style={{ padding: "0 24px", maxWidth: "1250px", margin: "0 auto", marginTop: "40px" }}>
      
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

      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", marginBottom: "32px" }}>Custom Seating Layout Designer</h1>

      {successMsg && (
        <div style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid #10b981",
          color: "#10b981",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "24px",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "40px", alignItems: "start" }}>
        
        {/* Left column: Visual Grid Designer canvas */}
        <section className="glass-panel" style={{ padding: "32px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600" }}>Designer Canvas</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              {tiers.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTier(t.name)}
                  style={{
                    background: selectedTier === t.name ? "linear-gradient(135deg, var(--accent-gold) 0%, #aa8010 100%)" : "rgba(255,255,255,0.03)",
                    color: selectedTier === t.name ? "#060813" : "var(--text-secondary)",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: selectedTier === t.name ? "none" : "1px solid rgba(255,255,255,0.08)",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* STAGE label */}
          <div style={{
            width: "80%",
            height: "30px",
            background: "rgba(212, 175, 55, 0.05)",
            border: "1px solid var(--accent-gold-glow)",
            borderBottom: "none",
            borderRadius: "50px 50px 0 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "40px",
            boxShadow: "0 -5px 15px rgba(212, 175, 55, 0.05)"
          }}>
            <span style={{ fontSize: "0.7rem", fontWeight: "700", letterSpacing: "5px", color: "var(--accent-gold)" }}>STAGE</span>
          </div>

          {/* Dynamic grid mapping */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "8px",
            width: "100%",
            maxWidth: "520px",
            marginBottom: "32px",
            padding: "16px",
            background: "rgba(255,255,255,0.01)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.03)"
          }}>
            {grid.map((cell) => {
              const matchingTier = tiers.find(t => t.name === cell.tier) || tiers[0];
              const isCorridor = cell.tier === "Corridor / Aisle";
              
              return (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(cell.id)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "6px",
                    background: matchingTier.color,
                    border: matchingTier.border,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    color: isCorridor ? "transparent" : "var(--text-primary)",
                    transition: "all 0.2s"
                  }}
                  title={`${cell.id} (${cell.tier}) - $${cell.price}`}
                >
                  {!isCorridor && cell.id}
                </button>
              );
            })}
          </div>

          {/* Grid settings info */}
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "flex-start" }}>
            💡 click on a seat block to paint it with the selected tier brush. Corridor blocks render as open walkways.
          </p>

        </section>

        {/* Right column: Config sidebar and templates lists */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Grid Dimensions */}
          <div className="glass-panel" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Layout size={16} color="var(--accent-gold)" /> Layout Dimension Controls
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Total Rows</label>
                <input 
                  type="number" 
                  min="2" 
                  max="12" 
                  value={rows}
                  onChange={(e) => setRows(Math.min(12, parseInt(e.target.value) || 2))}
                  className="glass-input" 
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Total Columns</label>
                <input 
                  type="number" 
                  min="2" 
                  max="14" 
                  value={cols}
                  onChange={(e) => setCols(Math.min(14, parseInt(e.target.value) || 2))}
                  className="glass-input" 
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "24px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Template Name</label>
              <input 
                type="text"
                placeholder="Template Name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="glass-input"
              />
            </div>

            <button 
              onClick={handleSaveTemplate}
              className="btn-primary" 
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              <Save size={16} /> Save Layout Template
            </button>
          </div>

          {/* Preset templates list */}
          <div className="glass-panel" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "20px" }}>Saved Seating Layouts</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {savedTemplates.map((template, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.03)"
                  }}
                >
                  <div 
                    onClick={() => handleApplyTemplate(template)}
                    style={{ cursor: "pointer", flex: 1 }}
                  >
                    <span style={{ fontWeight: "600", fontSize: "0.9rem", display: "block", color: "var(--text-primary)" }}>{template.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{template.rows} x {template.cols} Grid Layout</span>
                  </div>

                  {template.name !== "Vapor Hangar (Corridors)" && (
                    <button 
                      onClick={() => handleDeleteTemplate(template.name)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "4px"
                      }}
                      className="nav-link"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

    </main>
  );
}
