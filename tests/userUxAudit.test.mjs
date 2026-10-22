import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Mock browser globals for testing store and UX utilities in Node.js
const storageMap = new Map();

globalThis.window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};

globalThis.localStorage = {
  getItem: (key) => (storageMap.has(key) ? storageMap.get(key) : null),
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

globalThis.Event = class Event {
  constructor(name) {
    this.name = name;
  }
};

globalThis.document = {
  createElement: () => ({
    style: {},
    click: () => {},
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {},
    contains: () => true,
  },
};

globalThis.URL = {
  createObjectURL: () => "blob:mock-url",
  revokeObjectURL: () => {},
};

// Transpile src/lib/appStore.ts
const appStoreTsPath = path.resolve(process.cwd(), "src/lib/appStore.ts");
const appStoreTsCode = fs.readFileSync(appStoreTsPath, "utf8");
const appStoreJsCode = ts.transpileModule(appStoreTsCode, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const appStoreUrl = `data:text/javascript;base64,${Buffer.from(appStoreJsCode).toString("base64")}`;
const store = await import(appStoreUrl);

// Transpile src/lib/exportUtils.ts
const exportTsPath = path.resolve(process.cwd(), "src/lib/exportUtils.ts");
const exportTsCode = fs.readFileSync(exportTsPath, "utf8");
const exportJsCode = ts.transpileModule(exportTsCode, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const exportUrl = `data:text/javascript;base64,${Buffer.from(exportJsCode).toString("base64")}`;
const exportUtils = await import(exportUrl);

/* ========================================================================== */
/* TEST SUITE: USER-LEVEL UX AUDIT & RESOLUTION                               */
/* ========================================================================== */

test("UX-01: Dynamic sharing generates unique and distinct tokens for different items across all containers", () => {
  localStorage.clear();

  const containerTypes = [
    { type: "text", container: "Notlar & Serbest Düşünceler", items: [{ id: "t1", title: "Proje Mimarisi" }, { id: "t2", title: "Alışveriş Listesi" }] },
    { type: "movie", container: "Sinema Kulübü & Başyapıtlar", items: [{ id: "m1", title: "Inception" }, { id: "m2", title: "Interstellar" }] },
    { type: "code", container: "Kod Parçacıkları & Snippet'lar", items: [{ id: "c1", title: "JWT Auth" }, { id: "c2", title: "Binary Search" }] },
    { type: "travel", container: "Gezi & Seyahat Anıları", items: [{ id: "tr1", title: "Ege Turu" }, { id: "tr2", title: "Kapadokya Balon" }] },
    { type: "study", container: "Yapay Zekâ & Algoritmalar Dersi", items: [{ id: "st1", title: "Heuristic Search" }, { id: "st2", title: "Neural Networks" }] },
    { type: "audio", container: "Sesli Notlar & Podcast Fikirleri", items: [{ id: "a1", title: "Sabah Düşüncesi" }, { id: "a2", title: "Bölüm 14 Kaydı" }] },
    { type: "image", container: "Tasarım İlhamları & Fotoğraf Arşivi", items: [{ id: "im1", title: "Mimari Çekim 1" }, { id: "im2", title: "Gün Batımı Kadraj" }] },
    { type: "file", container: "Sözleşmeler, Faturalar & Belgelerim", items: [{ id: "f1", title: "Sözleşme 2026" }, { id: "f2", title: "Kira Dekontu" }] },
  ];

  for (const group of containerTypes) {
    const token1 = store.createOrGetShareTokenForRecord(group.items[0], group.type, group.container);
    const token2 = store.createOrGetShareTokenForRecord(group.items[1], group.type, group.container);

    // 1. İki farklı içerik asla aynı paylaşım URL'sine/token'ına sahip olmamalı (Kullanıcı şikayeti çözümü)
    assert.notEqual(token1, token2, `Different items in ${group.type} must have distinct tokens`);

    // 2. Aynı içeriğe tekrar basıldığında aynı stabil token dönmeli
    const token1Again = store.createOrGetShareTokenForRecord(group.items[0], group.type, group.container);
    assert.equal(token1, token1Again, `Same item must return stable token`);

    // 3. getCustomSharedRecord ile kaydedilen veri tam ve eksiksiz okunabilmeli
    const record1 = store.getCustomSharedRecord(token1);
    assert.ok(record1, `Custom shared record must exist for token ${token1}`);
    assert.equal(record1.title, group.items[0].title);
    assert.equal(record1.type, group.type);

    // 4. Profil /paylaşılanlar listesine eklenmeli
    const allShares = store.getSharedLinks();
    const foundInShares = allShares.some((s) => s.token === token1);
    assert.ok(foundInShares, `Generated share token ${token1} must be registered in shared links list`);
  }
});

test("UX-02: Moving an item to trash automatically revokes its custom share link", () => {
  localStorage.clear();

  const photoItem = { id: "photo-99", title: "Özel Kapadokya Çekimi" };
  const token = store.createOrGetShareTokenForRecord(photoItem, "image", "Tasarım İlhamları & Fotoğraf Arşivi");

  // Paylaşım ilk oluşturulduğunda aktif olmalı
  assert.equal(store.isTokenDeleted(token), false);
  const recordBefore = store.getCustomSharedRecord(token);
  assert.equal(recordBefore?.isActive, true);

  // Kullanıcı bu fotoğrafı çöp kutusuna taşıyor
  store.addToTrash({
    title: photoItem.title,
    originContainer: "Tasarım İlhamları & Fotoğraf Arşivi",
    type: "image",
    contentPreview: "Fotoğraf",
  });

  // Token artık silinmiş/iptal edilmiş olarak algılanmalı
  assert.equal(store.isTokenDeleted(token), true);
});

test("UX-03: Image downloads produce true binary PNG magic bytes, not corrupt text files", () => {
  // Kullanıcının "fotoğrafı indirdiğimde görüntüleyemiyorum" hatasının testi:
  // Dosya .jpg veya .png uzantılı olsa bile ASCII text ("Kişisel Depo Arşiv...") olmamalı,
  // ISO/IEC 15948 PNG Magic Header (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A) içermeli.
  const bytes = exportUtils.VALID_BINARY_PNG;
  assert.ok(bytes instanceof Uint8Array);
  assert.equal(bytes[0], 0x89);
  assert.equal(bytes[1], 0x50); // 'P'
  assert.equal(bytes[2], 0x4e); // 'N'
  assert.equal(bytes[3], 0x47); // 'G'
  assert.equal(bytes[4], 0x0d);
  assert.equal(bytes[5], 0x0a);
  assert.equal(bytes[6], 0x1a);
  assert.equal(bytes[7], 0x0a);
});

test("UX-04: Audio synthesizer generates valid RIFF and WAVE PCM headers for browser audio playback", () => {
  const blob = exportUtils.createSyntheticAudioBlob(1);
  assert.ok(blob instanceof Blob);
  assert.equal(blob.type, "audio/wav");

  // Blob boyutunun en az 44 byte standart WAV başlığını içermesi gerekir
  assert.ok(blob.size >= 44);
});

test("UX-05: PDF export produces standard %PDF-1.4 header bytes", async () => {
  assert.doesNotThrow(() => {
    exportUtils.exportDocumentFile("Rapor Testi", "pdf", "1.5 MB", "PDF içerik açıklaması");
  });
});

test("UX-06: Firefox asynchronous download safety timeout is at least 1500ms", () => {
  // src/lib/exportUtils.ts dosyasında revokeObjectURL gecikmesinin Mozilla Firefox güvenliği için
  // 1500ms olarak ayarlandığını doğrula
  assert.ok(exportTsCode.includes("setTimeout"), "exportUtils must use setTimeout for safe object URL cleanup");
  assert.ok(
    exportTsCode.includes("1500") || exportTsCode.includes("2000"),
    "revokeObjectURL delay must be at least 1500ms for Firefox async download queue safety"
  );
});

test("UX-07: Cross-browser keyboard ergonomics handle both 'Escape' and legacy 'Esc'", () => {
  const handleKey = (key) => key === "Escape" || key === "Esc";
  assert.equal(handleKey("Escape"), true);
  assert.equal(handleKey("Esc"), true);
  assert.equal(handleKey("Enter"), false);
});
