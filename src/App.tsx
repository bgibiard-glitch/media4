import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";

// ═══════════════════════════════════════════════════════════
// UNIKALO TOTEM — V3 CORRIGÉ
// Video native plein écran + partenaires centrés + retour attract
// ═══════════════════════════════════════════════════════════

const B = {
  navy: "#002855",
  navyDeep: "#001A3D",
  red: "#C8102E",
  white: "#FFFFFF",
  offWhite: "#F5F6F8",
  stone: "#EBEEF3",
  line: "#DEE2EA",
  dim: "#8892A6",
  mid: "#4A5168",
  dark: "#111827",
};

const COLORS = [
  "#1B2A4A","#4A7FB5","#7D9B76","#C67B5C","#D4A0A0",
  "#E8C840","#B8B8B0","#2D5A3D","#6B2D3E","#006B7A",
  "#C49B3C","#BC7B7B","#6B7B3A","#A0C4D8","#A0522D","#F2EDE8",
];

const PARTNERS = [
  { name: "Partenaire 1", logo: "https://media4-xues.vercel.app/partenaires/1.png" },
  { name: "Partenaire 2", logo: "https://media4-xues.vercel.app/partenaires/2.png" },
  { name: "Partenaire 3", logo: "https://media4-xues.vercel.app/partenaires/3.png" },
  { name: "Partenaire 4", logo: "https://media4-xues.vercel.app/partenaires/4.png" },
  { name: "Partenaire 5", logo: "https://media4-xues.vercel.app/partenaires/5.png" },
];

// ─── FONTS & GLOBAL STYLES ───────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; overflow: hidden; background: #000; -webkit-user-select: none; user-select: none; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.92) } to { opacity:1; transform:scale(1) } }
    @keyframes slideDown { from { opacity:0; transform:translateY(-20px) } to { opacity:1; transform:translateY(0) } }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

    .totem-btn { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
    .totem-btn:hover {
      transform: translateY(-4px) scale(1.01);
      background: rgba(255,255,255,0.08) !important;
      border-color: rgba(255,255,255,0.15) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,0.3) !important;
    }
    .totem-btn:active { transform: translateY(-1px) scale(0.99); }

    .partner-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .partner-card:hover {
      transform: translateY(-6px) scale(1.04);
      background: rgba(255,255,255,0.08) !important;
      border-color: rgba(255,255,255,0.15) !important;
      box-shadow: 0 16px 48px rgba(0,0,0,0.3) !important;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #C8102E40; border-radius: 4px; }
  `}</style>
);

// ─── COLOR STRIP ──────────────────────────────────────────
const Strip = ({ h = 4, style = {} }: { h?: number; style?: CSSProperties }) => (
  <div style={{ display: "flex", height: h, ...style }}>
    {COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
  </div>
);

// ─── ICONS (SVG) ──────────────────────────────────────────
const Icon = ({ name, size = 24, color = "currentColor" }: { name: string; size?: number; color?: string }) => {
  const paths: Record<string, ReactNode> = {
    web: <><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="1.5"/></>,
    pdf: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeWidth="1.5"/><polyline points="14 2 14 8 20 8" strokeWidth="1.5"/><path d="M9 13h2m-2 3h4" strokeWidth="1.5"/></>,
    partners: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="1.5"/></>,
    back: <path d="M19 12H5m7-7l-7 7 7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    arrow: <path d="M7 17L17 7M17 7H7M17 7v10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    external: <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════
// 1. ATTRACT SCREEN — Fond vidéo NATIVE plein écran
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────
// 🎬 URL DIRECTE DU MP4 — Balise <video> native
// ────────────────────────────────────────────────────
const VIDEO_URL = "https://media4-xues.vercel.app/fondecran.mp4";

const Attract = ({ onTouch }: { onTouch: () => void }) => {
  const [line, setLine] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const taglines = [
    "Fabricant de peintures depuis 1936.",
    "110 000+ teintes à votre disposition.",
    "L'excellence couleur, au service des pros.",
  ];

  useEffect(() => {
    const t = setInterval(() => setLine(p => (p + 1) % taglines.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div onClick={onTouch} style={{ position: "absolute", inset: 0, cursor: "pointer", overflow: "hidden", background: "#000" }}>

      {/* LAYER 0 — Gradient fallback (visible pendant le chargement vidéo) */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: `linear-gradient(135deg, ${B.navyDeep} 0%, #0A1628 25%, #162544 50%, #1B2A4A 75%, ${B.navyDeep} 100%)`,
        backgroundSize: "400% 400%",
        animation: "gradientShift 20s ease infinite",
      }} />

      {/* LAYER 1 — VIDEO NATIVE <video> PLEIN ÉCRAN — PAS d'iframe ! */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Color strip TOP */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <Strip h={5} />
      </div>

      {/* MAIN CONTENT — dark glass box par-dessus la vidéo */}
      <div style={{
        position: "relative", zIndex: 10,
        height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "60px 40px 40px",
      }}>
        <div style={{
          background: "rgba(0, 15, 40, 0.50)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 32,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "48px 64px 52px",
          display: "flex", flexDirection: "column",
          alignItems: "center",
          maxWidth: 680,
          width: "100%",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          animation: "scaleIn 0.7s 0.1s ease both",
          opacity: 0,
        }}>
          {/* Status badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "8px 22px", borderRadius: 100,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            marginBottom: 36,
            animation: "fadeUp 0.8s 0.3s ease both", opacity: 0,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "blink 2s infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
              Totem Interactif · Ivry sur seine - 94
            </span>
          </div>

          {/* Logo */}
          <div style={{ marginBottom: 36, animation: "fadeUp 0.8s 0.4s ease both", opacity: 0 }}>
            <img
              src="https://media4-duplicated-z3xl.bolt.host/logo.png"
              alt="Unikalo"
              style={{ height: 56, display: "block" }}
              onError={(e) => { (e.target as HTMLElement).outerHTML = `<span style="font-size:44px;font-weight:900;letter-spacing:8px;color:#fff;font-family:Outfit,sans-serif">UNIKALO</span>`; }}
            />
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 72, fontWeight: 900, lineHeight: 0.95, color: "#fff",
            letterSpacing: -3,
            animation: "fadeUp 0.8s 0.5s ease both", opacity: 0,
          }}>
            La couleur,<br />
            <span style={{
              background: `linear-gradient(135deg, ${B.red}, #FF4D6A, ${B.red})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
              animation: "shimmer 4s linear infinite",
            }}>sublimée.</span>
          </h1>

          {/* Rotating tagline */}
          <div style={{
            position: "relative", height: 24, overflow: "hidden",
            marginTop: 28, marginBottom: 44, width: "100%",
            animation: "fadeUp 0.8s 0.6s ease both", opacity: 0,
          }}>
            {taglines.map((t, i) => (
              <div key={i} style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, color: "rgba(255,255,255,0.55)",
                fontWeight: 300, letterSpacing: 0.5,
                opacity: i === line ? 1 : 0,
                transform: `translateY(${i === line ? 0 : 16}px)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}>{t}</div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={e => { e.stopPropagation(); onTouch(); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              padding: "22px 56px", borderRadius: 100,
              background: B.red, border: "none", cursor: "pointer",
              color: "#fff", fontSize: 17, fontWeight: 700, letterSpacing: 0.5,
              animation: "fadeUp 0.8s 0.7s ease both, pulse 3s 2s ease-in-out infinite",
              opacity: 0,
              boxShadow: `0 12px 40px ${B.red}50, 0 0 80px ${B.red}20`,
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", inset: 0, borderRadius: 100,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s linear infinite",
            }} />
            <span style={{ position: "relative", zIndex: 1 }}>Toucher pour commencer</span>
          </button>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        <div style={{
          padding: "14px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0, 15, 40, 0.40)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
            🚀 Propulsé par <strong style={{ color: "rgba(255,255,255,0.5)" }}>MEDIA4</strong>
          </span>
          <img
            src="https://media4-duplicated-z3xl.bolt.host/logo.png"
            alt="Logo" style={{ height: 18, opacity: 0.3 }}
            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
          />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <Strip h={4} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// 2. HOME — 3 boutons + bouton retour vers attract
// ═══════════════════════════════════════════════════════════
interface BtnConfig {
  id: string;
  label: string;
  sub: string;
  icon: string;
  accent: string;
  gradient: string;
  type: string;
  url?: string;
  bgImage: string;
}

const BTNS: BtnConfig[] = [
  {
    id: "site",
    label: "Site Web",
    sub: "Découvrir unikalo.com",
    icon: "web",
    accent: B.navy,
    gradient: `linear-gradient(135deg, ${B.navy}, #1A4B8C)`,
    type: "web",
    url: "https://unikalo.com",
    bgImage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
  },
  {
    id: "selection",
    label: "Sélection du Mois",
    sub: "Nos coups de cœur",
    icon: "pdf",
    accent: B.red,
    gradient: `linear-gradient(135deg, ${B.red}, #E83350)`,
    type: "pdf",
    bgImage: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
  },
  {
    id: "partenaires",
    label: "Partenaires du Jour",
    sub: "Nos collaborateurs",
    icon: "partners",
    accent: "#0D9488",
    gradient: "linear-gradient(135deg, #0D9488, #14B8A6)",
    type: "partners",
    bgImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  },
];

const Home = ({ onSelect, onBack }: { onSelect: (btn: BtnConfig) => void; onBack: () => void }) => {
  const [vis, setVis] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { requestAnimationFrame(() => setVis(true)); }, []);

  // Vidéo au ralenti extrême (0.15x = ~7x plus lent)
  useEffect(() => {
    if (bgVideoRef.current) {
      bgVideoRef.current.playbackRate = 0.15;
      bgVideoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: B.navyDeep, position: "relative", overflow: "hidden" }}>

      {/* LAYER 0 — Vidéo ultra ralentie en fond */}
      <video
        ref={bgVideoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          opacity: 0.25,
          filter: "blur(2px)",
        }}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* LAYER 1 — Dark overlay sur la vidéo */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: `linear-gradient(160deg, ${B.navyDeep}e0 0%, #0D1F3Ce0 40%, #162544d0 70%, #0A1628e0 100%)`,
      }} />
      {[
        { c: "#C8102E", x: "5%", y: "30%", s: 350 },
        { c: "#4A7FB5", x: "90%", y: "20%", s: 300 },
        { c: "#E8C840", x: "50%", y: "90%", s: 280 },
      ].map((b, i) => (
        <div key={i} style={{
          position: "absolute", zIndex: 0,
          width: b.s, height: b.s, borderRadius: "50%",
          background: `radial-gradient(circle, ${b.c}18, transparent 70%)`,
          left: b.x, top: b.y, transform: "translate(-50%, -50%)",
          animation: `float ${7 + i * 1.5}s ease-in-out ${i * 0.5}s infinite`,
          filter: "blur(50px)",
        }} />
      ))}

      {/* HEADER — avec bouton retour vers l'écran d'accueil (attract) */}
      <header style={{
        position: "relative", zIndex: 10,
        background: "rgba(0,15,40,0.5)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 72, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* ← Bouton retour vers attract */}
          <button onClick={onBack} style={{
            width: 42, height: 42, borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
          }}>
            <Icon name="back" size={18} color="rgba(255,255,255,0.6)" />
          </button>
          <img
            src="https://media4-duplicated-z3xl.bolt.host/logo.png"
            alt="Unikalo" style={{ height: 34 }}
            onError={(e) => { (e.target as HTMLElement).outerHTML = `<span style="font-size:18px;font-weight:900;letter-spacing:3px;color:#fff">UNIKALO</span>`; }}
          />
          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Magasin Ivry sur Seine - 94</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: "#22c55e" }} />
              Totem Entrée · En service
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {COLORS.slice(0, 12).map((c, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: c, opacity: 0.7 }} />
          ))}
        </div>
      </header>

      <Strip h={3} />

      {/* HERO TEXT */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "40px 48px 16px", flexShrink: 0,
      }}>
        <h1 style={{
          fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: -1,
          opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.6s ease",
        }}>
          Comment pouvons-nous <span style={{
            background: `linear-gradient(135deg, ${B.red}, #FF4D6A)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>vous aider</span> ?
        </h1>
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 8, fontWeight: 400,
          opacity: vis ? 1 : 0, transition: "all 0.6s 0.1s ease",
        }}>
          Sélectionnez un service ci-dessous
        </p>
      </div>

      {/* 3 BOUTONS */}
      <div style={{
        position: "relative", zIndex: 10,
        flex: 1, padding: "24px 48px 24px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        gap: 24,
        maxWidth: 820, width: "100%", margin: "0 auto",
      }}>
        {BTNS.map((btn, i) => (
          <button
            key={btn.id}
            className="totem-btn"
            onClick={() => onSelect(btn)}
            style={{
              display: "flex", alignItems: "center", gap: 32,
              padding: "0",
              height: "calc((100vh - 360px) / 3)",
              minHeight: 140,
              borderRadius: 24,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              textAlign: "left" as const,
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              position: "relative" as const, overflow: "hidden" as const,
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(30px)",
              transition: `opacity 0.6s ${0.15 + i * 0.12}s ease, transform 0.6s ${0.15 + i * 0.12}s cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          >
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${btn.bgImage})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
            <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(135deg, rgba(0,15,40,0.75) 0%, rgba(0,15,40,0.55) 50%, ${btn.accent}30 100%)` }} />
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 5, zIndex: 3, background: btn.gradient, borderRadius: "24px 0 0 24px" }} />
            <div style={{ position: "relative", zIndex: 2, width: 80, height: 80, borderRadius: 20, flexShrink: 0, marginLeft: 36, background: btn.gradient, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 32px ${btn.accent}40` }}>
              <Icon name={btn.icon} size={36} color="#fff" />
            </div>
            <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.5, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{btn.label}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 6, fontWeight: 400 }}>{btn.sub}</div>
            </div>
            <div style={{ position: "relative", zIndex: 2, marginRight: 36, opacity: 0.35 }}>
              <Icon name="arrow" size={24} color="#fff" />
            </div>
          </button>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{
        position: "relative", zIndex: 10,
        background: "rgba(0,15,40,0.4)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
          🚀 Propulsé par <strong style={{ color: "rgba(255,255,255,0.4)" }}>MEDIA4</strong>
        </span>
        <img src="https://media4-duplicated-z3xl.bolt.host/logo.png" alt="Logo" style={{ height: 18, opacity: 0.25 }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </span>
      </footer>
      <Strip h={3} style={{ position: "relative", zIndex: 10 }} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SHELL
// ═══════════════════════════════════════════════════════════
const Shell = ({ btn, onHome, children }: { btn: BtnConfig; onHome: () => void; children: ReactNode }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: B.navyDeep }}>
    <nav style={{
      background: "rgba(0,15,40,0.6)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0 36px", display: "flex", alignItems: "center", gap: 16, height: 64, flexShrink: 0,
    }}>
      <button onClick={onHome} style={{
        width: 42, height: 42, borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="back" size={18} color="rgba(255,255,255,0.6)" />
      </button>
      <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: btn.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={btn.icon} size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{btn.label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{btn.sub}</div>
        </div>
      </div>
      <img src="https://media4-duplicated-z3xl.bolt.host/logo.png" alt="Logo" style={{ height: 28 }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
      <button onClick={onHome} style={{
        padding: "10px 24px", borderRadius: 12, border: "none",
        background: B.red, cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 700,
        display: "flex", alignItems: "center", gap: 8, boxShadow: `0 4px 16px ${B.red}40`,
      }}>
        <Icon name="home" size={18} color="#fff" /> Accueil
      </button>
    </nav>
    <div style={{ height: 3, background: btn.gradient, flexShrink: 0 }} />
    <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    <div style={{
      background: "rgba(0,15,40,0.4)", backdropFilter: "blur(12px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "10px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
    }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
        🚀 Propulsé par <strong style={{ color: "rgba(255,255,255,0.4)" }}>MEDIA4</strong>
      </span>
      <img src="https://media4-duplicated-z3xl.bolt.host/logo.png" alt="Logo" style={{ height: 18, opacity: 0.25 }} onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
      <Strip h={10} style={{ width: 160, borderRadius: 5, overflow: "hidden" }} />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════
const SiteWeb = ({ url }: { url: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: B.navyDeep }}>
      <div style={{ padding: "10px 24px", background: "rgba(0,15,40,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{url}</span>
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div style={{ position: "absolute", inset: 0, background: B.navyDeep, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
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

const SelectionMois = () => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: B.navyDeep }}>
    <div style={{ padding: "14px 32px", background: "rgba(0,15,40,0.5)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
      <div style={{ padding: "6px 16px", borderRadius: 8, background: `${B.red}25`, color: B.red, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>PDF</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Sélection du Mois — {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Nos produits coup de cœur du moment</div>
      </div>
    </div>
    <div style={{ flex: 1, background: "#1a1a2e" }}>
      <iframe src="https://media4-duplicated-z3xl.bolt.host/pdf.pdf#toolbar=1&navpanes=0&view=FitH" title="PDF" style={{ width: "100%", height: "100%", border: "none" }} />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// PARTENAIRES — Toutes les cartes de même taille, centrées
// ═══════════════════════════════════════════════════════════
const Partenaires = () => {
  const [vis, setVis] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVis(true)); }, []);

  return (
    <div style={{ height: "100%", overflow: "auto", background: B.navyDeep }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${B.navy} 0%, #0D1F3C 100%)`,
        padding: "48px 48px 52px", position: "relative", overflow: "hidden",
      }}>
        {COLORS.slice(0, 4).map((c, i) => (
          <div key={i} style={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%",
            background: `radial-gradient(circle, ${c}20, transparent 70%)`,
            top: -40 + i * 30, right: -20 + i * 80, filter: "blur(30px)",
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
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: -0.5, margin: 0 }}>Nos Partenaires</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 8, fontWeight: 400 }}>L'excellence au service de vos projets</p>
        </div>
      </div>
      <Strip h={3} />

      {/* Grille flex centrée — toutes les cartes identiques */}
      <div style={{ padding: "40px 48px" }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          maxWidth: 900,
          margin: "0 auto",
        }}>
          {PARTNERS.map((p, i) => (
            <div
              key={i}
              className="partner-card"
              style={{
                width: 200,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                padding: "32px 20px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                opacity: vis ? 1 : 0,
                transform: vis ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.5s ${0.1 + i * 0.08}s cubic-bezier(0.4, 0, 0.2, 1)`,
              }}
            >
              <div style={{
                width: 100, height: 100, borderRadius: 20,
                background: "rgba(255,255,255,0.92)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", flexShrink: 0,
              }}>
                <img
                  src={p.logo}
                  alt={p.name}
                  style={{ width: 72, height: 72, objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLElement).outerHTML = `<div style="width:72px;height:72px;border-radius:14px;background:linear-gradient(135deg,${B.navy},#1A4B8C);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:24px;font-family:Outfit,sans-serif">${p.name.charAt(0)}</div>`;
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>
                  Partenaire officiel
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 36, textAlign: "center",
          padding: "24px 32px", borderRadius: 16,
          background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)",
        }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            Vous souhaitez devenir partenaire Unikalo ?<br />
            <strong style={{ color: "rgba(255,255,255,0.7)" }}>Contactez-nous</strong> pour en savoir plus.
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP — Auto-fullscreen + navigation complète
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("attract");
  const [content, setContent] = useState<BtnConfig | null>(null);

  // ⬛ AUTO-FULLSCREEN au premier clic/toucher
  useEffect(() => {
    const goFullscreen = () => {
      const el = document.documentElement as any;
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (rfs) rfs.call(el).catch(() => {});
    };
    document.addEventListener("click", goFullscreen, { once: true });
    return () => document.removeEventListener("click", goFullscreen);
  }, []);

  // Auto-return attract après 2min d'inactivité
  useEffect(() => {
    if (screen === "attract") return;
    const t = setTimeout(() => { setScreen("attract"); setContent(null); }, 120000);
    return () => clearTimeout(t);
  }, [screen, content]);

  const goAttract = useCallback(() => { setContent(null); setScreen("attract"); }, []);
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
        {screen === "attract" && <Attract onTouch={() => setScreen("home")} />}
        {screen === "home" && <Home onSelect={open} onBack={goAttract} />}
        {screen === "content" && content && (
          <Shell btn={content} onHome={goHome}>
            {renderContent()}
          </Shell>
        )}
      </div>
    </>
  );
}