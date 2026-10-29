import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Mock browser globals for testing in Node
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

test("PROF-01: updateUserAvatar sets custom avatar dataUrl and removing it resets to null", () => {
  localStorage.clear();
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
  
  const sampleDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  
  // Profil fotoğrafı yükle
  const updatedUser = store.updateUserAvatar(sampleDataUrl);
  assert.equal(updatedUser.avatarImage, sampleDataUrl);
  
  // Kalıcı store'da doğrula
  const storedUser = store.getCurrentUser();
  assert.equal(storedUser.avatarImage, sampleDataUrl);

  // Profil fotoğrafını kaldır
  const resetUser = store.updateUserAvatar(null);
  assert.equal(resetUser.avatarImage, null);
  assert.equal(store.getCurrentUser().avatarImage, null);
});

test("PROF-02: requestEmailChangeVerification validates email and generates 6-digit code", () => {
  localStorage.clear();
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");

  // Geçersiz e-posta
  const invalidRes = store.requestEmailChangeVerification("gecersiz-eposta");
  assert.equal(invalidRes.success, false);

  // Mevcut ile aynı e-posta
  const sameRes = store.requestEmailChangeVerification("erdal.turk@kisiseldepo.com");
  assert.equal(sameRes.success, false);

  // Başarılı kod talebi
  const validRes = store.requestEmailChangeVerification("yeni.erdal@test.com");
  assert.equal(validRes.success, true);
  assert.ok(validRes.code);
  assert.equal(validRes.code.length, 6);
  assert.ok(/^\d{6}$/.test(validRes.code), "Kod 6 haneli rakam olmalıdır");
});

test("PROF-03: confirmEmailChangeVerification updates email on valid code and rejects wrong code", () => {
  localStorage.clear();
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");

  const req = store.requestEmailChangeVerification("yeni.onayli@test.com");
  assert.equal(req.success, true);
  const correctCode = req.code;

  // Yanlış kod denemesi
  const wrongRes = store.confirmEmailChangeVerification("999999");
  assert.equal(wrongRes.success, false);
  assert.equal(store.getCurrentUser().email, "erdal.turk@kisiseldepo.com");

  // Doğru kod onayı
  const confirmRes = store.confirmEmailChangeVerification(correctCode);
  assert.equal(confirmRes.success, true);
  assert.equal(confirmRes.user.email, "yeni.onayli@test.com");
  assert.equal(store.getCurrentUser().email, "yeni.onayli@test.com");
});

test("PROF-04: isContainerLocked and setContainerLock persist lock status to central containers store", () => {
  localStorage.clear();
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");

  // Başlangıçta Film deposunu oluştur/ekle
  store.saveStoredCollection("containers", [
    { id: "c1", title: "Sinema Kulübü", formatTitle: "Film & Dizi", isLocked: false },
    { id: "c2", title: "Frontend Snippets", formatTitle: "Kod Parçacıkları", isLocked: false },
  ]);

  assert.equal(store.isContainerLocked("c1"), false);

  // c1'i kilitle
  const lockSuccess = store.setContainerLock("c1", true);
  assert.equal(lockSuccess, true);
  assert.equal(store.isContainerLocked("c1"), true);
  assert.equal(store.isContainerLocked("Film"), true);

  // c1 kilidini kaldır
  const unlockSuccess = store.setContainerLock("c1", false);
  assert.equal(unlockSuccess, true);
  assert.equal(store.isContainerLocked("c1"), false);
});

test("PROF-05: purgeExpiredTrashItems automatically removes expired trash items on boot", () => {
  localStorage.clear();
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");

  // 2 çöp öğesi: biri dün silinmiş (29 gün kalmış), biri 40 gün önce silinmiş (süresi dolmuş)
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const validItem = {
    id: "trash-1",
    title: "Güncel Çöp Öğesi",
    type: "text",
    originalData: { id: "t1", title: "Not 1" },
    deletedAt: "2 gün önce",
    deletedTimestamp: now - 2 * dayMs,
    daysRemaining: 28,
  };

  const expiredItem = {
    id: "trash-2",
    title: "Süresi Dolan Çöp Öğesi",
    type: "movie",
    originalData: { id: "m1", title: "Eski Film" },
    deletedAt: "35 gün önce",
    deletedTimestamp: now - 35 * dayMs,
    daysRemaining: 0,
  };

  localStorage.setItem(store.resolveTrashKey(), JSON.stringify([validItem, expiredItem]));

  // Boot temizliği: 30 günlük saklama
  const purgeRes = store.purgeExpiredTrashItems(30);
  assert.equal(purgeRes.purgedCount, 1, "Süresi dolan 1 öğe silinmelidir");
  assert.equal(purgeRes.remaining.length, 1, "1 geçerli öğe kalmalıdır");
  assert.equal(purgeRes.remaining[0].id, "trash-1");
});
