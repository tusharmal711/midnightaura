import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { API } from "../../api";
import { createPortal } from "react-dom";
// ── Get email from localStorage or cookies ─────────────────────────
function getStoredEmail() {
  try {
    const fromStorage = localStorage.getItem("user");
    if (fromStorage) {
      const parsed = JSON.parse(fromStorage);
      if (parsed?.email) return parsed.email;
    }
  } catch (_) {}
  try {
    const fromCookie = Cookies.get("user");
    if (fromCookie) {
      const parsed = JSON.parse(fromCookie);
      if (parsed?.email) return parsed.email;
    }
  } catch (_) {}
  return null;
}

// ── Toast notification ─────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  // ✅ renders directly into document.body, escaping any parent stacking context
  return createPortal(
    <div className="toast-container" style={{
      position: "fixed",
      top: "2rem",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      padding: "0.75rem 1.25rem",
      borderRadius: "12px",
      fontSize: "0.85rem",
      fontWeight: 600,
      backdropFilter: "blur(16px)",
      animation: "slideDown 0.3s ease",
      background: type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
      border: type === "success" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(239,68,68,0.4)",
      color: type === "success" ? "#6ee7b7" : "#fca5a5",
      boxShadow: type === "success" ? "0 4px 24px rgba(16,185,129,0.2)" : "0 4px 24px rgba(239,68,68,0.2)",
    }}>
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {message}
      <style>{`
        .toast-container { right: 2rem; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .toast-container {
            right: unset;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        }
      `}</style>
    </div>,
    document.body  // ✅ mounted directly on body, no parent z-index trapping
  );
}

// ── Skeleton loader ────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ animation: "pulse 1.6s ease infinite" }}>
      {[1, 2].map((s) => (
        <div
          key={s}
          style={{
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ width: "80px", height: "12px", borderRadius: "6px", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ width: "56px", height: "28px", borderRadius: "999px", background: "rgba(255,255,255,0.06)" }} />
          </div>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div style={{ width: "60px", height: "10px", borderRadius: "4px", background: "rgba(255,255,255,0.07)", marginBottom: "8px" }} />
                <div style={{ height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)" }} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.55} }`}</style>
    </div>
  );
}

// ── Reusable editable section ──────────────────────────────────────
function EditableSection({ title, fields, initialValues, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    if (!editing) setValues(initialValues);
  }, [initialValues, editing]);

  const handleSave = async () => {
    const result = await onSave(values);
    if (result !== false) setEditing(false);
  };

  const handleCancel = () => {
    setValues(initialValues);
    setEditing(false);
  };

  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "border-color 0.2s",
        ...(editing && { borderColor: "rgba(139,92,246,0.3)" }),
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h3
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.38)",
            margin: 0,
          }}
        >
          {title}
        </h3>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.35rem 1rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              background: "rgba(139,92,246,0.14)",
              border: "1px solid rgba(139,92,246,0.32)",
              color: "#c4b5fd",
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.26)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.14)")}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding: "0.35rem 1rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
                opacity: saving ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 1.1rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                background: saving ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#7c3aed,#6d28d9)",
                border: "1px solid rgba(139,92,246,0.5)",
                color: "#fff",
                boxShadow: "0 2px 14px rgba(124,58,237,0.4)",
                transition: "opacity 0.18s",
              }}
            >
              {saving && (
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "spin 0.75s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </svg>
              )}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {fields.map((field) => {
          // ── Email field is always read-only with a lock badge ──
          const isEmailField = field.key === "email";

          return field.type === "radio" ? (
            <div key={field.key} style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.72rem", marginBottom: "0.6rem", color: "rgba(255,255,255,0.42)" }}>
                {field.label}
              </label>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                {field.options.map((opt) => (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: editing ? "pointer" : "default",
                      fontSize: "0.85rem",
                      color: editing ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                    }}
                  >
  <input
  type="radio"
  name={`${title}-${field.key}`}
  value={opt}
  checked={values[field.key] === opt}
  onChange={(e) => {
    if (!editing) return;
    setValues((v) => ({ ...v, [field.key]: e.target.value }));
  }}
  style={{
    appearance: "none",
    WebkitAppearance: "none",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: values[field.key] === opt
      ? "5px solid #7c3aed"
      : "2px solid rgba(255,255,255,0.5)",
    background: "#fff",
    cursor: editing ? "pointer" : "default",
    transition: "all 0.2s ease",
    pointerEvents: editing ? "auto" : "none",
  }}
/>
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div key={field.key}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.72rem",
                  marginBottom: "0.5rem",
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                {field.label}
                {/* Lock badge for email */}
                {isEmailField && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.1rem 0.45rem",
                      borderRadius: "999px",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    locked
                  </span>
                )}
              </label>
              <input
                type={field.type ?? "text"}
                value={values[field.key] ?? ""}
                onChange={(e) => {
                  if (isEmailField) return; // email never editable
                  setValues((v) => ({ ...v, [field.key]: e.target.value }));
                }}
                readOnly={!editing || isEmailField}
                placeholder={editing && !isEmailField ? (field.placeholder ?? "") : "—"}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  // Email always looks "locked" regardless of edit mode
                  background: isEmailField
                    ? "rgba(255,255,255,0.03)"
                    : editing
                    ? "rgba(139,92,246,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: isEmailField
                    ? "1px solid rgba(255,255,255,0.05)"
                    : editing
                    ? "1px solid rgba(139,92,246,0.42)"
                    : "1px solid rgba(255,255,255,0.07)",
                  color: isEmailField ? "rgba(255,255,255,0.35)" : editing ? "#e9d5ff" : "rgba(255,255,255,0.65)",
                  caretColor: "#a78bfa",
                  cursor: isEmailField ? "not-allowed" : "auto",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function ProfileDetails() {
  const [profileData, setProfileData]   = useState(null);
  const [addressData, setAddressData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [toast, setToast]               = useState(null);

  // ── Read email once on mount ──────────────────────────────────────
  const email = getStoredEmail();

  const showToast = (message, type = "success") => setToast({ message, type });

  // ── Fetch profile + address ───────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!email) {
      showToast("Session expired. Please log in again.", "error");
      return;
    }
    try {
      setLoading(true);
      // Pass email in body so backend can identify the user
      const res = await API.post("/user/getProfile", { email });
      if (res.data.success) {
        const u = res.data.user;
        const a = res.data.address ?? {};
        setProfileData({
          username: u.username ?? "",
          email:    u.email    ?? email,   // always use stored email as fallback
          phone:    u.phone    ?? "",
          altPhone: u.altPhone ?? "",
          gender:   u.gender   ?? "Prefer not to say",
        });
        setAddressData({
          addressLine1: a.addressLine1 ?? "",
          addressLine2: a.addressLine2 ?? "",
          city:         a.city         ?? "",
          district:     a.district     ?? "",
          state:        a.state        ?? "",
          pincode:      a.pincode      ?? "",
          country:      a.country      ?? "India",
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save basic info (email sent but never updated) ────────────────
  const handleSaveProfile = async (values) => {
    if (!email) return showToast("Session expired. Please log in again.", "error");
    try {
      setSavingProfile(true);
      const res = await API.post("/user/updateProfile", {
        email,                  // ← always from localStorage/cookie
        username: values.username,
        phone:    values.phone,
        altPhone: values.altPhone,
        gender:   values.gender,
      });
      if (res.data.success) {
        const u = res.data.user;
        setProfileData({
          username: u.username ?? "",
          email:    u.email    ?? email,
          phone:    u.phone    ?? "",
          altPhone: u.altPhone ?? "",
          gender:   u.gender   ?? "Prefer not to say",
        });
        showToast("Profile updated successfully 🎉");
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save delivery address ─────────────────────────────────────────
  const handleSaveAddress = async (values) => {
    if (!email) return showToast("Session expired. Please log in again.", "error");
    try {
      setSavingAddress(true);
      const res = await API.post("/user/updateAddress", {
        email,                  // ← always from localStorage/cookie
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city:         values.city,
        district:     values.district,
        state:        values.state,
        pincode:      values.pincode,
        country:      values.country,
      });
      if (res.data.success) {
        const a = res.data.address;
        setAddressData({
          addressLine1: a.addressLine1 ?? "",
          addressLine2: a.addressLine2 ?? "",
          city:         a.city         ?? "",
          district:     a.district     ?? "",
          state:        a.state        ?? "",
          pincode:      a.pincode      ?? "",
          country:      a.country      ?? "India",
        });
        showToast("Address updated successfully 🎉");
        return true;
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update address", "error");
      return false;
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
          Personal Information
        </h2>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.38)", margin: "0.35rem 0 0" }}>
          Manage your profile details and delivery address
        </p>
      </div>

      {/* No session warning */}
      {!email && !loading && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}
        >
          ⚠️ No session found. Please <a href="/login" style={{ color: "#f87171", textDecoration: "underline" }}>log in</a> again.
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <>
          {profileData && (
            <EditableSection
              title="Basic Info"
              initialValues={profileData}
              saving={savingProfile}
              onSave={handleSaveProfile}
              fields={[
                { key: "username", label: "Username" },
                { key: "email",    label: "Email Address", type: "email" }, // rendered locked
                { key: "phone",    label: "Phone Number",  type: "tel" },
                { key: "altPhone", label: "Alternative Phone", type: "tel" },
                {
                  key: "gender",
                  label: "Your Gender",
                  type: "radio",
                  options: ["Male", "Female", "Prefer not to say"],
                },
              ]}
            />
          )}

          {addressData && (
            <EditableSection
              title="Delivery Address"
              initialValues={addressData}
              saving={savingAddress}
              onSave={handleSaveAddress}
              fields={[
                { key: "addressLine1", label: "Address Line 1",            placeholder: "Street / flat / building" },
                { key: "addressLine2", label: "Address Line 2 (optional)",  placeholder: "Area / landmark" },
                { key: "city",         label: "City" },
                { key: "district",         label: "District" },
                { key: "state",        label: "State" },
                { key: "pincode",      label: "PIN Code" },
                { key: "country",      label: "Country" },
              ]}
            />
          )}
        </>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}