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

test("6. Master PIN Belirleme, Doğrulama ve Değiştirme doğru çalışmalı", () => {
  localStorage.clear();

  // Henüz PIN belirlenmemişse hasMasterPin false olmalı
  assert.equal(store.hasMasterPin(), false);

  // Varsayılan PIN (1234) doğrulanabilmeli
  const defaultVerify = store.verifyMasterPin("1234");
  assert.equal(defaultVerify.valid, true);

  // Geçersiz format (harf veya kısa) reddedilmeli
  const badPinRes = store.setMasterPin("abc");
  assert.equal(badPinRes.success, false);

  // 4 haneli yeni PIN belirlenmeli
  const setRes = store.setMasterPin("5821");
  assert.equal(setRes.success, true);
  assert.equal(store.hasMasterPin(), true);

  // Eski şifre (1234) artık geçersiz olmalı
  const oldVerify = store.verifyMasterPin("1234");
  assert.equal(oldVerify.valid, false);

  // Yeni şifre (5821) geçerli olmalı
  const newVerify = store.verifyMasterPin("5821");
  assert.equal(newVerify.valid, true);

  // PIN Değiştirme: Eski şifre yanlışsa hata vermeli
  const wrongOld = store.changeMasterPin("0000", "9999");
  assert.equal(wrongOld.success, false);

  // Doğru eski şifreyle PIN değiştirilmeli
  const changeRes = store.changeMasterPin("5821", "9999");
  assert.equal(changeRes.success, true);
  assert.equal(store.verifyMasterPin("9999").valid, true);
});

test("7. Master PIN 5 hatalı denemede 30 saniye kilitlenmeli", () => {
  localStorage.clear();
  store.setMasterPin("1234");

  // 4 kez hatalı deneme
  for (let i = 1; i <= 4; i++) {
    const res = store.verifyMasterPin("0000");
    assert.equal(res.valid, false);
    assert.equal(res.isLockedOut, false);
    assert.equal(res.remainingAttempts, 5 - i);
  }

  // 5. hatalı deneme: Kilitlenme tetiklenmeli
  const fifthRes = store.verifyMasterPin("0000");
  assert.equal(fifthRes.valid, false);
  assert.equal(fifthRes.isLockedOut, true);
  assert.ok(fifthRes.lockSecondsRemaining > 0);

  // Kilitliyken doğru şifre girilse bile reddedilmeli
  const lockedAttempt = store.verifyMasterPin("1234");
  assert.equal(lockedAttempt.isLockedOut, true);
  assert.equal(lockedAttempt.valid, false);
});

