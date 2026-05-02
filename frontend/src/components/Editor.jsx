import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef } from "react";
import Toolbar from "./Toolbar";
import { saveDocument } from "../api";

export default function Editor({ doc, currentUser, onSaved }) {
  const saveTimer = useRef(null);
  const docRef = useRef(doc);
  const userRef = useRef(currentUser);

  useEffect(() => { docRef.current = doc; }, [doc]);
  useEffect(() => { userRef.current = currentUser; }, [currentUser]);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    editable: false,
    onUpdate: ({ editor }) => {
      const current = docRef.current;
      if (!current) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const html = editor.getHTML();
        try {
          const updated = await saveDocument(current.id, userRef.current.id, html);
          onSaved(updated);
        } catch (e) {
          console.error("Autosave failed", e);
        }
      }, 1500);
    },
  });

  useEffect(() => {
    if (!editor) return;
    clearTimeout(saveTimer.current);
    if (doc) {
      editor.commands.setContent(doc.content || "");
      editor.setEditable(true);
    } else {
      editor.commands.setContent("");
      editor.setEditable(false);
    }
  }, [doc?.id, editor]); // eslint-disable-line

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {editor && doc && <Toolbar editor={editor} />}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px 60px",
          background: "var(--bg-primary)",
        }}
      >
        {doc ? (
          <EditorContent editor={editor} className="prose-editor" />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-muted)",
              gap: 12,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p style={{ fontSize: 15 }}>Select a document or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
