import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import ShareModal from "./components/ShareModal";
import PersonaBubble from "./components/PersonaBubble";
import {
  listDocuments, getDocument, createDocument, renameDocument, deleteDocument,
} from "./api";

const SEED_USERS = [
  { id: 1, name: "Alice", email: "alice@ajaia.com", avatar_color: "#7C3AED" },
  { id: 2, name: "Bob",   email: "bob@ajaia.com",   avatar_color: "#0D9488" },
  { id: 3, name: "Carol", email: "carol@ajaia.com", avatar_color: "#DC2626" },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(SEED_USERS[0]);
  const [docs, setDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    loadDocs();
    setActiveDoc(null);
  }, [currentUser.id]); // eslint-disable-line

  async function loadDocs() {
    const list = await listDocuments(currentUser.id).catch(() => []);
    setDocs(list);
  }

  async function handleSelect(docId) {
    const doc = await getDocument(docId, currentUser.id).catch(() => null);
    if (doc) setActiveDoc(doc);
  }

  async function handleNew() {
    const doc = await createDocument(currentUser.id);
    setDocs((prev) => [{ ...doc, is_owner: true, is_shared: false }, ...prev]);
    setActiveDoc(doc);
  }

  function handleUploaded(doc) {
    setDocs((prev) => [{ ...doc, is_owner: true, is_shared: false }, ...prev]);
    setActiveDoc(doc);
  }

  async function handleDelete(docId) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    await deleteDocument(docId, currentUser.id).catch(() => {});
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    if (activeDoc?.id === docId) setActiveDoc(null);
  }

  function handleSaved(updatedDoc) {
    setSaving(true);
    setSaveMsg("Saved");
    setActiveDoc(updatedDoc);
    setDocs((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? { ...d, title: updatedDoc.title, updated_at: updatedDoc.updated_at } : d))
    );
    setTimeout(() => { setSaving(false); setSaveMsg(""); }, 1500);
  }

  async function handleRenameSubmit() {
    if (!activeDoc || !titleDraft.trim()) { setEditingTitle(false); return; }
    try {
      const updated = await renameDocument(activeDoc.id, currentUser.id, titleDraft.trim());
      setActiveDoc(updated);
      setDocs((prev) => prev.map((d) => (d.id === updated.id ? { ...d, title: updated.title } : d)));
    } catch (err) {
      alert(err.message);
    }
    setEditingTitle(false);
  }

  const isOwner = activeDoc?.owner_id === currentUser.id;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        docs={docs}
        activeDocId={activeDoc?.id}
        currentUser={currentUser}
        onSelect={handleSelect}
        onNew={handleNew}
        onUploaded={handleUploaded}
        onDelete={handleDelete}
        onRestored={loadDocs}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header
          style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
            borderBottom: "1px solid var(--border)", background: "var(--bg-surface)",
            minHeight: 52,
          }}
        >
          {activeDoc ? (
            editingTitle && isOwner ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => { if (e.key === "Enter") handleRenameSubmit(); if (e.key === "Escape") setEditingTitle(false); }}
                style={{
                  flex: 1, fontSize: 16, fontWeight: 600, border: "none",
                  borderBottom: "2px solid var(--accent)", background: "transparent",
                  color: "var(--text-primary)", outline: "none", padding: "2px 0",
                }}
              />
            ) : (
              <span
                onClick={() => { if (isOwner) { setTitleDraft(activeDoc.title); setEditingTitle(true); } }}
                title={isOwner ? "Click to rename" : ""}
                style={{
                  flex: 1, fontSize: 16, fontWeight: 600,
                  cursor: isOwner ? "text" : "default",
                  color: "var(--text-primary)",
                }}
              >
                {activeDoc.title}
              </span>
            )
          ) : (
            <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: "var(--text-muted)" }}>
              Ajaia Docs
            </span>
          )}

          {saveMsg && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{saveMsg}</span>
          )}

          {activeDoc && (
            <>
              {!isOwner && (
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#0D948820", color: "#0D9488", fontWeight: 600 }}>
                  shared with you
                </span>
              )}
              {isOwner && (
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#7C3AED20", color: "#7C3AED", fontWeight: 600 }}>
                  owner
                </span>
              )}
              <button className="btn-secondary" onClick={() => setShowShare(true)}>
                Share
              </button>
            </>
          )}

          <div style={{ marginLeft: 8 }}>
            <PersonaBubble
              users={SEED_USERS}
              currentUser={currentUser}
              onSwitch={(u) => setCurrentUser(u)}
            />
          </div>
        </header>

        <Editor
          doc={activeDoc}
          currentUser={currentUser}
          onSaved={handleSaved}
        />
      </div>

      {showShare && activeDoc && (
        <ShareModal
          doc={activeDoc}
          currentUser={currentUser}
          allUsers={SEED_USERS}
          onClose={() => setShowShare(false)}
          onUpdated={loadDocs}
        />
      )}
    </div>
  );
}
