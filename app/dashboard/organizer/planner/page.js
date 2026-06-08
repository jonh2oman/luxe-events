"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ArrowRight, Check, Sparkles, Folder, ListTodo } from "lucide-react";
import { database } from "@/lib/database";

export default function EventPlanner() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Production");
  
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const fetched = await database.getPlannerTasks();
    setTasks(fetched);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await database.createPlannerTask({
      title: newTaskTitle.trim(),
      status: "todo",
      category: newTaskCategory
    });

    setNewTaskTitle("");
    loadTasks();
  };

  const handleMoveTask = async (taskId, newStatus) => {
    await database.updatePlannerTaskStatus(taskId, newStatus);
    loadTasks();
  };

  const handleDeleteTask = async (taskId) => {
    await database.deletePlannerTask(taskId);
    loadTasks();
  };

  // Group tasks by status
  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  const categories = ["Production", "Talent", "Food & Beverage", "Operations", "Marketing"];

  // Helper to determine category tag styles
  const getCategoryStyle = (cat) => {
    switch (cat) {
      case "Production": return { bg: "rgba(168, 85, 247, 0.08)", text: "#a855f7" };
      case "Talent": return { bg: "rgba(212, 175, 55, 0.08)", text: "var(--accent-gold)" };
      case "Food & Beverage": return { bg: "rgba(14, 165, 233, 0.08)", text: "#0ea5e9" };
      case "Operations": return { bg: "rgba(244, 63, 94, 0.08)", text: "#f43f5e" };
      default: return { bg: "rgba(16, 185, 129, 0.08)", text: "#10b981" };
    }
  };

  const renderCard = (task) => {
    const catStyle = getCategoryStyle(task.category);
    return (
      <div 
        key={task.id}
        style={{
          padding: "16px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "transform 0.2s"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          {/* Title */}
          <span style={{ fontSize: "0.9rem", fontWeight: "500", lineHeight: "1.4" }}>{task.title}</span>
          
          {/* Delete */}
          <button 
            onClick={() => handleDeleteTask(task.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "2px"
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Category Tag */}
          <span style={{
            fontSize: "0.7rem",
            fontWeight: "600",
            padding: "2px 8px",
            borderRadius: "100px",
            background: catStyle.bg,
            color: catStyle.text,
            border: `1px solid ${catStyle.text}20`
          }}>
            {task.category}
          </span>

          {/* Movement Actions */}
          <div style={{ display: "flex", gap: "4px" }}>
            {task.status === "in_progress" && (
              <button 
                onClick={() => handleMoveTask(task.id, "todo")}
                className="btn-secondary"
                style={{ padding: "4px 8px", fontSize: "0.75rem", borderRadius: "6px" }}
                title="Move to To Do"
              >
                ←
              </button>
            )}
            {task.status === "todo" && (
              <button 
                onClick={() => handleMoveTask(task.id, "in_progress")}
                className="btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                Start <ArrowRight size={10} />
              </button>
            )}
            {task.status === "in_progress" && (
              <button 
                onClick={() => handleMoveTask(task.id, "done")}
                className="btn-primary"
                style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                Complete <Check size={10} />
              </button>
            )}
            {task.status === "done" && (
              <button 
                onClick={() => handleMoveTask(task.id, "in_progress")}
                className="btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px" }}
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

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

      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", marginBottom: "32px" }}>Backstage Planning Board</h1>

      {/* Task Creator Section */}
      <section className="glass-panel" style={{ padding: "24px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <ListTodo size={16} color="var(--accent-gold)" /> Add Preparation Task
        </h3>

        <form onSubmit={handleCreateTask} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "250px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Schedule rehearsal with sound engineer..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="glass-input"
              style={{ fontSize: "0.85rem", padding: "10px 14px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "180px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Category</label>
            <select 
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              className="glass-input"
              style={{ fontSize: "0.85rem", background: "var(--bg-secondary)", cursor: "pointer" }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ height: "43px", padding: "0 24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={16} /> Add Task
          </button>
        </form>
      </section>

      {/* Kanban Board Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* Column 1: To Do */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "450px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e" }}></span>
              To Do
            </span>
            <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "20px", color: "var(--text-muted)" }}>
              {todoTasks.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {todoTasks.map(renderCard)}
            {todoTasks.length === 0 && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
                All clear! No tasks in backlog.
              </span>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "450px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-gold)" }}></span>
              In Progress
            </span>
            <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "20px", color: "var(--text-muted)" }}>
              {inProgressTasks.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {inProgressTasks.map(renderCard)}
            {inProgressTasks.length === 0 && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
                No active backstage tasks.
              </span>
            )}
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "450px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "10px" }}>
            <span style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
              Completed
            </span>
            <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "20px", color: "var(--text-muted)" }}>
              {doneTasks.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {doneTasks.map(renderCard)}
            {doneTasks.length === 0 && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
                No tasks checked off yet.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Bottom info section */}
      <div style={{
        marginTop: "32px",
        padding: "16px",
        borderRadius: "12px",
        background: "rgba(212, 175, 55, 0.03)",
        border: "1px solid rgba(212, 175, 55, 0.15)",
        display: "flex",
        gap: "12px",
        alignItems: "center"
      }}>
        <Sparkles size={16} color="var(--accent-gold)" />
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <strong>Backstage Planner:</strong> This Kanban board is stored locally on your machine and helps you stay aligned on tasks before gates open.
        </span>
      </div>

    </main>
  );
}
