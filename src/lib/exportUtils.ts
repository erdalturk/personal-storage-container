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

  // Temizlik
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 150);
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

export function exportDocumentFile(
  titleOrOptions:
    | string
    | {
        name?: string;
        title?: string;
        format?: string;
        size?: string;
        description?: string;
        content?: string;
      },
  format: string = "pdf",
  size?: string,
  description?: string
): void {
  let title = "belge";
  let fmt = format;
  let docSize = size;
  let docDesc = description;

  if (typeof titleOrOptions === "object" && titleOrOptions !== null) {
    title = titleOrOptions.name || titleOrOptions.title || "belge";
    fmt = titleOrOptions.format || format;
    docSize = titleOrOptions.size || size;
    docDesc = titleOrOptions.content || titleOrOptions.description || description;
  } else if (typeof titleOrOptions === "string") {
    title = titleOrOptions;
  }

  const cleanFormat = fmt.toLowerCase().replace(/[^a-z0-9]/g, "");
  const ext = cleanFormat || "pdf";
  const safeTitle = sanitizeFilename(title.replace(new RegExp(`\\.${ext}$`, "i"), ""));
  const filename = `${safeTitle}.${ext}`;
  const mime = DOCUMENT_MIMES[ext] || "application/octet-stream";

  // PDF için geçerli PDF başlığı (%PDF-1.4), diğerleri için temiz binary/text blob
  let blob: Blob;
  if (ext === "pdf") {
    const pdfContent = `%PDF-1.4
1 0 obj << /Title (${title}) /Creator (Kisisel Depo) >> endobj
2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj
3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >> endobj
5 0 obj << /Length 68 >> stream
BT
/F1 18 Tf
50 720 Td
(${title}) Tj
ET
endstream endobj
xref
0 6
0000000000 65535 f 
trailer << /Root 2 0 R /Size 6 >>
startxref
250
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
  } else {
    // ZIP / RAR / XLSX / PPTX / TXT / GÖRSELLER için içerikli blob
    const fileContent = docDesc || `Kişisel Depo Arşiv Dosyası: ${title}\nFormat: ${ext.toUpperCase()}\nBoyut: ${docSize || "1.2 MB"}\nOluşturulma: ${new Date().toISOString()}`;
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
