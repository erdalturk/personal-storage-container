import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Mock browser globals (window, localStorage, Event) for testing appStore.ts in Node
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

// Transpile and load src/lib/appStore.ts dynamically
const tsPath = path.resolve(process.cwd(), "src/lib/appStore.ts");
const tsCode = fs.readFileSync(tsPath, "utf8");
const jsCode = ts.transpileModule(tsCode, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const dataUrl = `data:text/javascript;base64,${Buffer.from(jsCode).toString("base64")}`;
const store = await import(dataUrl);

test("1. Tekil içerik silindiğinde deponun kendi paylaşım bağlantısı (container token) silinmemeli", () => {
  localStorage.clear();

  // Başlangıçta Sinema Kulübü deposu silinmiş olmamalı
  assert.equal(store.isTokenDeleted("sinema-kulubu-deposu"), false);
  assert.equal(store.isTokenDeleted("inception-arsiv"), false);

  // Sinema Kulübü deposunun içinden sadece tek bir film ("Inception (2010)") siliniyor
  const trashEntry = store.addToTrash({
    title: "Inception (2010)",
    originContainer: "Sinema Kulübü & Başyapıtlar",
    type: "movie",
    contentPreview: "Christopher Nolan • 2010",
  });

  // Tekil filmin paylaşımı ("inception-arsiv") iptal edilmeli
  assert.equal(store.isTokenDeleted("inception-arsiv"), true);

  // FAKAT deponun tamamına ait paylaşım ("sinema-kulubu-deposu") ASLA iptal edilmemeli!
  assert.equal(store.isTokenDeleted("sinema-kulubu-deposu"), false);

  // Çöp kutusundan geri yüklendiğinde tekil filmin paylaşımı da geri açılmalı
  store.restoreFromTrash(trashEntry.id);
  assert.equal(store.isTokenDeleted("inception-arsiv"), false);
});

test("2. Depo (container) silindiğinde deponun paylaşımı iptal edilmeli ve activateShareToken ile geri açılabilmeli", () => {
  localStorage.clear();

  store.addToTrash({
    title: "Gece Düşünceleri & Şiirlerim",
    originContainer: "Kişisel Depolarım",
    type: "container",
    contentPreview: "Metin • 5 içerik",
  });

  assert.equal(store.isTokenDeleted("gece-siirleri-deposu"), true);

  // Kullanıcı aktif depoda tekrar Paylaş'a bastığında token aktifleşmeli
  store.activateShareToken("gece-siirleri-deposu");
  assert.equal(store.isTokenDeleted("gece-siirleri-deposu"), false);
});

test("3. Global Arama (searchAllItems) tüm 8 depodaki içerikleri doğru bulmalı", () => {
  localStorage.clear();

  const queriesAndExpectedRoutes = [
    { q: "Inception", href: "/containers/movie" },
    { q: "Mavi Bir Akşamüstü", href: "/containers/text" },
    { q: "FastAPI", href: "/containers/code" },
    { q: "Kaş", href: "/containers/travel" },
    { q: "A* Arama", href: "/containers/study" },
    { q: "Podcast", href: "/containers/audio" },
    { q: "Nordik Minimalist", href: "/containers/media" },
    { q: "SaaS Yazılım", href: "/containers/files" },
  ];

  for (const { q, href } of queriesAndExpectedRoutes) {
    const results = store.searchAllItems(q);
    assert.ok(
      results.length > 0,
      `"${q}" araması için en az 1 sonuç dönmeli`
    );
    assert.equal(
      results[0].href,
      href,
      `"${q}" araması ${href} rotasına yönlendirmeli`
    );
  }
});

test("4. Tam Arşiv Yedekleme (exportFullArchive & importFullArchive) eksiksiz çalışmalı", () => {
  localStorage.clear();

  store.saveStoredCollection("audios", [{ id: "au-test", title: "Test Ses Kaydı" }]);
  const jsonBackup = store.exportFullArchive();
  const parsed = JSON.parse(jsonBackup);

  assert.equal(parsed.version, "2.0");
  assert.equal(parsed.collections.audios.length, 1);
  assert.equal(parsed.collections.audios[0].title, "Test Ses Kaydı");

  // Hafızayı temizleyip yedekten geri yükle
  localStorage.clear();
  assert.equal(store.getStoredCollection("audios", []).length, 0);

  const importRes = store.importFullArchive(jsonBackup);
  assert.equal(importRes.success, true);
  assert.equal(store.getStoredCollection("audios", []).length, 1);
  assert.equal(store.getStoredCollection("audios", [])[0].title, "Test Ses Kaydı");

  // Hatalı JSON testi
  const badRes = store.importFullArchive("{ bozuk json ");
  assert.equal(badRes.success, false);
});

test("5. Kullanıcı Oturumu (loginUser, getCurrentUser, logoutUser) doğru çalışmalı", () => {
  localStorage.clear();

  const loggedIn = store.loginUser("ayse.yilmaz@kisiseldepo.com", "Ayşe Yılmaz");
  assert.equal(loggedIn.name, "Ayşe Yılmaz");
  assert.equal(loggedIn.avatar, "AY");
  assert.equal(loggedIn.isAuthenticated, true);

  store.logoutUser();
  const afterLogout = store.getCurrentUser();
  assert.equal(afterLogout.isAuthenticated, false);
});
