import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet-async";
export default function NotFound() {
  const navigate   = useNavigate();
  const isLoggedIn = !!Cookies.get("user");

  const handleHome = () => navigate(isLoggedIn ? "/user/dashboard" : "/");

  return (
    <>
    <Helmet>
  <title>404 - Page Not Found | ChomokTomok</title>

  <meta
    name="description"
    content="The page you're looking for doesn't exist or may have been moved."
  />

  <meta name="robots" content="noindex,nofollow" />
</Helmet>
      <style>{`
        /* ── Page base ── */
        .nf-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0d0f1a;
          padding: 24px;
          overflow: hidden;
          position: relative;
        }

        /* ── Ambient purple glow behind the 404 ── */
        .nf-glow {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
          pointer-events: none;
          animation: nf-pulse 4s ease-in-out infinite;
        }

        @keyframes nf-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.7; }
          50%       { transform: scale(1.1); opacity: 1;   }
        }

        /* ── 404 giant number ── */
        .nf-code {
          font-size: clamp(96px, 20vw, 180px);
          font-weight: 900;
          letter-spacing: -4px;
          line-height: 1;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6d28d9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          z-index: 1;

          /* slide-in from top */
          opacity: 0;
          transform: translateY(-40px);
          animation: nf-drop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s forwards;
        }

        /* ── Heading ── */
        .nf-title {
          font-size: clamp(18px, 4vw, 26px);
          font-weight: 700;
          color: #ffffff;
          margin: 12px 0 8px;
          position: relative;
          z-index: 1;

          opacity: 0;
          transform: translateY(20px);
          animation: nf-rise 0.5s ease 0.4s forwards;
        }

        /* ── Subtitle ── */
        .nf-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          text-align: center;
          max-width: 320px;
          line-height: 1.6;
          margin-bottom: 36px;
          position: relative;
          z-index: 1;

          opacity: 0;
          transform: translateY(20px);
          animation: nf-rise 0.5s ease 0.55s forwards;
        }

        /* ── CTA button ── */
        .nf-btn {
          position: relative;
          z-index: 1;
          padding: 13px 32px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.3px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: #fff;
          box-shadow: 0 8px 24px rgba(109,40,217,0.45);
          transition: transform 0.18s ease, box-shadow 0.18s ease;

          opacity: 0;
          transform: translateY(20px);
          animation: nf-rise 0.5s ease 0.7s forwards;
        }
        .nf-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 32px rgba(109,40,217,0.6);
        }
        .nf-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* ── Shared keyframes ── */
        @keyframes nf-drop {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes nf-rise {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Floating particles (purely decorative) ── */
        .nf-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.12;
          pointer-events: none;
          animation: nf-float linear infinite;
        }
        @keyframes nf-float {
          0%   { transform: translateY(0)    rotate(0deg);   }
          100% { transform: translateY(-120px) rotate(360deg); }
        }
      `}</style>

      <div className="nf-root">
        {/* Ambient glow */}
        <div className="nf-glow" />

        {/* Decorative floating particles */}
        {[
          { size: 8,  left: "12%", top: "70%", dur: "7s",  delay: "0s"   },
          { size: 5,  left: "82%", top: "60%", dur: "9s",  delay: "1.2s" },
          { size: 10, left: "25%", top: "20%", dur: "11s", delay: "0.4s" },
          { size: 6,  left: "68%", top: "30%", dur: "8s",  delay: "2s"   },
          { size: 4,  left: "50%", top: "80%", dur: "6s",  delay: "0.8s" },
        ].map((p, i) => (
          <div
            key={i}
            className="nf-particle"
            style={{
              width:  p.size,
              height: p.size,
              left:   p.left,
              top:    p.top,
              background: "#a855f7",
              animationDuration: p.dur,
              animationDelay:    p.delay,
            }}
          />
        ))}

        {/* 404 */}
        <div className="nf-code">404</div>

        {/* Heading */}
        <h1 className="nf-title">Page not found</h1>

        {/* Subtitle */}
        <p className="nf-sub">
          Looks like this page went out of stock. Let's get you back to something real.
        </p>

        {/* CTA */}
        <button className="nf-btn" onClick={handleHome}>
          ← Go back home
        </button>
      </div>
    </>
  );
}