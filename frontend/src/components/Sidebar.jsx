import { useRef, useState } from "react";
import { uploadFile, getTrashDocuments, restoreDocument, permanentlyDeleteDocument } from "../api";

function DocIcon() {
  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
      <rect width="28" height="34" rx="2" fill="#e8eaed" />
      <path d="M18 0v8h8" fill="none" stroke="#bdc1c6" strokeWidth="1" />
      <path d="M18 0l8 8H18V0z" fill="#bdc1c6" />
      <rect x="5" y="13" width="18" height="2" rx="1" fill="#9aa0a6" />
      <rect x="5" y="18" width="18" height="2" rx="1" fill="#9aa0a6" />
      <rect x="5" y="23" width="12" height="2" rx="1" fill="#9aa0a6" />
    </svg>
  );
}

export default function Sidebar({ docs, activeDocId, currentUser, onSelect, onNew, onUploaded, onDelete, onRestored }) {
  const fileRef = useRef();
  const [hoveredNew, setHoveredNew] = useState(false);
  const [hoveredUpload, setHoveredUpload] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashDocs, setTrashDocs] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);

  async function toggleTrash() {
    if (trashOpen) { setTrashOpen(false); return; }
    setTrashOpen(true);
    setTrashLoading(true);
    try {
      const docs = await getTrashDocuments(currentUser.id);
      setTrashDocs(docs);
    } finally {
      setTrashLoading(false);
    }
  }

  async function handleRestore(docId) {
    await restoreDocument(docId, currentUser.id).catch(() => {});
    setTrashDocs((prev) => prev.filter((d) => d.id !== docId));
    onRestored();
  }

  async function handlePermanentDelete(docId) {
    if (!confirm("Permanently delete this document? It cannot be recovered.")) return;
    await permanentlyDeleteDocument(docId, currentUser.id).catch(() => {});
    setTrashDocs((prev) => prev.filter((d) => d.id !== docId));
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const doc = await uploadFile(currentUser.id, file);
      onUploaded(doc);
    } catch (err) {
      alert(err.message);
    } finally {
      e.target.value = "";
    }
  }

  const cardBase = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "18px 8px 14px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <aside
      style={{
        width: 280,
        display: "flex",
        flexDirection: "column",
        background: "#f8f9fa",
        borderRight: "1px solid var(--border)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 16px 12px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect width="20" height="20" rx="3" fill="#4285f4" />
          <rect x="4" y="6" width="12" height="1.5" rx="0.75" fill="white" />
          <rect x="4" y="9.25" width="12" height="1.5" rx="0.75" fill="white" />
          <rect x="4" y="12.5" width="8" height="1.5" rx="0.75" fill="white" />
        </svg>
        <span style={{ fontWeight: 600, fontSize: 16, color: "#202124", letterSpacing: "-0.01em" }}>
          Ajaia Docs
        </span>
      </div>

      {/* Action cards */}
      <div style={{ padding: "0 12px 16px", display: "flex", gap: 10 }}>
        {/* New document card */}
        <button
          onClick={onNew}
          onMouseEnter={() => setHoveredNew(true)}
          onMouseLeave={() => setHoveredNew(false)}
          style={{
            ...cardBase,
            borderColor: hoveredNew ? "#4285f4" : "var(--border)",
            boxShadow: hoveredNew ? "0 1px 6px rgba(66,133,244,0.2)" : "none",
          }}
        >
          {/* Blank page with + overlay */}
          <div style={{ position: "relative", width: 28, height: 34 }}>
            <DocIcon />
            <div style={{
              position: "absolute", bottom: -6, right: -6,
              width: 16, height: 16, borderRadius: "50%",
              background: "#4285f4",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 700, lineHeight: 1,
            }}>
              +
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#5f6368", fontWeight: 500, textAlign: "center" }}>
            New document
          </span>
        </button>

        {/* Upload card */}
        <button
          onClick={() => fileRef.current.click()}
          onMouseEnter={() => setHoveredUpload(true)}
          onMouseLeave={() => setHoveredUpload(false)}
          style={{
            ...cardBase,
            borderColor: hoveredUpload ? "#4285f4" : "var(--border)",
            boxShadow: hoveredUpload ? "0 1px 6px rgba(66,133,244,0.2)" : "none",
          }}
        >
          <div style={{
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 12 15 15" />
            </svg>
          </div>
          <span style={{ fontSize: 11, color: "#5f6368", fontWeight: 500, textAlign: "center" }}>
            Upload file
          </span>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.docx"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* Divider + section header */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "10px 16px 4px" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#5f6368", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Recent documents
        </span>
      </div>

      {/* Document list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0 8px" }}>
        {docs.length === 0 && (
          <p style={{ padding: "12px 16px", color: "#9aa0a6", fontSize: 13 }}>
            No documents yet
          </p>
        )}
        {docs.map((doc) => {
          const isActive = activeDocId === doc.id;
          return (
            <div
              key={doc.id}
              className="doc-row"
              onClick={() => onSelect(doc.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 16px",
                cursor: "pointer",
                background: isActive ? "#e8f0fe" : "transparent",
                borderRadius: isActive ? 0 : 0,
                borderLeft: isActive ? "3px solid #4285f4" : "3px solid transparent",
              }}
            >
              {/* Mini doc icon */}
              <svg width="14" height="18" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0 }}>
                <rect width="14" height="18" rx="1.5" fill={isActive ? "#c5d8fd" : "#e8eaed"} />
                <path d="M9 0v4.5h4.5" fill="none" stroke={isActive ? "#93b8fb" : "#bdc1c6"} strokeWidth="0.75" />
                <rect x="2.5" y="7" width="9" height="1" rx="0.5" fill={isActive ? "#4285f4" : "#9aa0a6"} />
                <rect x="2.5" y="9.5" width="9" height="1" rx="0.5" fill={isActive ? "#4285f4" : "#9aa0a6"} />
                <rect x="2.5" y="12" width="6" height="1" rx="0.5" fill={isActive ? "#4285f4" : "#9aa0a6"} />
              </svg>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#1a73e8" : "#202124",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {doc.title}
                </div>
                {doc.is_shared && !doc.is_owner && (
                  <div style={{ fontSize: 10, color: "#9aa0a6", marginTop: 1 }}>shared with you</div>
                )}
              </div>

              {doc.is_owner && (
                <button
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9aa0a6",
                    fontSize: 16,
                    padding: "0 2px",
                    lineHeight: 1,
                    opacity: 0,
                    transition: "opacity 0.15s",
                    flexShrink: 0,
                  }}
                  title="Delete"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>
      {/* Trash section */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {/* Collapsible trash items */}
        {trashOpen && (
          <div style={{ maxHeight: 220, overflowY: "auto", background: "#fff8f8" }}>
            {trashLoading && (
              <p style={{ padding: "10px 16px", fontSize: 12, color: "#9aa0a6" }}>Loading…</p>
            )}
            {!trashLoading && trashDocs.length === 0 && (
              <p style={{ padding: "10px 16px", fontSize: 12, color: "#9aa0a6" }}>Trash is empty</p>
            )}
            {!trashLoading && trashDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "7px 14px 7px 16px",
                  borderBottom: "1px solid #fde8e8",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, color: "#5f6368",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {doc.title}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(doc.id)}
                  title="Restore"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, color: "#1a73e8", fontWeight: 600, padding: "2px 4px",
                    flexShrink: 0,
                  }}
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(doc.id)}
                  title="Delete forever"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, color: "#9aa0a6", padding: "2px 2px",
                    flexShrink: 0, lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Trash toggle row */}
        <button
          onClick={toggleTrash}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "11px 16px",
            background: trashOpen ? "#fde8e8" : "transparent",
            border: "none", cursor: "pointer", textAlign: "left",
            color: trashOpen ? "#c5221f" : "#5f6368",
            transition: "background 0.15s",
          }}
        >
          {/* Trash can icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={trashOpen ? "#c5221f" : "#9aa0a6"} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Trash</span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="1.5"
            style={{ marginLeft: "auto", transform: trashOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <polyline points="2 4 6 8 10 4" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
