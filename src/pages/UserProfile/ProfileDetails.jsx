import { useState, useEffect, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import { API } from "../../api";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
// ── Google Maps loader ─────────────────────────────────────────────
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) return resolve(window.google.maps);
    if (document.getElementById("gmap-script")) {
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(check);
          resolve(window.google.maps);
        }
      }, 100);
      return;
    }
    const s = document.createElement("script");
    s.id = "gmap-script";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      // Small delay to ensure all sub-objects are ready
      setTimeout(() => resolve(window.google.maps), 200);
    };
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

// ── Session email ──────────────────────────────────────────────────
function getStoredEmail() {
  try {
    const p = JSON.parse(localStorage.getItem("user"));
    if (p?.email) return p.email;
  } catch (_) {}
  try {
    const p = JSON.parse(Cookies.get("user"));
    if (p?.email) return p.email;
  } catch (_) {}
  return null;
}

// ── Toast ──────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return createPortal(
    <div
      className="__toast"
      style={{
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
        animation: "toastIn 0.3s ease",
        background:
          type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
        border:
          type === "success"
            ? "1px solid rgba(16,185,129,0.4)"
            : "1px solid rgba(239,68,68,0.4)",
        color: type === "success" ? "#6ee7b7" : "#fca5a5",
        boxShadow:
          type === "success"
            ? "0 4px 24px rgba(16,185,129,0.2)"
            : "0 4px 24px rgba(239,68,68,0.2)",
      }}
    >
      {type === "success" ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {message}
      <style>{`
        .__toast { right: 2rem; }
        @keyframes toastIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
        @media(max-width:600px) { .__toast { right:unset; left:50%; transform:translateX(-50%); white-space:nowrap } }
      `}</style>
    </div>,
    document.body
  );
}

// ── Skeleton ───────────────────────────────────────────────────────
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "12px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                width: "56px",
                height: "28px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div
                  style={{
                    width: "60px",
                    height: "10px",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.07)",
                    marginBottom: "8px",
                  }}
                />
                <div
                  style={{
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}`}</style>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────
function Spin({ size = 12, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      style={{ animation: "spin .75s linear infinite", flexShrink: 0 }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

// ── Map dark styles ────────────────────────────────────────────────
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8892b0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a4a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3a3a6a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f0f23" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

// ── Address Section ────────────────────────────────────────────────
// All map logic lives inside this component so refs & state are co-located.
function AddressSection({ initialValues, initialLocation, saving, onSave }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [pinLoc, setPinLoc] = useState(initialLocation); // {lat,lng,label}|null

  // Map state
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [syncing, setSyncing] = useState(false); // forward geocode in progress

  // Refs
  const mapDivRef = useRef(null);
  const searchInputRef = useRef(null);
  const mapsRef = useRef(null); // google.maps namespace
  const mapRef = useRef(null); // Map instance
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Suppression flags to break the addr↔map feedback loop
  const suppressForwardRef = useRef(false); // map just updated fields, don't re-geocode
  const suppressReverseRef = useRef(false); // fields just updated map, don't re-update fields
  const fwdDebounceRef = useRef(null);
  const mapInitDoneRef = useRef(false);

  // Sync parent data → local state when not editing
  useEffect(() => {
    if (!editing) {
      setValues(initialValues);
      setPinLoc(initialLocation);
    }
  }, [initialValues, initialLocation, editing]);

  // ── Helpers ──────────────────────────────────────────────────────

  const buildAddressString = (v) =>
    [v.addressLine1, v.addressLine2, v.city, v.district, v.state, v.pincode, v.country]
      .filter(Boolean)
      .join(", ");

  const getGeocoder = () => {
    if (!geocoderRef.current && mapsRef.current)
      geocoderRef.current = new mapsRef.current.Geocoder();
    return geocoderRef.current;
  };

  // Place or move the marker
  const placeMarker = useCallback((lat, lng) => {
    if (!mapsRef.current || !mapRef.current) return;
    const pos = { lat, lng };
    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    } else {
      markerRef.current = new mapsRef.current.Marker({
        position: pos,
        map: mapRef.current,
        draggable: true,
        animation: mapsRef.current.Animation.DROP,
        icon: {
          path: mapsRef.current.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: "#7c3aed",
          fillOpacity: 1,
          strokeColor: "#c4b5fd",
          strokeWeight: 2.5,
        },
      });
      markerRef.current.addListener("dragend", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        reverseGeocode(lat, lng, true);
      });
    }
    markerRef.current.setDraggable(editing);
  }, [editing]); // eslint-disable-line

  // Reverse geocode: coords → label + (optionally) fill address fields
  const reverseGeocode = useCallback(
    (lat, lng, fillFields = false) => {
      const gc = getGeocoder();
      if (!gc) return;
      gc.geocode({ location: { lat, lng } }, (results, status) => {
        const label =
          status === "OK" && results?.[0]
            ? results[0].formatted_address
            : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        const newPin = {
          lat: String(lat),
          lng: String(lng),
          label,
        };
        setPinLoc(newPin);

        if (fillFields && results?.[0]) {
          suppressForwardRef.current = true; // don't re-geocode from field changes
          const comps = results[0].address_components;
          const get = (type) =>
            comps.find((c) => c.types.includes(type))?.long_name ?? "";

          setValues((prev) => ({
            ...prev,
            addressLine1:
              [get("street_number"), get("route")].filter(Boolean).join(" ") ||
              prev.addressLine1,
            city:
              get("locality") ||
              get("administrative_area_level_3") ||
              prev.city,
            district:
              get("administrative_area_level_2") || prev.district,
            state: get("administrative_area_level_1") || prev.state,
            pincode: get("postal_code") || prev.pincode,
            country: get("country") || prev.country,
          }));

          // Release suppression after React has re-rendered
          setTimeout(() => {
            suppressForwardRef.current = false;
          }, 800);
        }
      });
    },
    [] // stable — uses setValues from closure
  );

  // Forward geocode: address string → move map + marker (no field update)
  const forwardGeocode = useCallback(
    (addressStr) => {
      if (!addressStr || !mapRef.current) return;
      const gc = getGeocoder();
      if (!gc) return;

      setSyncing(true);
      gc.geocode({ address: addressStr }, (results, status) => {
        setSyncing(false);
        if (status !== "OK" || !results?.[0]) return;

        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();

        suppressReverseRef.current = true; // placeMarker won't trigger field fill
        mapRef.current.setCenter({ lat, lng });
        mapRef.current.setZoom(16);
        placeMarker(lat, lng);

        // Update pin label without filling fields
        const label = results[0].formatted_address;
        setPinLoc({ lat: String(lat), lng: String(lng), label });

        setTimeout(() => {
          suppressReverseRef.current = false;
        }, 600);
      });
    },
    [placeMarker]
  );

  // ── Initialize map (runs once when the div is available) ─────────
  useEffect(() => {
    if (mapInitDoneRef.current) return;
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapDivRef.current) return;
        mapsRef.current = maps;
        geocoderRef.current = new maps.Geocoder();

        // Determine initial center
        const hasSavedPin =
          initialLocation?.lat && !isNaN(parseFloat(initialLocation.lat));
        const center = hasSavedPin
          ? {
              lat: parseFloat(initialLocation.lat),
              lng: parseFloat(initialLocation.lng),
            }
          : { lat: 20.5937, lng: 78.9629 }; // India center

        const map = new maps.Map(mapDivRef.current, {
          center,
          zoom: hasSavedPin ? 16 : 5,
          disableDefaultUI: true,
          zoomControl: true,
          styles: MAP_STYLES,
        });
        mapRef.current = map;

        // Restore saved pin
        if (hasSavedPin) {
          placeMarker(parseFloat(initialLocation.lat), parseFloat(initialLocation.lng));
        }

        // Click to drop pin (edit mode only)
        map.addListener("click", (e) => {
          if (!editing) return; // guard checked at event time via closure below
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          placeMarker(lat, lng);
          if (!suppressReverseRef.current) {
            reverseGeocode(lat, lng, true);
          }
        });

        // Search box
        if (searchInputRef.current) {
          const sb = new maps.places.SearchBox(searchInputRef.current);
          searchBoxRef.current = sb;
          map.addListener("bounds_changed", () => {
            if (mapRef.current) sb.setBounds(mapRef.current.getBounds());
          });
          sb.addListener("places_changed", () => {
            const places = sb.getPlaces();
            if (!places?.length) return;
            const place = places[0];
            if (!place.geometry?.location) return;
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.setCenter({ lat, lng });
            map.setZoom(17);
            placeMarker(lat, lng);
            if (!suppressReverseRef.current) {
              reverseGeocode(lat, lng, true);
            }
          });
        }

        mapInitDoneRef.current = true;
        setMapReady(true);

        // If no saved pin but address fields exist, forward-geocode them
        if (!hasSavedPin) {
          const addrStr = buildAddressString(initialValues);
          if (addrStr.length > 5) {
            setTimeout(() => forwardGeocode(addrStr), 600);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setMapError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []); // truly once — initialLocation & initialValues captured from closure

  // ── Keep map click handler aware of editing state ─────────────────
  // We can't close over `editing` in the init effect, so we use a ref trick
  const editingRef = useRef(editing);
  useEffect(() => {
    editingRef.current = editing;
    if (markerRef.current)
      markerRef.current.setDraggable(editing);
  }, [editing]);

  // Override the click listener to use editingRef
  useEffect(() => {
    if (!mapRef.current || !mapsRef.current) return;
    const listener = mapRef.current.addListener("click", (e) => {
      if (!editingRef.current) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      placeMarker(lat, lng);
      if (!suppressReverseRef.current) {
        reverseGeocode(lat, lng, true);
      }
    });
    return () => mapsRef.current?.event?.removeListener(listener);
  }, [mapReady, placeMarker, reverseGeocode]);

  // ── Debounced forward geocode when address fields change ──────────
  useEffect(() => {
    if (!editing || !mapReady) return;
    if (suppressForwardRef.current) return; // map just updated fields

    clearTimeout(fwdDebounceRef.current);
    const addrStr = buildAddressString(values);
    if (addrStr.replace(/,\s*/g, "").trim().length < 5) return;

    fwdDebounceRef.current = setTimeout(() => {
      if (!suppressForwardRef.current) {
        forwardGeocode(addrStr);
      }
    }, 900);

    return () => clearTimeout(fwdDebounceRef.current);
  }, [
    values.addressLine1,
    values.addressLine2,
    values.city,
    values.district,
    values.state,
    values.pincode,
    values.country,
    editing,
    mapReady,
    forwardGeocode,
  ]);

  // ── "Use my location" ─────────────────────────────────────────────
  const handleLocateMe = () => {
    if (!mapRef.current) return;
    setLocating(true);

    const onSuccess = (lat, lng) => {
      mapRef.current.setCenter({ lat, lng });
      mapRef.current.setZoom(18);
      placeMarker(lat, lng);
      reverseGeocode(lat, lng, true);
      setLocating(false);
    };

    const onError = (msg) => {
      setLocating(false);
      alert(msg);
    };

    if (!navigator.geolocation) {
      onError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("GPS error:", err.message, "— falling back to IP geolocation");
        // Fallback: IP-based geolocation (no key needed, reasonable accuracy)
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => {
            if (data.latitude && data.longitude) {
              onSuccess(parseFloat(data.latitude), parseFloat(data.longitude));
            } else {
              onError("Could not determine your location.");
            }
          })
          .catch(() => onError("Could not determine your location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ── Save / Cancel ─────────────────────────────────────────────────
  const handleSave = async () => {
    const result = await onSave(values, pinLoc);
    if (result !== false) setEditing(false);
  };

  const handleCancel = () => {
    setValues(initialValues);
    setPinLoc(initialLocation);
    setEditing(false);
  };

  // ── Styles ────────────────────────────────────────────────────────
  const fieldStyle = (active) => ({
    width: "100%",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
    background: active ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.04)",
    border: active
      ? "1px solid rgba(139,92,246,0.42)"
      : "1px solid rgba(255,255,255,0.07)",
    color: active ? "#e9d5ff" : "rgba(255,255,255,0.65)",
    caretColor: "#a78bfa",
  });

  const TEXT_FIELDS = [
    {
      key: "addressLine1",
      label: "Address Line 1",
      placeholder: "Street / flat / building",
    },
    {
      key: "addressLine2",
      label: "Address Line 2 (optional)",
      placeholder: "Area / landmark",
    },
    { key: "city",     label: "City",     placeholder: "City"     },
    { key: "district", label: "District", placeholder: "District" },
    { key: "state",    label: "State",    placeholder: "State"    },
    { key: "pincode",  label: "PIN Code", placeholder: "PIN Code" },
    { key: "country",  label: "Country",  placeholder: "Country"  },
  ];

  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${editing ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`,
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
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
          Delivery Address
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(139,92,246,0.26)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(139,92,246,0.14)")
            }
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
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
                background: saving
                  ? "rgba(124,58,237,0.5)"
                  : "linear-gradient(135deg,#7c3aed,#6d28d9)",
                border: "1px solid rgba(139,92,246,0.5)",
                color: "#fff",
                boxShadow: "0 2px 14px rgba(124,58,237,0.4)",
              }}
            >
              {saving && <Spin size={12} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Text fields */}
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          marginBottom: "1.25rem",
        }}
      >
        {TEXT_FIELDS.map((f) => (
          <div key={f.key}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.72rem",
                marginBottom: "0.5rem",
                color: "rgba(255,255,255,0.42)",
              }}
            >
              {f.label}
              {syncing &&
                ["city", "state", "pincode", "country", "district"].includes(
                  f.key
                ) && (
                  <span style={{ opacity: 0.5 }}>
                    <Spin size={9} />
                  </span>
                )}
            </label>
            <input
              type="text"
              value={values[f.key] ?? ""}
              readOnly={!editing}
              onChange={(e) =>
                editing && setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
              placeholder={editing ? f.placeholder : "—"}
              style={fieldStyle(editing)}
            />
          </div>
        ))}
      </div>

      {/* Map */}
      <div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.72rem",
            marginBottom: "0.6rem",
            color: "rgba(255,255,255,0.42)",
          }}
        >
          Delivery Location on Map
          {syncing && (
            <>
              <Spin size={10} />
              <span style={{ fontSize: "0.68rem", opacity: 0.5 }}>syncing…</span>
            </>
          )}
        </label>

        {/* Search box — edit mode only */}
        {editing && (
          <div style={{ position: "relative", marginBottom: "0.75rem" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="2"
              style={{
                position: "absolute",
                left: "0.9rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search a place…"
              style={{
                width: "100%",
                padding: "0.6rem 1rem 0.6rem 2.4rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box",
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.42)",
                color: "#e9d5ff",
                caretColor: "#a78bfa",
              }}
            />
          </div>
        )}

        {mapError ? (
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#fca5a5",
              fontSize: "0.8rem",
            }}
          >
            ⚠️ Map unavailable: {mapError}. Set{" "}
            <code>VITE_GOOGLE_MAPS_API_KEY</code> in your <code>.env</code>.
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <div ref={mapDivRef} style={{ width: "100%", height: "300px" }} />

            {/* Locked overlay */}
            {!editing && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.32)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(1px)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    background: "rgba(0,0,0,0.5)",
                    padding: "0.4rem 0.9rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Click Edit to update location
                </span>
              </div>
            )}

            {/* Locate me button */}
            {editing && (
              <button
                onClick={handleLocateMe}
                disabled={locating}
                title="Use my current location"
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: locating ? "not-allowed" : "pointer",
                  background: "rgba(17,17,34,0.88)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  color: "#c4b5fd",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                }}
              >
                {locating ? (
                  <Spin size={13} />
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
                  </svg>
                )}
                {locating ? "Locating…" : "Use my location"}
              </button>
            )}

            {/* Loading overlay */}
            {!mapReady && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(15,15,30,0.85)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spin size={28} color="#7c3aed" />
              </div>
            )}
          </div>
        )}

        {/* Pin label */}
        {pinLoc?.lat && (
          <div
            style={{
              marginTop: "0.6rem",
              padding: "0.55rem 0.9rem",
              borderRadius: "8px",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
              fontSize: "0.76rem",
              color: "rgba(196,181,253,0.7)",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ marginTop: "1px", flexShrink: 0 }}
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>
              {pinLoc.label || `${pinLoc.lat}, ${pinLoc.lng}`}
              <span style={{ opacity: 0.45, marginLeft: "0.5rem" }}>
                ({parseFloat(pinLoc.lat).toFixed(4)},{" "}
                {parseFloat(pinLoc.lng).toFixed(4)})
              </span>
            </span>
          </div>
        )}

        {editing && !pinLoc?.lat && (
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "0.74rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            📍 Fill in your address above or click the map / use your location to
            set your delivery pin
          </p>
        )}
      </div>
    </div>
  );
}

// ── Basic Info Section ─────────────────────────────────────────────
function BasicInfoSection({ initialValues, saving, onSave }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    if (!editing) setValues(initialValues);
  }, [initialValues, editing]);

  const handleSave = async () => {
    const r = await onSave(values);
    if (r !== false) setEditing(false);
  };
  const handleCancel = () => {
    setValues(initialValues);
    setEditing(false);
  };

  const fieldStyle = (active, locked) => ({
    width: "100%",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
    background: locked
      ? "rgba(255,255,255,0.03)"
      : active
      ? "rgba(139,92,246,0.08)"
      : "rgba(255,255,255,0.04)",
    border: locked
      ? "1px solid rgba(255,255,255,0.05)"
      : active
      ? "1px solid rgba(139,92,246,0.42)"
      : "1px solid rgba(255,255,255,0.07)",
    color: locked
      ? "rgba(255,255,255,0.35)"
      : active
      ? "#e9d5ff"
      : "rgba(255,255,255,0.65)",
    caretColor: "#a78bfa",
    cursor: locked ? "not-allowed" : "auto",
  });

  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${
          editing ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"
        }`,
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
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
          Basic Info
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(139,92,246,0.26)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(139,92,246,0.14)")
            }
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
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
                background: saving
                  ? "rgba(124,58,237,0.5)"
                  : "linear-gradient(135deg,#7c3aed,#6d28d9)",
                border: "1px solid rgba(139,92,246,0.5)",
                color: "#fff",
                boxShadow: "0 2px 14px rgba(124,58,237,0.4)",
              }}
            >
              {saving && <Spin size={12} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
        }}
      >
        {[
          { key: "username", label: "Username" },
          { key: "email", label: "Email Address", locked: true },
          { key: "phone", label: "Phone Number" },
          { key: "altPhone", label: "Alternative Phone" },
        ].map((f) => (
          <div key={f.key}>
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
              {f.label}
              {f.locked && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.1rem 0.45rem",
                    borderRadius: "999px",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  locked
                </span>
              )}
            </label>
            <input
              type="text"
              readOnly={!editing || f.locked}
              value={values[f.key] ?? ""}
              placeholder={editing && !f.locked ? "—" : ""}
              onChange={(e) => {
                if (!editing || f.locked) return;
                setValues((v) => ({ ...v, [f.key]: e.target.value }));
              }}
              style={fieldStyle(editing, f.locked)}
            />
          </div>
        ))}

        {/* Gender */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.72rem",
              marginBottom: "0.6rem",
              color: "rgba(255,255,255,0.42)",
            }}
          >
            Your Gender
          </label>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {["Male", "Female", "Prefer not to say"].map((opt) => (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: editing ? "pointer" : "default",
                  fontSize: "0.85rem",
                  color: editing
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.5)",
                }}
              >
                <input
                  type="radio"
                  name="gender"
                  value={opt}
                  checked={values.gender === opt}
                  onChange={() => editing && setValues((v) => ({ ...v, gender: opt }))}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border:
                      values.gender === opt
                        ? "5px solid #7c3aed"
                        : "2px solid rgba(255,255,255,0.5)",
                    background: "#fff",
                    cursor: editing ? "pointer" : "default",
                    transition: "all 0.2s",
                    pointerEvents: editing ? "auto" : "none",
                  }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────
export default function ProfileDetails() {
  const [profileData, setProfileData] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [toast, setToast] = useState(null);

  const email = getStoredEmail();
  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  const loadData = useCallback(async () => {
    if (!email) {
      showToast("Session expired. Please log in again.", "error");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/user/getProfile", { email });
      if (res.data.success) {
        const u = res.data.user;
        const a = res.data.address ?? {};
        setProfileData({
          username: u.username ?? "",
          email: u.email ?? email,
          phone: u.phone ?? "",
          altPhone: u.altPhone ?? "",
          gender: u.gender ?? "Prefer not to say",
        });
        setAddressData({
          addressLine1: a.addressLine1 ?? "",
          addressLine2: a.addressLine2 ?? "",
          city: a.city ?? "",
          district: a.district ?? "",
          state: a.state ?? "",
          pincode: a.pincode ?? "",
          country: a.country ?? "India",
        });
        if (a.location?.lat != null) {
          setLocationData({
            lat: String(a.location.lat),
            lng: String(a.location.lng),
            label: a.location.label ?? "",
          });
        } else {
          setLocationData(null);
        }
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Could not load profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProfile = async (values) => {
    if (!email) return showToast("Session expired.", "error");
    try {
      setSavingProfile(true);
      const res = await API.post("/user/updateProfile", {
        email,
        username: values.username,
        phone: values.phone,
        altPhone: values.altPhone,
        gender: values.gender,
      });
      if (res.data.success) {
        const u = res.data.user;
        setProfileData({
          username: u.username ?? "",
          email: u.email ?? email,
          phone: u.phone ?? "",
          altPhone: u.altPhone ?? "",
          gender: u.gender ?? "",
        });
        showToast("Profile updated 🎉");
        return true;
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update profile",
        "error"
      );
      return false;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (values, pinLoc) => {
    if (!email) return showToast("Session expired.", "error");
    try {
      setSavingAddress(true);
      const res = await API.post("/user/updateAddress", {
        email,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        district: values.district,
        state: values.state,
        pincode: values.pincode,
        country: values.country,
        location:
          pinLoc?.lat
            ? {
                lat: parseFloat(pinLoc.lat),
                lng: parseFloat(pinLoc.lng),
                label: pinLoc.label ?? "",
              }
            : null,
      });
      if (res.data.success) {
        const a = res.data.address;
        setAddressData({
          addressLine1: a.addressLine1 ?? "",
          addressLine2: a.addressLine2 ?? "",
          city: a.city ?? "",
          district: a.district ?? "",
          state: a.state ?? "",
          pincode: a.pincode ?? "",
          country: a.country ?? "India",
        });
        if (a.location?.lat != null) {
          setLocationData({
            lat: String(a.location.lat),
            lng: String(a.location.lng),
            label: a.location.label ?? "",
          });
        } else {
          setLocationData(null);
        }
        showToast("Address updated 🎉");
        return true;
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update address",
        "error"
      );
      return false;
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div>
       <Helmet>
      <title>My Profile | ChomokTomok</title>

      <meta
        name="description"
        content="Manage your ChomokTomok account, profile information, and delivery addresses."
      />

      <meta name="robots" content="noindex,nofollow" />

      <link
        rel="canonical"
        href="https://chomoktomok.com/user/profile"
      />

      <meta property="og:title" content="My Profile | ChomokTomok" />

      <meta
        property="og:description"
        content="Manage your ChomokTomok profile and saved delivery addresses."
      />

      <meta
        property="og:image"
        content="https://chomoktomok.com/Images/chomoktomok-og.png"
      />

      <meta property="og:type" content="website" />
    </Helmet>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#fff",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Personal Information
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.38)",
            margin: "0.35rem 0 0",
          }}
        >
          Manage your profile details and delivery address
        </p>
      </div>

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
          ⚠️ No session found. Please{" "}
          <a href="/login" style={{ color: "#f87171", textDecoration: "underline" }}>
            log in
          </a>{" "}
          again.
        </div>
      )}

      {loading ? (
        <Skeleton />
      ) : (
        <>
          {profileData && (
            <BasicInfoSection
              initialValues={profileData}
              saving={savingProfile}
              onSave={handleSaveProfile}
            />
          )}
          {addressData && (
            <AddressSection
              initialValues={addressData}
              initialLocation={locationData}
              saving={savingAddress}
              onSave={handleSaveAddress}
            />
          )}
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}