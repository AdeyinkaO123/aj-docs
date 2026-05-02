import { useEffect, useState } from "react";
import { getSharedUsers, grantAccess, revokeAccess } from "../api";

export default function ShareModal({ doc, currentUser, allUsers, onClose, onUpdated }) {
  const [sharedWith, setSharedWith] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner] = useState(doc.owner_id === currentUser.id);

  useEffect(() => {
    if (!isOwner) { setLoading(false); return; }
    loadShared();
  }, [doc.id]); // eslint-disable-line

  async function loadShared() {
    setLoading(true);
    try {
      const users = await getSharedUsers(doc.id, currentUser.id);
      setSharedWith(users);
    } catch {
      setSharedWith([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleGrant(targetUserId) {
    await grantAccess(doc.id, currentUser.id, targetUserId).catch(() => {});
    await loadShared();
    onUpdated();
  }

  async function handleRevoke(targetUserId) {
    await revokeAccess(doc.id, currentUser.id, targetUserId).catch(() => {});
    await loadShared();
    onUpdated();
  }

  const sharedIds = sharedWith.map((u) => u.id);
  const others = allUsers.filter((u) => u.id !== currentUser.id);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--bg-surface)", borderRadius: 10, padding: 28,
          width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, color: "var(--text-primary)", fontWeight: 600 }}>
            Share "{doc.title}"
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text-muted)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {!isOwner ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Only the document owner can manage sharing.
          </p>
        ) : loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {others.map((user) => {
              const hasAccess = sharedIds.includes(user.id);
              return (
                <div key={user.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: user.avatar_color, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 14,
                    }}
                  >
                    {user.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.email}</div>
                  </div>
                  <button
                    onClick={() => hasAccess ? handleRevoke(user.id) : handleGrant(user.id)}
                    className={hasAccess ? "btn-secondary" : "btn-primary"}
                    style={{ fontSize: 12, padding: "4px 12px", flexShrink: 0 }}
                  >
                    {hasAccess ? "Revoke" : "Share"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
