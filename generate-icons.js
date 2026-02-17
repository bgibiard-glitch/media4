// ═══════════════════════════════════════════════════════════
// Génère les icônes PWA à partir du logo
// Usage: node generate-icons.js
// Prérequis: npm install sharp
// ═══════════════════════════════════════════════════════════

const https = require("https");
const fs = require("fs");
const path = require("path");

const LOGO_URL = "https://media4-duplicated-z3xl.bolt.host/logo.png";
const OUTPUT_DIR = path.join(__dirname, "public", "icons");
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const BG_COLOR = { r: 0, g: 40, b: 85 }; // Navy #002855

// Ensure output dir
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Download logo
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function generateIcons() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.log("⚠️  'sharp' non installé. Installation...");
    require("child_process").execSync("npm install sharp", { stdio: "inherit" });
    sharp = require("sharp");
  }

  console.log("📥 Téléchargement du logo...");
  const logoBuffer = await downloadFile(LOGO_URL);
  console.log(`✅ Logo téléchargé (${logoBuffer.length} bytes)`);

  for (const size of SIZES) {
    const padding = Math.round(size * 0.15); // 15% padding
    const logoSize = size - padding * 2;

    const icon = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: "contain", background: { ...BG_COLOR, alpha: 0 } })
      .flatten({ background: BG_COLOR })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: BG_COLOR,
      })
      .resize(size, size)
      .png()
      .toBuffer();

    const outPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    fs.writeFileSync(outPath, icon);
    console.log(`✅ ${outPath} (${size}x${size})`);
  }

  console.log("\n🚀 Toutes les icônes PWA générées !");
  console.log(`📁 Dossier: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
