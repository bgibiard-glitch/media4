import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";

const B = { red: "#C8102E", white: "#FFFFFF" };

const COLORS = [
  "#1B2A4A","#4A7FB5","#7D9B76","#C67B5C","#D4A0A0",
  "#E8C840","#B8B8B0","#2D5A3D","#6B2D3E","#006B7A",
  "#C49B3C","#BC7B7B","#6B7B3A","#A0C4D8","#A0522D","#F2EDE8",
];

const PARTNERS = [
  { name: "Licef",               logo: "https://media4-xues.vercel.app/partenaires/1.png", url: "https://www.licef.fr/",                    desc: "Enduits & mortiers"     },
  { name: "EF Factory",          logo: "https://media4-xues.vercel.app/partenaires/2.png", url: "https://ef-factory.com/fr/",                desc: "Mobilier & agencement"  },
  { name: "Couleurs & Matières", logo: "https://media4-xues.vercel.app/partenaires/3.png", url: "https://www.couleurs-et-matieres.com/",     desc: "Peintures décoratives"  },
  { name: "La Chaux Pouzzolanique", logo: "https://media4-xues.vercel.app/partenaires/4.png", url: "https://www.chaux-tilia.fr/",            desc: "Chaux naturelle"        },
  { name: "Euromair",            logo: "https://media4-xues.vercel.app/partenaires/5.png", url: "https://www.euromair.com/",                 desc: "Matériel de projection"  },
];

const VIDEO_MP4 = "https://media4-xues.vercel.app/fondecran.mp4";
const PDF_URL   = "https://media4-duplicated-z3xl.bolt.host/pdf.pdf";
const QR_URL    = "https://media4-xues.vercel.app/qrcodepdf.png";
const LOGO_URL  = "https://media4-duplicated-z3xl.bolt.host/logo.png";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
    body { font-family: 'Outfit', sans-serif; background: #000; }

    @keyframes fadeIn   { from{opacity:0}       to{opacity:1} }
    @keyframes revealUp { from{opacity:0;transform:translateY(32px) scale(.97);filter:blur(3px)} to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)} }
    @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
    @keyframes slideDown{ from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes qrFloat  { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }

    .gbtn {
      cursor:pointer; position:relative; overflow:hidden;
      transition:transform .35s cubic-bezier(.4,0,.2,1), box-shadow .35s, border-color .35s;
    }
    .gbtn:hover { transform:translateY(-5px) scale(1.012)!important; box-shadow:0 24px 60px rgba(0,0,0,.55)!important; border-color:rgba(255,255,255,.28)!important; }
    .gbtn:active { transform:scale(.985)!important; transition-duration:.1s; }
    .gbtn::after { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(135deg,rgba(255,255,255,.09) 0%,transparent 55%); opacity:0; transition:opacity .35s; }
    .gbtn:hover::after { opacity:1; }

    .pcard { transition:all .3s cubic-bezier(.4,0,.2,1); }
    .pcard:hover { transform:translateY(-8px) scale(1.04); border-color:rgba(255,255,255,.25)!important; box-shadow:0 20px 50px rgba(0,0,0,.45)!important; }

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

// ─── VIDÉO : position absolute + w/h 100% + objectFit cover
// Fonctionne en portrait ET paysage sans calcul vh/vw
const VideoBackground = () => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const play = () => v.play().catch(() => {});
    play();
    // Retry on first user interaction (iOS/restrictive browsers)
    document.addEventListener("touchstart", play, { once: true });
    document.addEventListener("click",      play, { once: true });
  }, []);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, background:"#000" }}>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
      >
        <source src={VIDEO_MP4} type="video/mp4" />
      </video>
    </div>
  );
};

interface BtnConfig {
  id:string; label:string; sub:string; icon:string;
  accent:string; gradient:string; type:string; url?:string; bgImage:string;
}

// SITE WEB EN PREMIER
const BTNS: BtnConfig[] = [
  {
    id:"site", label:"Site Web Unikalo", sub:"Explorez notre univers",
    icon:"web", accent:"#4A7FB5", gradient:"linear-gradient(135deg,#4A7FB5,#6BA3D6)",
    type:"web", url:"https://nuances-unikalo.com",
    bgImage:"https://media4-xues.vercel.app/siteUNIKALO.png",
  },
  {
    id:"selection", label:"La Sélection du Mois", sub:"Découvrez nos coups de cœur",
    icon:"star", accent:B.red, gradient:`linear-gradient(135deg,${B.red},#FF2D55)`,
    type:"pdf", bgImage:"https://media4-xues.vercel.app/laselection.png",
  },
  {
    id:"partenaires", label:"Nos Partenaires", sub:"L'excellence au quotidien",
    icon:"partners", accent:"#14B8A6", gradient:"linear-gradient(135deg,#0D9488,#14B8A6)",
    type:"partners", bgImage:"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  },
];

const Home = ({ onSelect }: { onSelect:(b:BtnConfig)=>void }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setReady(true), 100); return ()=>clearTimeout(t); }, []);

  return (
    <div style={{ position:"relative", zIndex:10, height:"100%", display:"flex", flexDirection:"column" }}>
      <Strip h={5} style={{ flexShrink:0 }} />

      {/* ZONE PRINCIPALE — space-between étire sur toute la hauteur */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        justifyContent:"space-between",
        padding:"28px 48px 24px",
        maxWidth:840, width:"100%", margin:"0 auto",
      }}>

        {/* LOGO pleine visibilité */}
        <div style={{ display:"flex", justifyContent:"center", animation:"revealUp .8s .05s cubic-bezier(.22,1,.36,1) both" }}>
          <img
            src={LOGO_URL}
            alt="Unikalo"
            style={{ height:88, width:"auto", maxWidth:"52%", objectFit:"contain", opacity:1 }}
          />
        </div>

        {/* 3 BOUTONS espacés par le flex space-between du parent */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          {BTNS.map((btn, i) => (
            <button
              key={btn.id}
              className="gbtn"
              onClick={() => onSelect(btn)}
              style={{
                display:"flex", alignItems:"center",
                height:110,
                borderRadius:22,
                background:"rgba(0,4,16,0.36)",
                backdropFilter:"blur(20px)",
                WebkitBackdropFilter:"blur(20px)",
                border:"1px solid rgba(255,255,255,0.16)",
                boxShadow:"0 6px 30px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,.06)",
                padding:0,
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(42px)",
                transition:`opacity .6s ${.1+i*.12}s cubic-bezier(.22,1,.36,1), transform .6s ${.1+i*.12}s cubic-bezier(.22,1,.36,1)`,
              }}
            >
              <div style={{ position:"absolute", inset:0, borderRadius:22, backgroundImage:`url(${btn.bgImage})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.28 }} />
              <div style={{ position:"absolute", inset:0, borderRadius:22, background:"linear-gradient(90deg,rgba(0,4,16,.75) 0%,rgba(0,4,16,.25) 55%,rgba(0,4,16,.48) 100%)" }} />
              <div style={{ position:"absolute", top:0, left:0, bottom:0, width:5, borderRadius:"22px 0 0 22px", background:btn.gradient, boxShadow:`0 0 20px ${btn.accent}70` }} />
              <div style={{ position:"relative", zIndex:2, flex:1, paddingLeft:38 }}>
                <div style={{ fontSize:23, fontWeight:800, color:"#fff", letterSpacing:-.3, textShadow:"0 2px 12px rgba(0,0,0,.7)", lineHeight:1.2 }}>{btn.label}</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.6)", marginTop:5 }}>{btn.sub}</div>
              </div>
              <div style={{ position:"relative", zIndex:2, marginRight:30, width:42, height:42, borderRadius:12, flexShrink:0, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.13)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name="arrow" size={20} color="rgba(255,255,255,.7)" />
              </div>
            </button>
          ))}
        </div>

        {/* SLOGAN — tout sur une seule ligne, taille ajustée */}
        <div style={{ textAlign:"center", animation:"revealUp 1s .65s cubic-bezier(.22,1,.36,1) both" }}>
          <h1 style={{ fontSize:20, fontWeight:800, lineHeight:1, color:"#fff", whiteSpace:"nowrap", textShadow:"0 3px 24px rgba(0,0,0,.65)" }}>
            Unikalo,{" "}
            <span style={{
              background:`linear-gradient(135deg,${B.red},#FF4D6A,#FF2D55,${B.red})`,
              backgroundSize:"300% auto",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              animation:"shimmer 3s linear infinite",
            }}>1er fabricant français indépendant</span>
            {" "}de peintures bâtiment
          </h1>
          {/* "Depuis 1936" bien visible */}
          <div style={{ marginTop:10, fontSize:13, fontWeight:600, color:"rgba(255,255,255,.65)", letterSpacing:4, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
            Fabricant de peintures depuis 1936
          </div>
        </div>
      </div>

      {/* FOOTER — Propulsé par MEDIA4 bien visible */}
      <footer style={{
        position:"relative", zIndex:20, flexShrink:0,
        background:"rgba(0,8,24,.55)", backdropFilter:"blur(14px)",
        borderTop:"1px solid rgba(255,255,255,.1)",
        padding:"13px 44px", display:"flex", alignItems:"center", justifyContent:"space-between",
        animation:"fadeIn .6s .9s ease both",
      }}>
        <span style={{ fontSize:12, color:"rgba(255,255,255,.7)", letterSpacing:2, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
          Propulsé par <strong style={{ color:"#fff" }}>MEDIA4 🚀</strong>
        </span>
        <img src={LOGO_URL} alt="Unikalo" style={{ height:16, opacity:.3 }} onError={(e)=>{ (e.target as HTMLElement).style.display="none"; }} />
        <span style={{ fontSize:11, color:"rgba(255,255,255,.45)", fontFamily:"'JetBrains Mono',monospace" }}>
          {new Date().toLocaleDateString("fr-FR",{ day:"numeric", month:"long", year:"numeric" })}
        </span>
      </footer>
      <Strip h={4} style={{ flexShrink:0 }} />
    </div>
  );
};

const Shell = ({ btn, onHome, children }: { btn:BtnConfig; onHome:()=>void; children:ReactNode }) => (
  <div style={{ position:"relative", zIndex:10, height:"100%", display:"flex", flexDirection:"column" }}>
    <nav style={{
      background:"rgba(0,8,24,.6)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      borderBottom:"1px solid rgba(255,255,255,.09)",
      padding:"0 30px", display:"flex", alignItems:"center", gap:14,
      height:62, flexShrink:0, animation:"slideDown .4s ease both",
    }}>
      <button onClick={onHome} style={{ width:40, height:40, borderRadius:11, border:"1px solid rgba(255,255,255,.12)", background:"rgba(255,255,255,.06)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon name="back" size={18} color="rgba(255,255,255,.65)" />
      </button>
      <div style={{ width:1, height:26, background:"rgba(255,255,255,.1)" }} />
      <div style={{ display:"flex", alignItems:"center", gap:11, flex:1 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:btn.gradient, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 14px ${btn.accent}35` }}>
          <Icon name={btn.icon} size={17} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{btn.label}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.42)" }}>{btn.sub}</div>
        </div>
      </div>
      <img src={LOGO_URL} alt="Logo" style={{ height:24 }} onError={(e)=>{ (e.target as HTMLElement).style.display="none"; }} />
      <button onClick={onHome} style={{ padding:"9px 20px", borderRadius:11, border:"none", background:B.red, cursor:"pointer", color:"#fff", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:7, boxShadow:`0 4px 18px ${B.red}45` }}>
        <Icon name="home" size={16} color="#fff" /> Accueil
      </button>
    </nav>
    <div style={{ height:3, background:btn.gradient, flexShrink:0 }} />
    <div style={{ flex:1, overflow:"hidden", animation:"fadeIn .4s .1s ease both" }}>{children}</div>
    <div style={{ background:"rgba(0,8,24,.55)", backdropFilter:"blur(12px)", borderTop:"1px solid rgba(255,255,255,.08)", padding:"9px 30px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
      <span style={{ fontSize:11, color:"rgba(255,255,255,.6)", letterSpacing:2, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>
        Propulsé par <strong style={{ color:"rgba(255,255,255,.85)" }}>MEDIA4 🚀</strong>
      </span>
      <img src={LOGO_URL} alt="Unikalo" style={{ height:14, opacity:.25 }} onError={(e)=>{ (e.target as HTMLElement).style.display="none"; }} />
      <Strip h={9} style={{ width:120, borderRadius:4, overflow:"hidden" }} />
    </div>
  </div>
);

const SelectionMois = () => {
  const [vis, setVis]         = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    setTimeout(()=>setVis(true), 100);
    setIsAndroid(/Android/i.test(navigator.userAgent));
  }, []);
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:"rgba(0,8,24,.65)" }}>
      <div style={{ padding:"20px 34px", flexShrink:0, background:`linear-gradient(135deg,rgba(200,16,46,.15),rgba(0,16,44,.55))`, borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", gap:26, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:`radial-gradient(circle,${B.red}18,transparent 70%)`, filter:"blur(38px)" }} />
        <div style={{ flex:1, position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:8, background:`${B.red}25`, border:`1px solid ${B.red}35`, marginBottom:9 }}>
            <Icon name="star" size={13} color={B.red} />
            <span style={{ fontSize:11, color:B.red, fontWeight:700, letterSpacing:1, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>
              {new Date().toLocaleDateString("fr-FR",{ month:"long", year:"numeric" })}
            </span>
          </div>
          <h2 style={{ fontSize:23, fontWeight:900, color:"#fff", letterSpacing:-.4, margin:0 }}>La Sélection du Mois</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.45)", marginTop:4 }}>Nos produits coup de cœur sélectionnés par nos experts</p>
        </div>
        <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:7, opacity:vis?1:0, transform:vis?"scale(1)":"scale(.88)", transition:"all .6s .3s cubic-bezier(.22,1,.36,1)" }}>
          <div style={{ background:"#fff", borderRadius:13, padding:7, boxShadow:"0 8px 32px rgba(0,0,0,.35)", animation:"qrFloat 4s ease-in-out infinite" }}>
            <img src={QR_URL} alt="QR" style={{ width:84, height:84, borderRadius:7, display:"block" }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 11px", borderRadius:100, background:"rgba(255,255,255,.09)", border:"1px solid rgba(255,255,255,.12)" }}>
            <Icon name="download" size={11} color="rgba(255,255,255,.65)" />
            <span style={{ fontSize:9, color:"rgba(255,255,255,.55)", fontWeight:600, letterSpacing:1, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace" }}>Scannez-moi</span>
          </div>
        </div>
      </div>
      <div style={{ flex:1, background:"#0c1016", display:"flex", flexDirection:"column" }}>
        {isAndroid ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:30, padding:36, animation:"fadeIn .5s ease both" }}>
            <div style={{ background:"#fff", borderRadius:20, padding:15, boxShadow:"0 20px 70px rgba(0,0,0,.6)", animation:"qrFloat 4s ease-in-out infinite" }}>
              <img src={QR_URL} alt="QR PDF" style={{ width:170, height:170, borderRadius:13, display:"block" }} />
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:21, fontWeight:800, color:"#fff", marginBottom:9 }}>Scannez pour voir la sélection</p>
              <p style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.7 }}>Ouvrez l'appareil photo de votre téléphone<br/>et pointez-le vers le QR code</p>
            </div>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:11, padding:"14px 36px", borderRadius:15, background:`linear-gradient(135deg,${B.red},#FF2D55)`, color:"#fff", textDecoration:"none", fontSize:15, fontWeight:700, boxShadow:`0 8px 30px ${B.red}50` }}>
              <Icon name="download" size={19} color="#fff" /> Ouvrir le PDF
            </a>
          </div>
        ) : (
          <iframe src={`${PDF_URL}#toolbar=1&navpanes=0&view=FitH`} title="Sélection du mois" style={{ width:"100%", height:"100%", border:"none", flex:1 }} />
        )}
      </div>
    </div>
  );
};

const SiteWeb = ({ url }: { url:string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"9px 20px", background:"rgba(0,8,24,.6)", borderBottom:"1px solid rgba(255,255,255,.08)", flexShrink:0, display:"flex" }}>
        <div style={{ flex:1, background:"rgba(255,255,255,.05)", borderRadius:9, padding:"9px 15px", display:"flex", alignItems:"center", gap:8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"rgba(255,255,255,.42)" }}>{url}</span>
        </div>
      </div>
      <div style={{ flex:1, position:"relative" }}>
        {loading && (
          <div style={{ position:"absolute", inset:0, background:"rgba(0,8,24,.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:18 }}>
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

// PARTENAIRES — sans carré derrière les logos, pleine page
const Partenaires = () => {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(()=>setVis(true), 80); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{ height:"100%", overflow:"auto", background:"rgba(0,8,24,.7)" }}>
      {/* Header simplifié — titre fixe sans date */}
      <div style={{ background:"linear-gradient(135deg,rgba(13,148,136,.18),rgba(0,16,44,.6))", padding:"32px 44px 36px", position:"relative", overflow:"hidden", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        {COLORS.slice(0,4).map((c,i) => (
          <div key={i} style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:`radial-gradient(circle,${c}18,transparent 70%)`, top:-25+i*22, right:i*65, filter:"blur(26px)" }} />
        ))}
        <div style={{ position:"relative", zIndex:2 }}>
          <h2 style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:-.5, margin:0 }}>Nos Partenaires</h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", marginTop:7 }}>L'excellence au service de vos projets</p>
        </div>
      </div>
      <Strip h={3} />
      {/* Grille pleine largeur */}
      <div style={{ padding:"28px 36px", display:"flex", flexWrap:"wrap", gap:16, justifyContent:"center" }}>
        {PARTNERS.map((p,i) => (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pcard"
            style={{
              // Pleine largeur : 2 colonnes qui remplissent
              flex:"1 1 calc(50% - 10px)",
              minWidth:200,
              borderRadius:18,
              border:"1px solid rgba(255,255,255,.1)",
              backdropFilter:"blur(10px)",
              padding:"26px 20px",
              display:"flex", flexDirection:"column", alignItems:"center", gap:12,
              boxShadow:"0 4px 22px rgba(0,0,0,.25)",
              background:"rgba(255,255,255,.05)",
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(18px)",
              transition:`all .45s ${.08+i*.07}s cubic-bezier(.4,0,.2,1)`,
              cursor:"pointer", textDecoration:"none",
            }}
          >
            {/* Logo sans carré blanc — fond transparent */}
            <img
              src={p.logo}
              alt={p.name}
              style={{ width:70, height:70, objectFit:"contain", filter:"brightness(0) invert(1)" }}
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                const div = document.createElement("div");
                div.style.cssText = `width:70px;height:70px;border-radius:14px;background:linear-gradient(135deg,#0D9488,#14B8A6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px;font-family:Outfit,sans-serif`;
                div.textContent = p.name.charAt(0);
                el.parentNode?.insertBefore(div, el.nextSibling);
              }}
            />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>{p.name}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.38)", marginTop:3, fontFamily:"'JetBrains Mono',monospace", letterSpacing:.4 }}>{p.desc}</div>
            </div>
          </a>
        ))}
      </div>
      <div style={{ padding:"0 36px 28px", textAlign:"center" }}>
        <div style={{ padding:"18px 24px", borderRadius:14, background:"rgba(255,255,255,.03)", border:"1px dashed rgba(255,255,255,.1)" }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.4)", lineHeight:1.7 }}>
            Vous souhaitez devenir partenaire Unikalo ?<br/>
            <strong style={{ color:"rgba(255,255,255,.72)" }}>Contactez-nous</strong> pour en savoir plus.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [screen,  setScreen]  = useState<"home"|"content">("home");
  const [content, setContent] = useState<BtnConfig|null>(null);

  useEffect(() => {
    if (screen === "home") return;
    const t = setTimeout(() => { setScreen("home"); setContent(null); }, 120000);
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