import appLogo from "../assets/images/appImage/app-logo.png";
export default function Footer() {
  return (
    <footer className="bg-[#080c14] border-t border-white/5 ">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
                <img src={appLogo} alt="app-logo" className="h-10 w-auto "/>
              <span className="text-yellow-400 font-bold text-sm tracking-widest">MIDNIGHT AURA</span>
            </div>
            <p className="text-white/30 text-xs leading-relaxed">Premium streetwear for every aura. Stand out. Be bold. Be you.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Shop</h4>
            {["T-Shirts", "Hoodies", "Oversized", "Accessories"].map((l) => (
              <p key={l} className="text-white/30 text-xs mb-2 hover:text-white/60 cursor-pointer transition-colors">{l}</p>
            ))}
          </div>

          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Help</h4>
            {["FAQ", "Shipping", "Returns", "Track Order"].map((l) => (
              <p key={l} className="text-white/30 text-xs mb-2 hover:text-white/60 cursor-pointer transition-colors">{l}</p>
            ))}
          </div>

          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Follow</h4>
            {["Instagram", "Twitter/X", "YouTube", "Discord"].map((l) => (
              <p key={l} className="text-white/30 text-xs mb-2 hover:text-white/60 cursor-pointer transition-colors">{l}</p>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-5 text-center">
          <p className="text-white/20 text-xs">© 2026 Midnight Aura. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}