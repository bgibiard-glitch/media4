import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";

const RED  = "#C8102E";

const COLORS = [
  "#1B2A4A","#4A7FB5","#7D9B76","#C67B5C","#D4A0A0",
  "#E8C840","#B8B8B0","#2D5A3D","#6B2D3E","#006B7A",
  "#C49B3C","#BC7B7B","#6B7B3A","#A0C4D8","#A0522D","#F2EDE8",
];

const PARTNERS = [
  { name:"Licef",                  logo:"https://media4-xues.vercel.app/partenaires/1.png", url:"https://www.licef.fr/",                 desc:"Enduits & mortiers"    },
  { name:"EF Factory",             logo:"https://media4-xues.vercel.app/partenaires/2.png", url:"https://ef-factory.com/fr/",             desc:"Mobilier & agencement" },
  { name:"Couleurs & Matières",    logo:"https://media4-xues.vercel.app/partenaires/3.png", url:"https://www.couleurs-et-matieres.com/",  desc:"Peintures décoratives"  },
  { name:"La Chaux Pouzzolanique", logo:"https://media4-xues.vercel.app/partenaires/4.png", url:"https://www.chaux-tilia.fr/",            desc:"Chaux naturelle"        },
  { name:"Euromair",               logo:"https://media4-xues.vercel.app/partenaires/5.png", url:"https://www.euromair.com/",              desc:"Matériel de projection"  },
];

const VIDEO_MP4 = "https://media4-xues.vercel.app/fondecran.mp4";
const PDF_URL   = "https://media4-xues.vercel.app/pdf.pdf";
const QR_URL    = "https://media4-xues.vercel.app/qrcodepdf.png";
const LOGO_URL  = "https://media4-duplicated-z3xl.bolt.host/logo.png";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html, body, #root { width:100%; height:100%; overflow:hidden; }
    body { font-family:'Outfit',sans-serif; background:#000; }

    @keyframes fadeIn   { from{opacity:0}       to{opacity:1} }
    @keyframes revealUp { from{opacity:0;transform:translateY(30px) scale(.97);filter:blur(3px)} to{opacity:1;transform:none;filter:blur(0)} }
    @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes slideDown{ from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:none} }
    @keyframes qrPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.3)} 50%{box-shadow:0 0 0 8px rgba(255,255,255,0)} }

    .gbtn {
      cursor:pointer; position:relative; overflow:hidden;
      transition:transform .32s cubic-bezier(.4,0,.2,1), box-shadow .32s, border-color .32s;
    }
    .gbtn:hover { transform:translateY(-6px) scale(1.014)!important; box-shadow:0 28px 64px rgba(0,0,0,.6)!important; border-color:rgba(255,255,255,.3)!important; }
    .gbtn:active { transform:scale(.985)!important; transition-duration:.1s; }
    .gbtn::after { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(135deg,rgba(255,255,255,.1) 0%,transparent 55%); opacity:0; transition:opacity .32s; }
    .gbtn:hover::after { opacity:1; }

    .pcard { transition:all .28s cubic-bezier(.4,0,.2,1); }
    .pcard:hover { transform:translateY(-6px) scale(1.03); border-color:rgba(255,255,255,.28)!important; }

    ::-webkit-scrollbar { width:3px; }
    ::-webkit-scrollbar-thumb { background:#C8102E40; border-radius:4px; }
  `}</style>
);

const Strip = ({ h=4, style={} }: { h?:number; style?:CSSProperties }) => (
  <div style={{ display:"flex", height:h, ...style }}>
    {COLORS.map((c,i) => <div key={i} style={{ flex:1, background:c }} />)}
  </div>
);

const Icon = ({ name, size=24, color="currentColor" }: { name:string; size?:number; color?:string }) => {
  const P: Record<string,ReactNode> = {
    web:      <><circle cx="12" cy="12" r="10" strokeWidth="1.5"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="1.5"/></>,
    partners: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="1.5"/></>,
    back:     <path d="M19 12H5m7-7l-7 7 7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    home:     <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    arrow:    <path d="M7 17L17 7M17 7H7M17 7v10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
    star:     <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="1.5"/>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="1.5"/><polyline points="7 10 12 15 17 10" strokeWidth="1.5"/><line x1="12" y1="15" x2="12" y2="3" strokeWidth="1.5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      {P[name]}
    </svg>
  );
};

// ─── VIDÉO — rendu via Canvas (solution définitive anti-freeze/clignotement)
// La vidéo tourne en hidden, le canvas recopie chaque frame via requestAnimationFrame.
// Le navigateur n'affiche JAMAIS la vidéo directement → zéro flash, zéro gap de loop.
const VideoBackground = () => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Adapter la résolution du canvas à l'écran
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    let raf: number;

    const draw = () => {
      if (ctx && video.readyState >= 2) {
        // Cover : calcule src rect pour centrer/rogner comme object-fit:cover
        const vw = video.videoWidth  || canvas.width;
        const vh = video.videoHeight || canvas.height;
        const cw = canvas.width;
        const ch = canvas.height;
        const scale = Math.max(cw / vw, ch / vh);
        const sw    = cw / scale;
        const sh    = ch / scale;
        const sx    = (vw - sw) / 2;
        const sy    = (vh - sh) / 2;
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
      }
      raf = requestAnimationFrame(draw);
    };

    video.muted = true;
    video.play().catch(() => {});
    raf = requestAnimationFrame(draw);

    // Fallback si la vidéo se met en pause (veille réseau)
    const onPause = () => { if (!video.ended) video.play().catch(() => {}); };
    video.addEventListener("pause", onPause);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, background:"#000" }}>
      {/* Vidéo cachée — le canvas l'affiche */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline preload="auto"
        style={{ display:"none" }}
      >
        <source src={VIDEO_MP4} type="video/mp4" />
      </video>
      {/* Canvas = ce que l'utilisateur voit, jamais de flash */}
      <canvas
        ref={canvasRef}
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"block" }}
      />
    </div>
  );
};

// ─── TYPES & CONFIG BOUTONS ────────────────────────────────────────
interface BtnConfig { id:string; label:string; sub:string; icon:string; accent:string; gradient:string; type:string; url?:string; bgImage:string; }

const BTNS: BtnConfig[] = [
  { id:"site",         label:"Site Web Unikalo",        sub:"Explorez notre univers",         icon:"web",      accent:"#4A7FB5", gradient:"linear-gradient(135deg,#4A7FB5,#6BA3D6)", type:"web",      url:"https://unikalo.com",                                         bgImage:"https://media4-xues.vercel.app/siteUNIKALO.png" },
  { id:"selection",    label:"La Sélection du Mois",    sub:"Découvrez nos coups de cœur",    icon:"star",     accent:RED,       gradient:`linear-gradient(135deg,${RED},#FF2D55)`,  type:"pdf",                                                                         bgImage:"https://media4-xues.vercel.app/laselection.png" },
  { id:"partenaires",  label:"Nos Partenaires du Jour", sub:"L'excellence au quotidien",      icon:"partners", accent:"#14B8A6", gradient:"linear-gradient(135deg,#0D9488,#14B8A6)",type:"partners",                                                                    bgImage:"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80" },
];

// ─── HOME ─────────────────────────────────────────────────────────
const Home = ({ onSelect }: { onSelect:(b:BtnConfig)=>void }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setReady(true), 100); return ()=>clearTimeout(t); }, []);

  return (
    <div style={{ position:"relative", zIndex:10, height:"100%", display:"flex", flexDirection:"column" }}>
      <Strip h={5} style={{ flexShrink:0 }} />

      <div style={{
        flex:1,
        display:"flex", flexDirection:"column",
        justifyContent:"space-between",
        padding:"16px 44px 18px",
        maxWidth:820, width:"100%", margin:"0 auto",
      }}>

        {/* LOGO */}
        <div style={{ display:"flex", justifyContent:"center", animation:"revealUp .7s .05s cubic-bezier(.22,1,.36,1) both", marginTop:40 }}>
          <img src={LOGO_URL} alt="Unikalo" style={{ height:130, width:"auto", maxWidth:"65%", objectFit:"contain", opacity:1 }} />
        </div>

        {/* 3 BOUTONS — gap plus grand */}
        <div style={{ display:"flex", flexDirection:"column", gap:44 }}>
          {BTNS.map((btn, i) => (
            <button
              key={btn.id}
              className="gbtn"
              onClick={() => onSelect(btn)}
              style={{
                display:"flex", alignItems:"center",
                height:118,
                borderRadius:22,
                // fond plus transparent pour voir l'image
                background:"rgba(0,4,14,0.28)",
                backdropFilter:"blur(16px)",
                WebkitBackdropFilter:"blur(16px)",
                border:"1px solid rgba(255,255,255,0.18)",
                boxShadow:"0 8px 36px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,.06)",
                padding:0,
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(40px)",
                transition:`opacity .6s ${.1+i*.13}s cubic-bezier(.22,1,.36,1), transform .6s ${.1+i*.13}s cubic-bezier(.22,1,.36,1)`,
              }}
            >
              {/* IMAGE DE FOND — beaucoup plus visible */}
              <div style={{ position:"absolute", inset:0, borderRadius:22, backgroundImage:`url(${btn.bgImage})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.55 }} />
              {/* Overlay léger juste pour lisibilité du texte */}
              <div style={{ position:"absolute", inset:0, borderRadius:22, background:"linear-gradient(90deg,rgba(0,4,14,.78) 0%,rgba(0,4,14,.18) 50%,rgba(0,4,14,.40) 100%)" }} />
              {/* Barre colorée gauche */}
              <div style={{ position:"absolute", top:0, left:0, bottom:0, width:5, borderRadius:"22px 0 0 22px", background:btn.gradient, boxShadow:`0 0 22px ${btn.accent}80` }} />
              {/* Texte */}
              <div style={{ position:"relative", zIndex:2, flex:1, paddingLeft:36 }}>
                <div style={{ fontSize:24, fontWeight:800, color:"#fff", letterSpacing:-.3, textShadow:"0 2px 14px rgba(0,0,0,.85)", lineHeight:1.2 }}>{btn.label}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.75)", marginTop:5, textShadow:"0 1px 6px rgba(0,0,0,.7)" }}>{btn.sub}</div>
              </div>
              {/* Flèche */}
              <div style={{ position:"relative", zIndex:2, marginRight:28, width:42, height:42, borderRadius:12, flexShrink:0, background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="arrow" size={20} color="rgba(255,255,255,.85)" />
              </div>
            </button>
          ))}
        </div>

        {/* SLOGAN — gros, une seule ligne, U en rouge */}
        <div style={{ textAlign:"center", animation:"revealUp 1s .62s cubic-bezier(.22,1,.36,1) both" }}>
          <h1 style={{ fontSize:28, fontWeight:900, lineHeight:1.15, color:"#fff", textAlign:"center", textShadow:"0 3px 20px rgba(0,0,0,.8)", letterSpacing:-.3 }}>
            <span style={{ color:RED }}>U</span>nikalo,{" "}
            <span style={{ background:`linear-gradient(135deg,${RED},#FF4D6A,#FF2D55,${RED})`, backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 3s linear infinite" }}>
              1er fabricant français indépendant
            </span>
            {" "}de peintures bâtiment
          </h1>
          <div style={{ marginTop:12, fontSize:16, fontWeight:700, color:"rgba(255,255,255,.85)", letterSpacing:4, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
            Fabricant de peintures depuis 1936
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        position:"relative", zIndex:20, flexShrink:0,
        background:"rgba(0,6,20,.6)", backdropFilter:"blur(14px)",
        borderTop:"1px solid rgba(255,255,255,.12)",
        padding:"13px 44px", display:"flex", alignItems:"center", justifyContent:"space-between",
        animation:"fadeIn .6s .9s ease both",
      }}>
        <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.75)", letterSpacing:2, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
          Propulsé par <strong style={{ color:"#fff" }}>MEDIA4 🚀</strong>
        </span>
        <img src={LOGO_URL} alt="" style={{ height:16, opacity:.3 }} onError={(e)=>{ (e.target as HTMLElement).style.display="none"; }} />
        <span style={{ fontSize:11, color:"rgba(255,255,255,.5)", fontFamily:"'JetBrains Mono',monospace" }}>
          {new Date().toLocaleDateString("fr-FR",{ day:"numeric", month:"long", year:"numeric" })}
        </span>
      </footer>
      <Strip h={4} style={{ flexShrink:0 }} />
    </div>
  );
};

// ─── SHELL ─────────────────────────────────────────────────────────
const Shell = ({ btn, onHome, children }: { btn:BtnConfig; onHome:()=>void; children:ReactNode }) => (
  <div style={{ position:"relative", zIndex:10, height:"100%", display:"flex", flexDirection:"column" }}>
    <nav style={{ background:"rgba(0,6,20,.65)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.1)", padding:"0 28px", display:"flex", alignItems:"center", gap:14, height:60, flexShrink:0, animation:"slideDown .4s ease both" }}>
      <button onClick={onHome} style={{ width:40, height:40, borderRadius:11, border:"1px solid rgba(255,255,255,.14)", background:"rgba(255,255,255,.07)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon name="back" size={17} color="rgba(255,255,255,.7)" />
      </button>
      <div style={{ width:1, height:24, background:"rgba(255,255,255,.12)" }} />
      <div style={{ display:"flex", alignItems:"center", gap:11, flex:1 }}>
        <div style={{ width:33, height:33, borderRadius:10, background:btn.gradient, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 14px ${btn.accent}40` }}>
          <Icon name={btn.icon} size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{btn.label}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.45)" }}>{btn.sub}</div>
        </div>
      </div>
      <img src={LOGO_URL} alt="" style={{ height:24 }} onError={(e)=>{ (e.target as HTMLElement).style.display="none"; }} />
      <button onClick={onHome} style={{ padding:"9px 20px", borderRadius:11, border:"none", background:RED, cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:7, boxShadow:`0 4px 18px ${RED}50` }}>
        <Icon name="home" size={16} color="#fff" /> Accueil
      </button>
    </nav>
    <div style={{ height:3, background:btn.gradient, flexShrink:0 }} />
    <div style={{ flex:1, overflow:"hidden", animation:"fadeIn .4s .08s ease both" }}>{children}</div>
    <div style={{ background:"rgba(0,6,20,.6)", backdropFilter:"blur(12px)", borderTop:"1px solid rgba(255,255,255,.1)", padding:"9px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
      <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.7)", letterSpacing:2, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
        Propulsé par <strong style={{ color:"#fff" }}>MEDIA4 🚀</strong>
      </span>
      <Strip h={9} style={{ width:120, borderRadius:4, overflow:"hidden" }} />
    </div>
  </div>
);

// ─── PAGE : SÉLECTION PDF ──────────────────────────────────────────
// Iframe directe Vercel (primary) → Google Docs Viewer (fallback auto)
const SelectionMois = () => {
  const [vis,    setVis]   = useState(false);
  const [src,    setSrc]   = useState(PDF_URL);
  const [loaded, setLoaded] = useState(false);
  const [tries,  setTries]  = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => setVis(true), 80);
    // Si l'iframe ne charge pas en 10s → bascule sur Google Docs Viewer
    timerRef.current = setTimeout(() => {
      if (!loaded && tries === 0) {
        setTries(1);
        setLoaded(false);
        setSrc(`https://docs.google.com/viewer?url=${encodeURIComponent(PDF_URL)}&embedded=true`);
        // 2ème timeout : si Google Docs échoue aussi → QR
        timerRef.current = setTimeout(() => {
          if (!loaded) setTries(2);
        }, 12000);
      }
    }, 10000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const onLoad = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoaded(true);
  };

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"rgba(0,6,20,.85)" }}>

      {/* Header */}
      <div style={{ padding:"14px 24px", flexShrink:0, background:`linear-gradient(135deg,rgba(200,16,46,.2),rgba(0,14,40,.6))`, borderBottom:"1px solid rgba(255,255,255,.08)", display:"flex", alignItems:"center", gap:18, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:`radial-gradient(circle,${RED}20,transparent 70%)`, filter:"blur(30px)" }} />
        <div style={{ flex:1, position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 11px", borderRadius:7, background:`${RED}28`, border:`1px solid ${RED}40`, marginBottom:6 }}>
            <Icon name="star" size={12} color={RED} />
            <span style={{ fontSize:10, color:RED, fontWeight:700, letterSpacing:1, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
              {new Date().toLocaleDateString("fr-FR",{ month:"long", year:"numeric" })}
            </span>
          </div>
          <h2 style={{ fontSize:20, fontWeight:900, color:"#fff", letterSpacing:-.3, margin:0 }}>La Sélection du Mois</h2>
          <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:2 }}>Nos produits coup de cœur sélectionnés par nos experts</p>
        </div>
        {/* QR cliquable */}
        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity:vis?1:0, transform:vis?"scale(1)":"scale(.85)", transition:"all .5s .2s cubic-bezier(.22,1,.36,1)" }}>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" style={{ display:"block" }}>
            <div style={{ background:"#fff", borderRadius:13, padding:7, boxShadow:"0 0 0 3px rgba(255,255,255,.25), 0 8px 28px rgba(0,0,0,.5)", animation:"qrPulse 3s ease-in-out infinite" }}>
              <img src={QR_URL} alt="QR" style={{ width:88, height:88, borderRadius:6, display:"block" }} />
            </div>
          </a>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:100, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.28)", cursor:"pointer" }}>
              <Icon name="download" size={10} color="#fff" />
              <span style={{ fontSize:9, color:"#fff", fontWeight:700, letterSpacing:1, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>Télécharger</span>
            </div>
          </a>
        </div>
      </div>

      {/* Corps */}
      <div style={{ flex:1, position:"relative", background:"#f1f3f4" }}>

        {/* Spinner tant que pas chargé */}
        {!loaded && tries < 2 && (
          <div style={{ position:"absolute", inset:0, background:"#1a1a2e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, zIndex:2, pointerEvents:"none" }}>
            <div style={{ display:"flex", gap:6 }}>
              {[RED,"#4A7FB5","#14B8A6","#E8C840","#7D9B76","#C67B5C"].map((c,i) => (
                <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, animation:`float .9s ${i*.12}s ease-in-out infinite` }} />
              ))}
            </div>
            <p style={{ color:"rgba(255,255,255,.45)", fontSize:13 }}>
              {tries === 0 ? "Chargement du catalogue…" : "Connexion en cours…"}
            </p>
          </div>
        )}

        {/* Fallback final : QR + lien direct */}
        {tries >= 2 && (
          <div style={{ position:"absolute", inset:0, background:"#1a1a2e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, padding:36, textAlign:"center", zIndex:3 }}>
            <div style={{ background:"#fff", borderRadius:20, padding:14, boxShadow:"0 0 0 4px rgba(255,255,255,.2), 0 16px 50px rgba(0,0,0,.6)", animation:"qrPulse 3s ease-in-out infinite" }}>
              <img src={QR_URL} alt="QR" style={{ width:180, height:180, borderRadius:12, display:"block" }} />
            </div>
            <p style={{ fontSize:19, fontWeight:800, color:"#fff" }}>Scannez pour voir le catalogue</p>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 32px", borderRadius:14, background:`linear-gradient(135deg,${RED},#FF2D55)`, color:"#fff", textDecoration:"none", fontSize:15, fontWeight:700, boxShadow:`0 8px 26px ${RED}55` }}>
              <Icon name="download" size={18} color="#fff" /> Ouvrir le PDF
            </a>
          </div>
        )}

        {/* Iframe principaale */}
        {tries < 2 && (
          <iframe
            key={src}
            src={src}
            title="Sélection du mois"
            onLoad={onLoad}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none", display:"block" }}
          />
        )}
      </div>
    </div>
  );
};
// ─── PAGE : SITE WEB ───────────────────────────────────────────────
const SiteWeb = ({ url }: { url:string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"9px 20px", background:"rgba(0,6,20,.65)", borderBottom:"1px solid rgba(255,255,255,.09)", flexShrink:0, display:"flex" }}>
        <div style={{ flex:1, background:"rgba(255,255,255,.06)", borderRadius:9, padding:"9px 14px", display:"flex", alignItems:"center", gap:8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(255,255,255,.45)" }}>{url}</span>
        </div>
      </div>
      <div style={{ flex:1, position:"relative" }}>
        {loading && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,6,20,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:16 }}>
                {COLORS.slice(0,6).map((c,i) => <div key={i} style={{ width:11, height:11, borderRadius:"50%", background:c, animation:`float .9s ${i*.12}s ease-in-out infinite` }} />)}
              </div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,.4)", fontWeight:500 }}>Chargement…</div>
            </div>
          </div>
        )}
        <iframe src={url} title="Site web" style={{ width:"100%", height:"100%", border:"none" }} onLoad={()=>setLoading(false)} />
      </div>
    </div>
  );
};

// ─── PAGE : PARTENAIRES — logos grands sans encadrement ────────────
const Partenaires = () => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setVis(true), 80); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{ height:"100%", overflow:"auto", background:"rgba(0,6,20,.75)" }}>
      <div style={{ background:"linear-gradient(135deg,rgba(13,148,136,.2),rgba(0,14,40,.65))", padding:"30px 40px 34px", position:"relative", overflow:"hidden", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        {COLORS.slice(0,4).map((c,i) => (
          <div key={i} style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:`radial-gradient(circle,${c}20,transparent 70%)`, top:-20+i*20, right:i*60, filter:"blur(24px)" }} />
        ))}
        <div style={{ position:"relative", zIndex:2 }}>
          <h2 style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:-.5, margin:0 }}>Nos Partenaires du Jour</h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.52)", marginTop:6 }}>L'excellence au service de vos projets</p>
        </div>
      </div>
      <Strip h={3} />

      {/* GRILLE — logos directs, aucun encadrement, aucune carte */}
      <div style={{ padding:"20px 24px", display:"flex", flexWrap:"wrap", gap:36, justifyContent:"center", alignItems:"center" }}>
        {PARTNERS.map((p,i) => (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pcard"
            style={{
              flex:"1 1 calc(50% - 20px)",
              minWidth:220,
              display:"flex", flexDirection:"column", alignItems:"center", gap:14,
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(14px)",
              transition:`all .4s ${.06+i*.07}s cubic-bezier(.4,0,.2,1)`,
              cursor:"pointer", textDecoration:"none",
              padding:"8px",
              background:"transparent",
              border:"none",
            }}
          >
            {/* Logo — hauteur fixe identique pour tous, largeur auto */}
            <img
              src={p.logo}
              alt={p.name}
              style={{ height:160, width:"auto", maxWidth:260, objectFit:"contain" }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                const d = document.createElement("div");
                d.style.cssText = "height:160px;width:260px;display:flex;align-items:center;justify-content:center;font-size:72px;font-weight:900;color:rgba(255,255,255,.85);font-family:Outfit,sans-serif";
                d.textContent = p.name.charAt(0);
                el.parentNode?.insertBefore(d, el.nextSibling);
              }}
            />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:17, fontWeight:700, color:"#fff", textShadow:"0 2px 10px rgba(0,0,0,.7)" }}>{p.name}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginTop:3, fontFamily:"'JetBrains Mono',monospace" }}>{p.desc}</div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ padding:"4px 30px 28px", textAlign:"center" }}>
        <div style={{ padding:"16px 22px", borderRadius:14, background:"rgba(255,255,255,.03)", border:"1px dashed rgba(255,255,255,.1)" }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.4)", lineHeight:1.7 }}>
            Vous souhaitez devenir partenaire Unikalo ?<br/>
            <strong style={{ color:"rgba(255,255,255,.72)" }}>Contactez-nous</strong> pour en savoir plus.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── APP ───────────────────────────────────────────────────────────
export default function App() {
  const [screen,  setScreen]  = useState<"home"|"content">("home");
  const [content, setContent] = useState<BtnConfig|null>(null);

  useEffect(() => {
    if (screen === "home") return;
    const t = setTimeout(() => { setScreen("home"); setContent(null); }, 120_000);
    return () => clearTimeout(t);
  }, [screen, content]);

  const goHome = useCallback(() => { setContent(null); setScreen("home"); }, []);
  const open   = useCallback((btn:BtnConfig) => { setContent(btn); setScreen("content"); }, []);

  const renderContent = () => {
    if (!content) return null;
    switch (content.type) {
      case "web":      return <SiteWeb url={content.url||""} />;
      case "pdf":      return <SelectionMois />;
      case "partners": return <Partenaires />;
      default:         return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ width:"100vw", height:"100vh", position:"relative", overflow:"hidden", background:"#000" }}>
        <VideoBackground />
        {screen === "home"    && <Home onSelect={open} />}
        {screen === "content" && content && <Shell btn={content} onHome={goHome}>{renderContent()}</Shell>}
      </div>
    </>
  );
}