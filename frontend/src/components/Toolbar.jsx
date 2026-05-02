const TOOLS = [
  { label: "B",      style: { fontWeight: 700 },      action: (e) => e.chain().focus().toggleBold().run(),                isActive: (e) => e.isActive("bold") },
  { label: "I",      style: { fontStyle: "italic" },   action: (e) => e.chain().focus().toggleItalic().run(),              isActive: (e) => e.isActive("italic") },
  { label: "U",      style: { textDecoration: "underline" }, action: (e) => e.chain().focus().toggleUnderline().run(),     isActive: (e) => e.isActive("underline") },
  { label: "H1",     style: {},                         action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(), isActive: (e) => e.isActive("heading", { level: 1 }) },
  { label: "H2",     style: {},                         action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (e) => e.isActive("heading", { level: 2 }) },
  { label: "H3",     style: {},                         action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (e) => e.isActive("heading", { level: 3 }) },
  { label: "• List", style: {},                         action: (e) => e.chain().focus().toggleBulletList().run(),          isActive: (e) => e.isActive("bulletList") },
  { label: "1. List",style: {},                         action: (e) => e.chain().focus().toggleOrderedList().run(),         isActive: (e) => e.isActive("orderedList") },
  { label: "Quote",  style: {},                         action: (e) => e.chain().focus().toggleBlockquote().run(),          isActive: (e) => e.isActive("blockquote") },
];

export default function Toolbar({ editor }) {
  if (!editor) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "6px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        flexWrap: "wrap",
      }}
    >
      {TOOLS.map(({ label, style, action, isActive }) => {
        const active = isActive(editor);
        return (
          <button
            key={label}
            onMouseDown={(e) => { e.preventDefault(); action(editor); }}
            title={label}
            style={{
              padding: "4px 10px",
              border: "1px solid var(--border)",
              borderRadius: 4,
              background: active ? "var(--accent)" : "transparent",
              color: active ? "#fff" : "var(--text-primary)",
              cursor: "pointer",
              fontSize: 13,
              minWidth: 32,
              ...style,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
