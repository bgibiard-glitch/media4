import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";

const B = { navy: "#002855", navyDeep: "#001A3D", red: "#C8102E", white: "#FFFFFF" };

const COLORS = [
  "#1B2A4A","#4A7FB5","#7D9B76","#C67B5C","#D4A0A0",
  "#E8C840","#B8B8B0","#2D5A3D","#6B2D3E","#006B7A",
  "#C49B3C","#BC7B7B","#6B7B3A","#A0C4D8","#A0522D","#F2EDE8",
];

const PARTNERS = [
  { name: "Licef", logo: "https://media4-xues.vercel.app/partenaires/1.png", url: "https://www.licef.fr/", desc: "Enduits & mortiers" },
  { name: "EF Factory", logo: "https://media4-xues.vercel.app/partenaires/2.png", url: "https://ef-factory.com/fr/", desc: "Mobilier & agencement" },
  { name: "Couleurs & Matières", logo: "https://media4-xues.vercel.app/partenaires/3.png", url: "https://www.couleurs-et-matieres.com/", desc: "Peintures décoratives" },
  { name: "La Chaux Pouzzolanique", logo: "https://media4-xues.vercel.app/partenaires/4.png", url: "https://www.chaux-tilia.fr/", desc: "Chaux naturelle" },
  { name: "Euromair", logo: "https://media4-xues.vercel.app/partenaires/5.png", url: "https://www.euromair.com/", desc: "Matériel de projection" },
];

const VIDEO_CONFIG = {
  embedUrl: "https://app.videas.fr/embed/87d4e0e9-ff7a-4c9c-8169-afae035aaaf9",
  mp4Url: "https://media4-xues.vercel.app/fondecran.mp4",
};

const PDF_URL = "https://media4-duplicated-z3xl.bolt.host/pdf.pdf";
const QR_URL = "https://media4-xues.vercel.app/qrcodepdf.png";
const LOGO_URL = "https://media4-duplicated-z3xl.bolt.host/logo.png";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; overflow: hidden; background: #000; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    @keyframes revealUp {
      from { opacity: 0; transform: translateY(40px) scale(0.97); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes qrFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-5px) rotate(0.5deg); }
      75% { transform: translateY(3px) rotate(-0.5deg); }
    }
    @keyframes logoPulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.32; } }

    .glass-btn {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer; position: relative; overflow: hidden;
    }
    .glass-btn::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent 60%);
      opacity: 0; transition: opacity 0.4s ease; pointer-events: none;
    }
    .glass-btn:hover::before { opacity: 1; }
    .glass-btn:hover {
      transform: translateY(-5px) scale(1.012);
      box-shadow: 0 28px 70px rgba(0,0,0,0.55), 0 0 40px rgba(200,16,46,0.12) !important;
      border-color: rgba(255,255,255,0.22) !important;
    }
    .glass-btn:active { transform: translateY(-2px) scale(0.99); transition-duration: 0.1s; }
    .partner-card { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
    .partner-card:hover {
      transform: translateY(-8px) scale(1.05);
      background: rgba(255,255,255,0.1) !important;
      border-color: rgba(255,255,255,0.2) !important;
      box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important;
    }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #C8102E40; border-radius: 4px; }
  `}</style>
);

const Strip = ({ h = 4, style = {} }: { h?: number; style?: CSSProperties }) => (
  <div style={{ display: "flex", height: h, ...style }}>
    {COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
  </div>
);

const Icon = ({ name, size = 24, color = "currentColor" }: { name: string; size?: number; color?: string }) => {
  const paths: Record<string, ReactNode> = {
    web: <><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="1.5"/></>,
    partners: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="1.5"/></>,
    back: <path d="M19 12H5m7-7l-7 7 7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    arrow: <path d="M7 17L17 7M17 7H7M17 7v10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="1.5"/>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5"/><polyline points="7 10 12 15 17 10" strokeWidth="1.5"/><line x1="12" y1="15" x2="12" y2="3" strokeWidth="1.5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (videoRef.current) videoRef.current.play().catch(() => {}); }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <video ref={videoRef} autoPlay muted loop playsInline style={{
        position: "absolute", top: "50%", left: "50%",
        width: "177.78vh", height: "100vh", minWidth: "100%", minHeight: "56.25vw",
        transform: "translate(-50%, -50%)", objectFit: "cover",
      }}>
        <source src={VIDEO_CONFIG.mp4Url} type="video/mp4" />
      </video>
    </div>
  );
};

interface BtnConfig {
  id: string; label: string; sub: string; icon: string;
  accent: string; gradient: string; type: string; url?: string; bgImage: string;
}

const BTNS: BtnConfig[] = [
  {
    id: "selection", label: "La Sélection du Mois", sub: "Découvrez nos coups de cœur",
    icon: "star", accent: B.red, gradient: `linear-gradient(135deg, ${B.red}, #FF2D55)`,
    type: "pdf", bgImage: "https://media4-xues.vercel.app/laselection.png",
  },
  {
    id: "site", label: "Site Web Unikalo", sub: "Explorez notre univers",
    icon: "web", accent: "#4A7FB5", gradient: "linear-gradient(135deg, #4A7FB5, #6BA3D6)",
    type: "web", url: "https://nuances-unikalo.com",
    bgImage: "https://media4-xues.vercel.app/siteUNIKALO.png",
  },
  {
    id: "partenaires", label: "Nos Partenaires", sub: "L'excellence au quotidien",
    icon: "partners", accent: "#14B8A6", gradient: "linear-gradient(135deg, #0D9488, #14B8A6)",
    type: "partners", bgImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  },
];

// ─── HOME ────────────────────────────────────────────────
const Home = ({ onSelect }: { onSelect: (btn: BtnConfig) => void }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 150); return () => clearTimeout(t); }, []);

  return (
    <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column" }}>
      <Strip h={5} style={{ flexShrink: 0, position: "relative", zIndex: 20 }} />

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "space-evenly",
        padding: "24px 60px",
        maxWidth: 880, width: "100%", margin: "0 auto",
      }}>

        {/* ═══ LOGO CENTRÉ GRAND EN TRANSPARENCE ═══ */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          animation: "revealUp 0.9s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}>
          <img
            src={LOGO_URL}
            alt="Unikalo"
            style={{
              height: 96,
              width: "auto",
              maxWidth: "55%",
              objectFit: "contain",
              filter: "brightness(0) invert(1)",
              opacity: 0.22,
              animation: "logoPulse 4s ease-in-out infinite",
              display: "block",
            }}
          />
        </div>

        {/* ═══ 3 BOUTONS avec grand espacement ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {BTNS.map((btn, i) => (
            <button
              key={btn.id}
              className="glass-btn"
              onClick={() => onSelect(btn)}
              style={{
                display: "flex", alignItems: "center",
                padding: 0,
                height: 118,
                borderRadius: 26,
                background: "rgba(0, 5, 20, 0.60)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.14)",
                textAlign: "left",
                boxShadow: "0 10px 50px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.07)",
                position: "relative", overflow: "hidden",
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(50px)",
                transition: `opacity 0.7s ${0.15 + i * 0.15}s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s ${0.15 + i * 0.15}s cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {/* Image de fond visible */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(${btn.bgImage})`,
                backgroundSize: "cover", backgroundPosition: "center",
                opacity: 0.3,
              }} />
              {/* Overlay dégradé */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, rgba(0,5,20,0.85) 0%, rgba(0,5,20,0.42) 55%, rgba(0,5,20,0.65) 100%)",
              }} />
              {/* Barre colorée gauche */}
              <div style={{
                position: "absolute", top: 0, left: 0, bottom: 0, width: 5,
                background: btn.gradient, borderRadius: "26px 0 0 26px",
                boxShadow: `0 0 24px ${btn.accent}70`,
              }} />
              {/* Texte */}
              <div style={{ position: "relative", zIndex: 2, flex: 1, paddingLeft: 44 }}>
                <div style={{
                  fontSize: 25, fontWeight: 800, color: "#fff", letterSpacing: -0.3,
                  textShadow: "0 2px 16px rgba(0,0,0,0.7)", lineHeight: 1.2,
                }}>
                  {btn.label}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 7, fontWeight: 400 }}>
                  {btn.sub}
                </div>
              </div>
              {/* Flèche */}
              <div style={{
                position: "relative", zIndex: 2, marginRight: 36,
                width: 46, height: 46, borderRadius: 14,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.13)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon name="arrow" size={22} color="rgba(255,255,255,0.65)" />
              </div>
            </button>
          ))}
        </div>

        {/* ═══ SLOGAN ═══ */}
        <div style={{
          textAlign: "center",
          animation: "revealUp 1s 0.75s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800, lineHeight: 1.3,
            color: "#fff", letterSpacing: -0.3,
            textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          }}>
            Unikalo,{" "}
            <span style={{
              background: `linear-gradient(135deg, ${B.red}, #FF4D6A, #FF2D55, ${B.red})`,
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
              display: "inline",
            }}>
              1er fabricant français indépendant
            </span>
            {" "}de peintures bâtiment
          </h1>
          <div style={{
            marginTop: 8, fontSize: 11, fontWeight: 300,
            color: "rgba(255,255,255,0.28)", letterSpacing: 5,
            textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace",
          }}>
            Fabricant de peintures depuis 1936
          </div>
        </div>
      </div>

      <footer style={{
        position: "relative", zIndex: 20, flexShrink: 0,
        background: "rgba(0, 10, 30, 0.35)", backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        animation: "fadeIn 0.6s 0.9s ease both",
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
          Propulsé par <strong style={{ color: "rgba(255,255,255,0.5)" }}>MEDIA4 🚀</strong>
        </span>
        <img src={LOGO_URL} alt="Unikalo"
          style={{ height: 16, opacity: 0.2, filter: "brightness(0) invert(1)" }}
          onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
        />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </footer>
      <Strip h={4} style={{ flexShrink: 0, position: "relative", zIndex: 20 }} />
    </div>
  );
};

// ─── SHELL ───────────────────────────────────────────────
const Shell = ({ btn, onHome, children }: { btn: BtnConfig; onHome: () => void; children: ReactNode }) => (
  <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", flexDirection: "column" }}>
    <nav style={{
      background: "rgba(0, 10, 30, 0.5)", backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0 36px", display: "flex", alignItems: "center", gap: 16,
      height: 64, flexShrink: 0, animation: "slideDown 0.4s ease both",
    }}>
      <button onClick={onHome} style={{
        width: 42, height: 42, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="back" size={18} color="rgba(255,255,255,0.6)" />
      </button>
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: btn.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 12px ${btn.accent}30`,
        }}>
          <Icon name={btn.icon} size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{btn.label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{btn.sub}</div>
        </div>
      </div>
      <img src={LOGO_URL} alt="Logo" style={{ height: 26, filter: "brightness(0) invert(1)" }}
        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
      />
      <button onClick={onHome} style={{
        padding: "10px 24px", borderRadius: 12, border: "none", background: B.red,
        cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 8, boxShadow: `0 4px 20px ${B.red}40`,
      }}>
        <Icon name="home" size={18} color="#fff" /> Accueil
      </button>
    </nav>
    <div style={{ height: 3, background: btn.gradient, flexShrink: 0 }} />
    <div style={{ flex: 1, overflow: "hidden", animation: "fadeIn 0.4s 0.1s ease both" }}>{children}</div>
    <div style={{
      background: "rgba(0, 10, 30, 0.4)", backdropFilter: "blur(12px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "10px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
    }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
        Propulsé par <strong style={{ color: "rgba(255,255,255,0.4)" }}>MEDIA4 🚀</strong>
      </span>
      <img src={LOGO_URL} alt="Unikalo"
        style={{ height: 16, opacity: 0.2, filter: "brightness(0) invert(1)" }}
        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
      />
      <Strip h={10} style={{ width: 140, borderRadius: 5, overflow: "hidden" }} />
    </div>
  </div>
);

// ─── PAGE PDF ────────────────────────────────────────────
// Sur Android, Google Docs viewer échoue sur les gros fichiers.
// Solution : sur Android on affiche un QR code + bouton "Ouvrir le PDF".
// Sur desktop/iOS : iframe PDF directe.
const SelectionMois = () => {
  const [vis, setVis] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), 100);
    setIsAndroid(/Android/i.test(navigator.userAgent));
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgba(0,10,30,0.6)" }}>
      {/* Header */}
      <div style={{
        padding: "24px 40px", flexShrink: 0,
        background: "linear-gradient(135deg, rgba(200,16,46,0.15), rgba(0,20,50,0.5))",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 32,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${B.red}15, transparent 70%)`, filter: "blur(40px)",
        }} />
        <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 8,
            background: `${B.red}20`, border: `1px solid ${B.red}30`, marginBottom: 10,
          }}>
            <Icon name="star" size={14} color={B.red} />
            <span style={{ fontSize: 11, color: B.red, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5, margin: 0 }}>La Sélection du Mois</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 5 }}>Nos produits coup de cœur sélectionnés par nos experts</p>
        </div>
        {/* QR toujours visible dans le header */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: vis ? 1 : 0, transform: vis ? "scale(1)" : "scale(0.88)",
          transition: "all 0.6s 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{
            background: "#fff", borderRadius: 14, padding: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "qrFloat 4s ease-in-out infinite",
          }}>
            <img src={QR_URL} alt="QR Code" style={{ width: 90, height: 90, borderRadius: 8, display: "block" }} />
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 100,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <Icon name="download" size={11} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
              Scannez-moi
            </span>
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex: 1, background: "#0d1117", position: "relative", display: "flex", flexDirection: "column" }}>
        {isAndroid ? (
          // ── Fallback Android : gros QR + bouton ouverture directe ──
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 36, padding: 48,
            animation: "fadeIn 0.5s ease both",
          }}>
            <div style={{
              background: "#fff", borderRadius: 24, padding: 18,
              boxShadow: "0 20px 70px rgba(0,0,0,0.6)",
              animation: "qrFloat 4s ease-in-out infinite",
            }}>
              <img src={QR_URL} alt="QR Code PDF" style={{ width: 180, height: 180, borderRadius: 14, display: "block" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Scannez pour voir la sélection</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                Ouvrez l'appareil photo de votre téléphone<br />et pointez-le vers le QR code ci-dessus
              </p>
            </div>
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "16px 40px", borderRadius: 16,
                background: `linear-gradient(135deg, ${B.red}, #FF2D55)`,
                color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 700,
                boxShadow: `0 8px 32px ${B.red}50`,
              }}
            >
              <Icon name="download" size={20} color="#fff" />
              Ouvrir le PDF directement
            </a>
          </div>
        ) : (
          // ── Desktop / iOS : iframe PDF native ──
          <iframe
            src={`${PDF_URL}#toolbar=1&navpanes=0&view=FitH`}
            title="Sélection du mois"
            style={{ width: "100%", height: "100%", border: "none", flex: 1 }}
          />
        )}
      </div>
    </div>
  );
};

// ─── PAGE SITE WEB ───────────────────────────────────────
const SiteWeb = ({ url }: { url: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgba(0,10,30,0.6)" }}>
      <div style={{
        padding: "10px 24px", background: "rgba(0,10,30,0.5)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", flexShrink: 0,
      }}>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{url}</span>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,10,30,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
                {COLORS.slice(0, 6).map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: c, animation: `float 1s ${i * 0.15}s ease-in-out infinite` }} />
                ))}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Chargement…</div>
            </div>
          </div>
        )}
        <iframe src={url} title="Site web" style={{ width: "100%", height: "100%", border: "none" }} onLoad={() => setLoading(false)} />
      </div>
    </div>
  );
};

// ─── PAGE PARTENAIRES ────────────────────────────────────
const Partenaires = () => {
  const [vis, setVis] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVis(true)); }, []);
  return (
    <div style={{ height: "100%", overflow: "auto", background: "rgba(0,10,30,0.6)" }}>
      <div style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(0,20,50,0.5))", padding: "40px 48px 44px", position: "relative", overflow: "hidden" }}>
        {COLORS.slice(0, 4).map((c, i) => (
          <div key={i} style={{
            position: "absolute", width: 180, height: 180, borderRadius: "50%",
            background: `radial-gradient(circle, ${c}15, transparent 70%)`,
            top: -30 + i * 25, right: -10 + i * 70, filter: "blur(30px)",
          }} />
        ))}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-block", padding: "5px 14px", borderRadius: 6,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
            fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, marginBottom: 16,
          }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -0.5, margin: 0 }}>Nos Partenaires</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>L'excellence au service de vos projets</p>
        </div>
      </div>
      <Strip h={3} />
      <div style={{ padding: "36px 48px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, maxWidth: 840, margin: "0 auto", justifyContent: "center" }}>
          {PARTNERS.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="partner-card" style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
              padding: "32px 24px", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 14,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              width: "calc(33.333% - 14px)", minWidth: 200,
              opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.5s ${0.1 + i * 0.08}s cubic-bezier(0.4, 0, 0.2, 1)`,
              cursor: "pointer", textDecoration: "none",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                <img src={p.logo} alt={p.name} style={{ width: 52, height: 52, objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLElement).outerHTML = `<div style="width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#0D9488,#14B8A6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;font-family:Outfit,sans-serif">${p.name.charAt(0)}</div>`;
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>{p.desc}</div>
              </div>
            </a>
          ))}
        </div>
        <div style={{ marginTop: 36, textAlign: "center", padding: "24px 32px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            Vous souhaitez devenir partenaire Unikalo ?<br />
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>Contactez-nous</strong> pour en savoir plus.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<"home" | "content">("home");
  const [content, setContent] = useState<BtnConfig | null>(null);

  useEffect(() => {
    if (screen === "home") return;
    const t = setTimeout(() => { setScreen("home"); setContent(null); }, 120000);
    return () => clearTimeout(t);
  }, [screen, content]);

  const goHome = useCallback(() => { setContent(null); setScreen("home"); }, []);
  const open = useCallback((btn: BtnConfig) => { setContent(btn); setScreen("content"); }, []);

  const renderContent = () => {
    if (!content) return null;
    switch (content.type) {
      case "web": return <SiteWeb url={content.url || ""} />;
      case "pdf": return <SelectionMois />;
      case "partners": return <Partenaires />;
      default: return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
        <VideoBackground />
        {screen === "home" && <Home onSelect={open} />}
        {screen === "content" && content && (
          <Shell btn={content} onHome={goHome}>{renderContent()}</Shell>
        )}
      </div>
    </>
  );
}