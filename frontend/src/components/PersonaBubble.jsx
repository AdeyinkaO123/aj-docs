import { useState, useEffect, useRef } from "react";

export default function PersonaBubble({ users, currentUser, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        title={`Signed in as ${currentUser.name} (demo)`}
        style={{
          width: 34, height: 34, borderRadius: "50%",
          background: currentUser.avatar_color,
          border: "2px solid white",
          cursor: "pointer",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {currentUser.name[0]}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", right: 0, top: 42, zIndex: 50,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            minWidth: 210,
            overflow: "hidden",
          }}
        >
          <div style={{
            padding: "7px 12px",
            fontSize: 10,
            color: "var(--text-muted)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            borderBottom: "1px solid var(--border)",
            textTransform: "uppercase",
          }}>
            Demo — Switch User
          </div>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => { onSwitch(u); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "9px 12px",
                background: u.id === currentUser.id ? "var(--accent-subtle)" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: u.avatar_color, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 12,
                }}
              >
                {u.name[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: u.id === currentUser.id ? 700 : 500, color: "var(--text-primary)" }}>
                  {u.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
