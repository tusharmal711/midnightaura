import { useEffect, useState } from "react";
import { MdWifiOff, MdWifi } from "react-icons/md";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [visible, setVisible] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      setVisible(true);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setShowReconnected(false), 400);
      }, 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const shouldRender = (!isOnline && visible) || (isOnline && showReconnected);

  if (!shouldRender) return null;

  const isOffline = !isOnline;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        @keyframes wifiScan {
          0%   { opacity: 0.3; }
          50%  { opacity: 1; }
          100% { opacity: 0.3; }
        }
        .network-bar {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .network-bar.hiding {
          animation: slideUp 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }
        .offline-icon {
          animation: pulse 1.8s ease-in-out infinite;
        }
        .online-icon {
          animation: wifiScan 1.2s ease-in-out 2;
        }
        .network-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .dot-offline {
          background: #f59e0b;
          box-shadow: 0 0 6px #f59e0baa;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .dot-online {
          background: #22c55e;
          box-shadow: 0 0 6px #22c55eaa;
        }
      `}</style>

      <div
        className={`network-bar${!visible ? " hiding" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          background: isOffline
            ? "linear-gradient(90deg, #1a1020 0%, #2d1a0e 50%, #1a1020 100%)"
            : "linear-gradient(90deg, #0a1f12 0%, #052e12 50%, #0a1f12 100%)",
          borderBottom: isOffline
            ? "1px solid rgba(245,158,11,0.3)"
            : "1px solid rgba(34,197,94,0.3)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "8px 16px",
          boxShadow: isOffline
            ? "0 2px 20px rgba(245,158,11,0.15)"
            : "0 2px 20px rgba(34,197,94,0.15)",
        }}
      >
        {/* Glow line at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background: isOffline
              ? "linear-gradient(90deg, transparent, #f59e0b88, transparent)"
              : "linear-gradient(90deg, transparent, #22c55e88, transparent)",
          }}
        />

        {/* Dot indicator */}
        <span className={`network-dot ${isOffline ? "dot-offline" : "dot-online"}`} />

        {/* Icon */}
        {isOffline ? (
          <MdWifiOff
            className="offline-icon"
            style={{ color: "#f59e0b", fontSize: "18px", flexShrink: 0 }}
          />
        ) : (
          <MdWifi
            className="online-icon"
            style={{ color: "#22c55e", fontSize: "18px", flexShrink: 0 }}
          />
        )}

        {/* Text */}
        <span
          style={{
            fontSize: "13px",
            fontWeight: "500",
            letterSpacing: "0.3px",
            color: isOffline ? "#fcd34d" : "#86efac",
          }}
        >
          {isOffline
            ? "No internet connection — please check your network"
            : "Back online — connected successfully"}
        </span>

        {/* Right side tag */}
        <span
          style={{
            marginLeft: "4px",
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "20px",
            fontWeight: "600",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            background: isOffline
              ? "rgba(245,158,11,0.15)"
              : "rgba(34,197,94,0.15)",
            color: isOffline ? "#f59e0b" : "#22c55e",
            border: isOffline
              ? "1px solid rgba(245,158,11,0.3)"
              : "1px solid rgba(34,197,94,0.3)",
          }}
        >
          {isOffline ? "Offline" : "Online"}
        </span>
      </div>

      {/* Spacer so navbar doesn't get hidden under the bar */}
      {!isOnline && <div style={{ height: "37px" }} />}
    </>
  );
}