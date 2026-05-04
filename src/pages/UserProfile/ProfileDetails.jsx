// ProfileDetails.jsx
import { useState } from "react";

// ── Reusable editable field group ──────────────────────────────────
function EditableSection({ title, fields, onSave }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? ""]))
  );
  const [saved, setSaved] = useState({ ...values });

  const handleSave = () => {
    setSaved({ ...values });
    setEditing(false);
    onSave?.(values);
  };

  const handleCancel = () => {
    setValues({ ...saved });
    setEditing(false);
  };

  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
          {title}
        </h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.35)",
              color: "#c4b5fd",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(139,92,246,0.28)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(139,92,246,0.15)";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                border: "1px solid rgba(139,92,246,0.5)",
                color: "#fff",
                boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {fields.map((field) =>
          field.type === "radio" ? (
            <div key={field.key} className="col-span-full">
              <label className="block text-xs mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                {field.label}
              </label>
              <div className="flex gap-6">
                {field.options.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                    style={{ color: editing ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)" }}
                  >
                    <input
                      type="radio"
                      name={field.key}
                      value={opt}
                      checked={values[field.key] === opt}
                      onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                      disabled={!editing}
                      style={{ accentColor: "#7c3aed" }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div key={field.key}>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                {field.label}
              </label>
              <input
                type={field.type ?? "text"}
                value={values[field.key]}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                readOnly={!editing}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  background: editing ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.05)",
                  border: editing
                    ? "1px solid rgba(139,92,246,0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: editing ? "#e9d5ff" : "rgba(255,255,255,0.7)",
                  caretColor: "#a78bfa",
                }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function ProfileDetails() {
  return (
    <div>
      {/* Page title */}
      <div className="mb-7">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#fff" }}
        >
          Personal Information
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Manage your profile details and delivery address
        </p>
      </div>

      {/* ── Basic Info ── */}
      <EditableSection
        title="Basic Info"
        fields={[
          { key: "firstName", label: "First Name", defaultValue: "Tushar" },
          { key: "lastName", label: "Last Name", defaultValue: "Mal" },
          { key: "email", label: "Email Address", type: "email", defaultValue: "tushar@example.com" },
          { key: "phone", label: "Phone Number", type: "tel", defaultValue: "+91 9876543210" },
          {
            key: "gender",
            label: "Your Gender",
            type: "radio",
            options: ["Male", "Female", "Prefer not to say"],
            defaultValue: "Male",
          },
        ]}
      />

      {/* ── Delivery Address ── */}
      <EditableSection
        title="Delivery Address"
        fields={[
          { key: "addressLine1", label: "Address Line 1", defaultValue: "" },
          { key: "addressLine2", label: "Address Line 2 (Optional)", defaultValue: "" },
          { key: "city", label: "City", defaultValue: "" },
          { key: "state", label: "State", defaultValue: "" },
          { key: "pincode", label: "PIN Code", defaultValue: "" },
          { key: "country", label: "Country", defaultValue: "India" },
        ]}
      />
    </div>
  );
}