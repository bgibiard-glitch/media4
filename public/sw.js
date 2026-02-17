// ═══════════════════════════════════════════════════════════
// UNIKALO TOTEM — Service Worker (PWA)
// Cache-first pour assets, network-first pour API/vidéo
// 🚀 Propulsé par Media4
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = "unikalo-totem-v1";
const STATIC_CACHE = "unikalo-static-v1";
const DYNAMIC_CACHE = "unikalo-dynamic-v1";

// Assets à pré-cacher au install
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "https://media4-duplicated-z3xl.bolt.host/logo.png",
  "https://media4-duplicated-z3xl.bolt.host/pdf.pdf",
  "https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
];

// Domaines à toujours chercher en réseau d'abord
const NETWORK_FIRST_DOMAINS = [
  "app.videas.fr",
  "unikalo.com",
  "nuances-unikalo.com",
];

// ─── INSTALL ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Install — Pré-cache des assets");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          console.warn("[SW] Certains assets n'ont pas pu être pré-cachés:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate — Nettoyage des anciens caches");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("[SW] Suppression cache:", key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== "GET") return;

  // Skip chrome-extension, etc.
  if (!url.protocol.startsWith("http")) return;

  // Network-first pour les domaines externes (vidéo, sites)
  if (NETWORK_FIRST_DOMAINS.some((d) => url.hostname.includes(d))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first pour les assets statiques (images, fonts, CSS, JS)
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first par défaut pour les pages
  event.respondWith(networkFirst(request));
});

// ─── STRATEGIES ───────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

function isStaticAsset(url) {
  const staticExts = [
    ".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".woff", ".woff2", ".ttf", ".eot", ".ico", ".webp", ".pdf",
  ];
  return staticExts.some((ext) => url.pathname.endsWith(ext));
}
