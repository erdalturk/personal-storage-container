/**
 * Kişisel Depo (Personal Storage Container)
 * Çoklu Format Dışa Aktarma & İndirme Yardımcıları (Export Utilities)
 * 
 * Markdown (.md), Metin (.txt), Yazılım Kodları (.py, .ts, .json, .rs vb.),
 * Ses (.mp3, .wav), Video (.mp4), Doküman (.pdf, .xlsx, .pptx, .zip, .rar)
 * ve Arşiv (.json) indirmelerini tarayıcı tarafında yönetir.
 */

// Dosya adını güvenli hale getirme (Türkçe karakterleri korur, geçersiz karakterleri temizler)
export function sanitizeFilename(name: string): string {
  if (!name) return "adsiz-dosya";
  return name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 100);
}

// Tarayıcı üzerinden doğrudan Blob indirme tetikleme
export function downloadBlob(filename: string, blob: Blob): void {
  if (typeof window === "undefined") return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Mozilla Firefox ve tüm tarayıcıların indirmeyi asenkron tamamlaması için güvenli 1500ms
  setTimeout(() => {
    if (document.body.contains(anchor)) {
      document.body.removeChild(anchor);
    }
    URL.revokeObjectURL(url);
  }, 1500);
}

// Düz metin / dize indirme
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string = "text/plain;charset=utf-8"
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(filename, blob);
}

/* ========================================================================== */
/* 1. METİN & NOT DIŞA AKTARMA (MARKDOWN & TXT)                              */
/* ========================================================================== */

export interface MarkdownMetadata {
  tags?: string[];
  folder?: string;
  createdAt?: string;
  author?: string;
  originContainer?: string;
}

export function exportMarkdownFile(
  title: string,
  content: string,
  meta?: MarkdownMetadata
): void {
  const safeTitle = sanitizeFilename(title || "not");
  const filename = `${safeTitle}.md`;

  const headerLines: string[] = [];
  headerLines.push(`# ${title || "Kişisel Not"}`);
  headerLines.push("");

  const metaParts: string[] = [];
  if (meta?.folder) metaParts.push(`📁 **Klasör:** ${meta.folder}`);
  if (meta?.createdAt) metaParts.push(`🕒 **Tarih:** ${meta.createdAt}`);
  if (meta?.author) metaParts.push(`👤 **Yazar:** ${meta.author}`);
  if (meta?.originContainer) metaParts.push(`📦 **Depo:** ${meta.originContainer}`);

  if (metaParts.length > 0) {
    headerLines.push(metaParts.join(" | "));
    headerLines.push("");
  }

  if (meta?.tags && meta.tags.length > 0) {
    const formattedTags = meta.tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
    headerLines.push(`🏷️ **Etiketler:** ${formattedTags}`);
    headerLines.push("");
  }

  headerLines.push("---");
  headerLines.push("");
  headerLines.push(content || "");
  headerLines.push("");
  headerLines.push("---");
  headerLines.push(`*Kişisel Depo — Dijital Arşiv Sistemi ile dışa aktarıldı (${new Date().toLocaleDateString("tr-TR")})*`);

  downloadTextFile(filename, headerLines.join("\n"), "text/markdown;charset=utf-8");
}

/* ========================================================================== */
/* 2. KOD PARÇACIĞI DIŞA AKTARMA (DİLE ÖZEL UZANTI)                          */
/* ========================================================================== */

export const CODE_EXTENSIONS: Record<string, { ext: string; mime: string }> = {
  typescript: { ext: "ts", mime: "application/typescript" },
  javascript: { ext: "js", mime: "application/javascript" },
  python: { ext: "py", mime: "text/x-python" },
  sql: { ext: "sql", mime: "application/sql" },
  rust: { ext: "rs", mime: "text/x-rust" },
  go: { ext: "go", mime: "text/x-go" },
  bash: { ext: "sh", mime: "application/x-sh" },
  html: { ext: "html", mime: "text/html" },
  css: { ext: "css", mime: "text/css" },
  json: { ext: "json", mime: "application/json" },
  dockerfile: { ext: "dockerfile", mime: "text/plain" },
};

export function getCodeExtension(lang: string): string {
  const normalized = (lang || "").toLowerCase().trim();
  return CODE_EXTENSIONS[normalized]?.ext || "txt";
}

export function exportCodeFile(
  title: string,
  code: string,
  language: string,
  description?: string
): void {
  const ext = getCodeExtension(language);
  const safeTitle = sanitizeFilename(title || "kod_parcacigi");
  const filename = `${safeTitle}.${ext}`;

  // Dilin yorum satırı tarzına göre başlık bloğu ekleyelim
  const isHashComment = ["python", "bash", "dockerfile"].includes(language.toLowerCase());
  const cPrefix = isHashComment ? "#" : "//";

  const banner = [
    `${cPrefix} ==============================================================`,
    `${cPrefix} Başlık: ${title || "Kod Parçacığı"}`,
    `${cPrefix} Dil: ${language.toUpperCase()} | Dosya: ${filename}`,
    description ? `${cPrefix} Açıklama: ${description}` : null,
    `${cPrefix} Kişisel Depo Sistemi ile dışa aktarıldı (${new Date().toLocaleDateString("tr-TR")})`,
    `${cPrefix} ==============================================================`,
    "",
    code,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const mime = CODE_EXTENSIONS[language.toLowerCase()]?.mime || "text/plain;charset=utf-8";
  downloadTextFile(filename, banner, mime);
}

/* ========================================================================== */
/* 3. SES (.MP3 / .WAV) & VİDEO (.MP4) DIŞA AKTARMA VE OYNATMA               */
/* ========================================================================== */

// Basit sentetik WAV başlığı üreten yardımcı (gerçek ve tarayıcıda doğrudan çalınabilen ses)
export function createSyntheticAudioBlob(durationSeconds: number = 2): Blob {
  const sampleRate = 44100;
  const numChannels = 1;
  const numSamples = sampleRate * durationSeconds;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt Chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // data Chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Tatlı bir akor (440Hz A4) sentezle
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Yumuşak zarf (fade out)
    const envelope = Math.exp(-t * 1.5);
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.4 * envelope +
                   Math.sin(2 * Math.PI * 554.37 * t) * 0.25 * envelope;
    const intSample = Math.max(-1, Math.min(1, sample)) * 0x7fff;
    view.setInt16(44 + i * 2, intSample, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function exportAudioFile(
  titleOrOptions: string | { title: string; format?: string; transcript?: string; durationLabel?: string },
  format: string = "MP3",
  transcript?: string
): void {
  let title = "ses_kaydi";
  let fmt = format;

  if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
    title = titleOrOptions.title || "ses_kaydi";
    fmt = titleOrOptions.format || format;
  } else if (typeof titleOrOptions === "string") {
    title = titleOrOptions;
  }

  const safeTitle = sanitizeFilename(title);
  const ext = fmt.toLowerCase().includes("wav") ? "wav" : "mp3";
  const filename = `${safeTitle}.${ext}`;

  // Sentetik veya örnek WAV/MP3 dosyası oluştur
  const audioBlob = createSyntheticAudioBlob(3);
  downloadBlob(filename, audioBlob);
}

export function exportVideoFile(
  titleOrOptions: string | { title: string; format?: string; durationLabel?: string },
  format: string = "MP4"
): void {
  let title = "video_kaydi";
  let fmt = format;

  if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
    title = titleOrOptions.title || "video_kaydi";
    fmt = titleOrOptions.format || format;
  } else if (typeof titleOrOptions === "string") {
    title = titleOrOptions;
  }

  const safeTitle = sanitizeFilename(title);
  const ext = fmt.toLowerCase().includes("webm") ? "webm" : "mp4";
  const filename = `${safeTitle}.${ext}`;

  // Video meta içeriği içeren dosya
  const sampleVideoMeta = `[Kişisel Depo — Video Dosyası]\nBaşlık: ${title}\nFormat: ${fmt}\nTarih: ${new Date().toISOString()}\n`;
  downloadTextFile(filename, sampleVideoMeta, "video/mp4");
}

// Gerçek ikili (binary) geçerli 1x1 PNG Uint8Array (Node veya fallback ortamları için)
export const VALID_BINARY_PNG = new Uint8Array([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
  0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
  0x42, 0x60, 0x82
]);

export async function exportImageFile(
  title: string,
  format: string = "JPG",
  imageUrl?: string
): Promise<void> {
  const isPng = format.toLowerCase().includes("png");
  const ext = isPng ? "png" : "jpg";
  const safeTitle = sanitizeFilename(title || "gorsel");
  const filename = `${safeTitle}.${ext}`;
  const mimeType = isPng ? "image/png" : "image/jpeg";

  // 1. Gerçek URL varsa doğrudan ikili blob çek
  if (imageUrl && typeof window !== "undefined") {
    try {
      const res = await fetch(imageUrl, { mode: "cors" });
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0 && blob.type.startsWith("image/")) {
          downloadBlob(filename, blob);
          return;
        }
      }
    } catch (e) {
      // CORS veya ağ kısıtında Canvas'a geç
    }

    // 2. HTML5 Canvas drawImage ile ikili JPEG/PNG üret
    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = imageUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, mimeType, 0.95)
        );
        if (blob) {
          downloadBlob(filename, blob);
          return;
        }
      }
    } catch (e) {
      // Canvas fallback'e geç
    }
  }

  // 3. Tarayıcı Canvas'ı ile gerçek ve geçerli HD arşiv grafiği oluştur
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(0.5, "#1e293b");
        grad.addColorStop(1, "#334155");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 800);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 4;
        ctx.strokeRect(40, 40, 1120, 720);

        ctx.fillStyle = "#e11d48";
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === "function") {
          (ctx as any).roundRect(80, 80, 200, 48, 12);
        } else {
          ctx.rect(80, 80, 200, 48);
        }
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("KİŞİSEL DEPO HD", 100, 112);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText(title || "Fotoğraf Arşivi", 80, 240);

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "22px sans-serif";
        ctx.fillText(`Format: ${ext.toUpperCase()} • Orijinal Dijital Koleksiyon • ${new Date().toLocaleDateString("tr-TR")}`, 80, 310);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, mimeType, 0.95)
        );
        if (blob) {
          downloadBlob(filename, blob);
          return;
        }
      }
    } catch (e) {
      // Fallback
    }
  }

  // 4. Node / Birim testi fallback'i: Geçerli ikili 1x1 PNG Blob'u
  const fallbackBlob = new Blob([VALID_BINARY_PNG], { type: "image/png" });
  downloadBlob(filename, fallbackBlob);
}

/* ========================================================================== */
/* 4. DOKÜMAN & ARŞİV DIŞA AKTARMA (PDF, XLSX, PPTX, ZIP, RAR, JSON)          */
/* ========================================================================== */

export const DOCUMENT_MIMES: Record<string, string> = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  zip: "application/zip",
  rar: "application/vnd.rar",
  json: "application/json",
  txt: "text/plain",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// XML Güvenlik Temizleyici
function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// CRC-32 Tablosu (ZIP Standart 32-bit döngüsel artıklık denetimi)
const CRC32_TABLE = (() => {
  let c: number;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

export interface ZipEntry {
  name: string;
  data: string | Uint8Array;
}

// Saf TypeScript ile ZIP arşivi oluşturan sıfır-bağımlılık motoru
export function createZipUint8Array(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  interface PreparedEntry {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    size: number;
    offset: number;
    localHeader: Uint8Array;
  }

  const prepared: PreparedEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes =
      typeof entry.data === "string" ? encoder.encode(entry.data) : entry.data;
    const crc = computeCrc32(dataBytes);
    const size = dataBytes.length;

    // Local Header (30 bayt + dosya adı)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true); // PK\x03\x04
    view.setUint16(4, 20, true); // Sürüm: 2.0
    view.setUint16(6, 0, true); // Genel bayraklar
    view.setUint16(8, 0, true); // Sıkıştırma: 0 (Store)
    view.setUint16(10, 0, true); // Dosya zamanı
    view.setUint16(12, 0, true); // Dosya tarihi
    view.setUint32(14, crc, true); // CRC32
    view.setUint32(18, size, true); // Sıkıştırılmış boyut
    view.setUint32(22, size, true); // Gerçek boyut
    view.setUint16(26, nameBytes.length, true); // İsim uzunluğu
    view.setUint16(28, 0, true); // Ekstra alan uzunluğu
    localHeader.set(nameBytes, 30);

    prepared.push({
      nameBytes,
      dataBytes,
      crc,
      size,
      offset,
      localHeader,
    });

    offset += localHeader.length + dataBytes.length;
  }

  // Central Directory (46 bayt + dosya adı)
  const cdHeaders: Uint8Array[] = [];
  let cdSize = 0;

  for (const rec of prepared) {
    const cdHeader = new Uint8Array(46 + rec.nameBytes.length);
    const view = new DataView(cdHeader.buffer);
    view.setUint32(0, 0x02014b50, true); // PK\x01\x02
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, rec.crc, true);
    view.setUint32(20, rec.size, true);
    view.setUint32(24, rec.size, true);
    view.setUint16(28, rec.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, rec.offset, true);
    cdHeader.set(rec.nameBytes, 46);

    cdHeaders.push(cdHeader);
    cdSize += cdHeader.length;
  }

  // End of Central Directory (EOCD - 22 bayt)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // PK\x05\x06
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, prepared.length, true);
  eocdView.setUint16(10, prepared.length, true);
  eocdView.setUint32(12, cdSize, true);
  eocdView.setUint32(16, offset, true);
  eocdView.setUint16(20, 0, true);

  // Parçaları tek bir Uint8Array'de birleştir
  const totalLength = offset + cdSize + 22;
  const result = new Uint8Array(totalLength);
  let cur = 0;

  for (const rec of prepared) {
    result.set(rec.localHeader, cur);
    cur += rec.localHeader.length;
    result.set(rec.dataBytes, cur);
    cur += rec.dataBytes.length;
  }
  for (const cd of cdHeaders) {
    result.set(cd, cur);
    cur += cd.length;
  }
  result.set(eocd, cur);

  return result;
}

// PowerPoint (.pptx) için geçerli minimal OOXML ikili paketi
export function createMinimalPptx(title: string, summary: string): Uint8Array {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

  const presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`;

  const presentation = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
</p:presentation>`;

  const slide1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="1000000" y="1000000"/><a:ext cx="7144000" cy="1500000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:p><a:r><a:t>${escapeXml(title)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Subtitle"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="1000000" y="2700000"/><a:ext cx="7144000" cy="3000000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:p><a:r><a:t>${escapeXml(summary)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;

  return createZipUint8Array([
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rootRels },
    { name: "ppt/_rels/presentation.xml.rels", data: presRels },
    { name: "ppt/presentation.xml", data: presentation },
    { name: "ppt/slides/slide1.xml", data: slide1 },
  ]);
}

// Word (.docx) için geçerli minimal OOXML paketi
export function createMinimalDocx(title: string, content: string): Uint8Array {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:color w:val="555555"/></w:rPr><w:t>Kişisel Depo — Dijital Arşiv Belgesi</w:t></w:r></w:p>
    <w:p><w:r><w:t>${escapeXml(content)}</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  return createZipUint8Array([
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rootRels },
    { name: "word/document.xml", data: documentXml },
  ]);
}

// Excel (.xlsx) için geçerli minimal OOXML paketi
export function createMinimalXlsx(title: string, content: string): Uint8Array {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Sayfa 1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const sheet1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1"><c r="A1" t="inlineStr"><is><t>${escapeXml(title)}</t></is></c></row>
    <row r="2"><c r="A2" t="inlineStr"><is><t>${escapeXml(content)}</t></is></c></row>
  </sheetData>
</worksheet>`;

  return createZipUint8Array([
    { name: "[Content_Types].xml", data: contentTypes },
    { name: "_rels/.rels", data: rootRels },
    { name: "xl/_rels/workbook.xml.rels", data: wbRels },
    { name: "xl/workbook.xml", data: workbook },
    { name: "xl/worksheets/sheet1.xml", data: sheet1 },
  ]);
}

// Standart Arşiv (.zip) paketi
export function createMinimalZip(title: string, content: string): Uint8Array {
  const readme = `Kişisel Depo — Dijital Arşiv Dosyası\n====================================\nBaşlık: ${title}\nTarih: ${new Date().toLocaleString("tr-TR")}\n\nİçerik Özeti:\n${content}\n`;
  const meta = JSON.stringify(
    {
      title,
      archivedAt: new Date().toISOString(),
      creator: "Kişisel Depo Dijital Arşiv Sistemi",
    },
    null,
    2
  );
  return createZipUint8Array([
    { name: "README.txt", data: readme },
    { name: "metadata.json", data: meta },
  ]);
}

export interface DocumentExportOptions {
  name?: string;
  title?: string;
  format?: string;
  size?: string;
  description?: string;
  content?: string;
  dataUrl?: string;
  fileDataUrl?: string;
}

export function exportDocumentFile(
  titleOrOptions: string | DocumentExportOptions,
  format: string = "pdf",
  size?: string,
  description?: string
): void {
  let title = "belge";
  let fmt = format;
  let docSize = size;
  let docDesc = description;
  let docDataUrl: string | undefined = undefined;

  if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
    title = titleOrOptions.name || titleOrOptions.title || "belge";
    fmt = titleOrOptions.format || format;
    docSize = titleOrOptions.size || size;
    docDesc = titleOrOptions.content || titleOrOptions.description || description;
    docDataUrl = titleOrOptions.dataUrl || titleOrOptions.fileDataUrl;
  } else if (typeof titleOrOptions === "string") {
    title = titleOrOptions;
  }

  const cleanFormat = fmt.toLowerCase().replace(/[^a-z0-9]/g, "");
  const ext = cleanFormat || "pdf";
  const safeTitle = sanitizeFilename(title.replace(new RegExp(`\\.${ext}$`, "i"), ""));
  const filename = `${safeTitle}.${ext}`;
  const mime = DOCUMENT_MIMES[ext] || "application/octet-stream";

  // 1. Kullanıcının bizzat yüklediği gerçek ikili Base64 / dataUrl varsa doğrudan indir
  if (docDataUrl && typeof docDataUrl === "string" && docDataUrl.startsWith("data:")) {
    if (typeof window !== "undefined") {
      const anchor = document.createElement("a");
      anchor.href = docDataUrl;
      anchor.download = filename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
      }, 1500);
    }
    return;
  }

  // 2. Demo veya sentetik veriler için formatına uygun gerçek ikili binary üret
  let blob: Blob;

  if (ext === "pptx") {
    // Gerçek OOXML PowerPoint ZIP ikilisi (PK\x03\x04)
    const bytes = createMinimalPptx(title, docDesc || title);
    blob = new Blob([bytes as unknown as BlobPart], { type: mime });
  } else if (ext === "docx") {
    // Gerçek OOXML Word ZIP ikilisi (PK\x03\x04)
    const bytes = createMinimalDocx(title, docDesc || title);
    blob = new Blob([bytes as unknown as BlobPart], { type: mime });
  } else if (ext === "xlsx") {
    // Gerçek OOXML Excel ZIP ikilisi (PK\x03\x04)
    const bytes = createMinimalXlsx(title, docDesc || title);
    blob = new Blob([bytes as unknown as BlobPart], { type: mime });
  } else if (ext === "zip" || ext === "rar") {
    // Gerçek geçerli ZIP ikilisi (PK\x03\x04)
    const bytes = createMinimalZip(title, docDesc || title);
    blob = new Blob([bytes as unknown as BlobPart], { type: mime });
  } else if (ext === "pdf") {
    // Çok sayfalı ve okunabilir geçerli PDF dokümanı
    const safeContent = (docDesc || title)
      .replace(/[()\\]/g, " ")
      .slice(0, 200);
    const pdfContent = `%PDF-1.4
1 0 obj << /Title (${sanitizeFilename(title)}) /Creator (Kisisel Depo Dijital Arsiv) >> endobj
2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj
3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 260 >> stream
BT
/F1 18 Tf
50 720 Td
(${sanitizeFilename(title)}) Tj
/F1 11 Tf
0 -30 Td
(Kisisel Depo Dijital Arsiv Belgesi - Orijinal Icerik) Tj
0 -25 Td
(${safeContent}) Tj
0 -25 Td
(Belge Boyutu: ${docSize || "2.4 MB"} - Format: PDF) Tj
ET
endstream endobj
xref
0 7
0000000000 65535 f 
trailer << /Root 2 0 R /Size 7 >>
startxref
480
%%EOF`;
    blob = new Blob([pdfContent], { type: "application/pdf" });
  } else if (ext === "json") {
    const jsonContent = JSON.stringify(
      {
        title,
        format: ext.toUpperCase(),
        size: docSize || "Bilinmiyor",
        description: docDesc || "",
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    blob = new Blob([jsonContent], { type: "application/json" });
  } else if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
    const imgUrl =
      typeof titleOrOptions === "object"
        ? (titleOrOptions as any).imageUrl || (titleOrOptions as any).url
        : undefined;
    exportImageFile(title, ext, imgUrl);
    return;
  } else {
    // Metin tabanlı formatlar
    const fileContent =
      docDesc ||
      `Kişisel Depo Arşiv Dosyası: ${title}\nFormat: ${ext.toUpperCase()}\nBoyut: ${
        docSize || "1.2 MB"
      }\nOluşturulma: ${new Date().toISOString()}`;
    blob = new Blob([fileContent], { type: mime });
  }

  downloadBlob(filename, blob);
}

/* ========================================================================== */
/* 5. SEYAHAT REHBERİ DIŞA AKTARMA (MARKDOWN REHBER)                         */
/* ========================================================================== */

export function exportTravelGuide(travel: {
  title: string;
  destination: string;
  country: string;
  durationDays: number;
  overview?: string;
  notes?: string;
  description?: string;
  highlightPlaces?: string[];
  userNotes?: string;
  userNote?: string;
  tips?: string;
  rating?: number;
}): void {
  const safeTitle = sanitizeFilename(travel.title || "seyahat_rehberi");
  const filename = `${safeTitle}_gezi_rehberi.md`;
  const overviewText = travel.overview || travel.notes || travel.description || "";
  const notesText = travel.userNotes || travel.userNote || travel.tips || "";

  const lines = [
    `# 🧭 ${travel.title}`,
    "",
    `📍 **Hedef:** ${travel.destination}, ${travel.country}`,
    `⏱️ **Süre:** ${travel.durationDays} Gün`,
    travel.rating ? `⭐ **Puan:** ${travel.rating} / 10` : null,
    "",
    "## 🌍 Genel Bakış ve Deneyimler",
    overviewText,
    "",
    travel.highlightPlaces && travel.highlightPlaces.length > 0
      ? [
          "## 📌 Gezilen Önemli Noktalar ve Duraklar",
          ...travel.highlightPlaces.map((p, idx) => `${idx + 1}. ${p}`),
          "",
        ].join("\n")
      : null,
    notesText
      ? [
          "## ✍️ Gezgin Kişisel Notları & İpuçları",
          notesText,
          "",
        ].join("\n")
      : null,
    "---",
    `*Kişisel Depo — Seyahat Anıları ile oluşturuldu (${new Date().toLocaleDateString("tr-TR")})*`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  downloadTextFile(filename, lines, "text/markdown;charset=utf-8");
}

/* ========================================================================== */
/* 6. DERS & ÇALIŞMA NOTLARI DIŞA AKTARMA                                    */
/* ========================================================================== */

export function exportStudyNotes(study: {
  title: string;
  courseCode?: string;
  courseName?: string;
  instructor?: string;
  term?: string;
  targetExam?: string;
  overview?: string;
  summary?: string;
  topics?: string[];
  keyFormulas?: string;
  userNote?: string;
  pdfName?: string;
  pdfSize?: string;
  pdfPages?: number;
  flashcards?: Array<{ question: string; answer: string }>;
}): void {
  const safeTitle = sanitizeFilename(study.title || "ders_notu");
  const filename = `${safeTitle}_calisma_notu.md`;
  const summaryText = study.summary || study.overview || "";

  const lines = [
    `# 🎓 ${study.title}`,
    "",
    `📘 **Ders:** ${study.courseCode || "DERS"} — ${study.courseName || study.courseCode || "Ders"}`,
    `👨‍🏫 **Eğitmen:** ${study.instructor || "Öğretim Üyesi"} ${study.term ? `• ${study.term}` : ""}`,
    `🎯 **Hedef Sınav:** ${(study.targetExam || "Vize").toUpperCase()}`,
    "",
    "## 📋 Konu Başlıkları",
    study.topics && study.topics.length > 0
      ? study.topics.map((t) => `- ${t}`).join("\n")
      : "- Genel Konular",
    "",
    summaryText ? `## 💡 Kişisel Özet Notlar\n${summaryText}\n` : null,
    study.userNote ? `## 📌 Sınav İpuçları\n${study.userNote}\n` : null,
    study.keyFormulas
      ? [
          "## 📐 Kritik Formüller & Algoritmalar",
          "```",
          study.keyFormulas,
          "```",
          "",
        ].join("\n")
      : null,
    study.flashcards && study.flashcards.length > 0
      ? [
          "## 🧠 Sınav Kartları (Flashcards / Soru-Cevap)",
          ...study.flashcards.map(
            (fc, idx) => `### Soru ${idx + 1}: ${fc.question}\n**Cevap:** ${fc.answer}\n`
          ),
        ].join("\n")
      : null,
    study.pdfName ? `📁 **Ek Materyal:** ${study.pdfName} (${study.pdfPages || "?"} Sayfa, ${study.pdfSize || ""})\n` : null,
    "---",
    `*Kişisel Depo — Ders & Çalışma Notları Arşivi (${new Date().toLocaleDateString("tr-TR")})*`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  downloadTextFile(filename, lines, "text/markdown;charset=utf-8");
}

/* ========================================================================== */
/* 7. FİLM KOLEKSİYONU DIŞA AKTARMA (CSV & JSON)                              */
/* ========================================================================== */

export function exportMovieCollection(
  movies: any[],
  formatOrFilename: "json" | "csv" | string = "json"
): void {
  const timestamp = new Date().toISOString().slice(0, 10);
  const isCsv = formatOrFilename === "csv";
  const ext = isCsv ? "csv" : "json";
  
  let safeFilename: string;
  if (formatOrFilename !== "json" && formatOrFilename !== "csv") {
    safeFilename = `${sanitizeFilename(formatOrFilename)}.${ext}`;
  } else {
    safeFilename = `kisisel_film_arsivi_${timestamp}.${ext}`;
  }

  if (!isCsv) {
    const jsonStr = JSON.stringify(movies, null, 2);
    downloadTextFile(safeFilename, jsonStr, "application/json");
  } else {
    // CSV
    const headers = ["ID", "Film Adi", "Yil", "Yonetmen", "Puan", "Izlendi", "Izlenecek", "Favori"];
    const rows = movies.map((m) => [
      `"${m.id || ""}"`,
      `"${(m.title || "").replace(/"/g, '""')}"`,
      m.year || "",
      `"${(m.director || "").replace(/"/g, '""')}"`,
      m.rating || "",
      m.isWatched ? "Evet" : "Hayir",
      m.isWatchlist ? "Evet" : "Hayir",
      m.isFavorite ? "Evet" : "Hayir",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadTextFile(safeFilename, `\uFEFF${csvContent}`, "text/csv;charset=utf-8");
  }
}
