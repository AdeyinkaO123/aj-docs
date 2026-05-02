const BASE = "/api";

export async function listDocuments(userId) {
  const res = await fetch(`${BASE}/documents/?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to list documents");
  return res.json();
}

export async function getDocument(docId, userId) {
  const res = await fetch(`${BASE}/documents/${docId}?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to get document");
  return res.json();
}

export async function createDocument(userId) {
  const res = await fetch(`${BASE}/documents/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ owner_id: userId, title: "Untitled Document", content: "" }),
  });
  if (!res.ok) throw new Error("Failed to create document");
  return res.json();
}

export async function saveDocument(docId, userId, content, title) {
  const res = await fetch(`${BASE}/documents/${docId}/save?user_id=${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, title }),
  });
  if (!res.ok) throw new Error("Failed to save document");
  return res.json();
}

export async function renameDocument(docId, userId, title) {
  const res = await fetch(`${BASE}/documents/${docId}/rename?user_id=${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to rename document");
  }
  return res.json();
}

export async function deleteDocument(docId, userId) {
  const res = await fetch(`${BASE}/documents/${docId}?user_id=${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete document");
  return res.json();
}

export async function uploadFile(userId, file) {
  const form = new FormData();
  form.append("user_id", userId);
  form.append("file", file);
  const res = await fetch(`${BASE}/upload/`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function getSharedUsers(docId, userId) {
  const res = await fetch(`${BASE}/sharing/${docId}/access?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to get shared users");
  return res.json();
}

export async function grantAccess(docId, userId, targetUserId) {
  const res = await fetch(
    `${BASE}/sharing/${docId}/access?user_id=${userId}&target_user_id=${targetUserId}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to grant access");
  return res.json();
}

export async function revokeAccess(docId, userId, targetUserId) {
  const res = await fetch(
    `${BASE}/sharing/${docId}/access/${targetUserId}?user_id=${userId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to revoke access");
  return res.json();
}

export async function getTrashDocuments(userId) {
  const res = await fetch(`${BASE}/trash/?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to load trash");
  return res.json();
}

export async function restoreDocument(docId, userId) {
  const res = await fetch(`${BASE}/trash/${docId}/restore?user_id=${userId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore document");
  return res.json();
}

export async function permanentlyDeleteDocument(docId, userId) {
  const res = await fetch(`${BASE}/trash/${docId}?user_id=${userId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to permanently delete document");
  return res.json();
}
