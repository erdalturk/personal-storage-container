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

test("FIX-01: syncContainerItemCount creates or updates container item count in user storage", () => {
  localStorage.clear();
  store.loginUser("ahmet@ornek.com", "Ahmet Yılmaz");

  // Initial containers for new user is empty
  const initialContainers = store.getStoredCollection("containers", []);
  assert.equal(initialContainers.length, 0);

  // Sync film container
  const updated = store.syncContainerItemCount("Film & Dizi", 3, "Sinema Dünyam");
  assert.equal(updated.length, 1);
  assert.equal(updated[0].itemCount, 3);
  assert.equal(updated[0].title, "Sinema Dünyam");

  const containersNow = store.getStoredCollection("containers", []);
  assert.equal(containersNow.length, 1);
  assert.equal(containersNow[0].title, "Sinema Dünyam");
  assert.equal(containersNow[0].itemCount, 3);
});

test("FIX-02: updateContainerDetails properly edits container title and gradient", () => {
  localStorage.clear();
  store.loginUser("ayse@ornek.com", "Ayşe Kaya");

  store.syncContainerItemCount("Kod Parçacıkları", 5, "Kod Arşivim");
  const cont = store.getContainerByFormatOrType("Kod Parçacıkları");
  assert.ok(cont);

  const edited = store.updateContainerDetails(cont.id, {
    title: "Yapay Zeka Kodlarım",
    coverGradient: "from-blue-600 via-cyan-600 to-teal-500",
  });

  assert.equal(edited?.title, "Yapay Zeka Kodlarım");
  assert.equal(edited?.coverGradient, "from-blue-600 via-cyan-600 to-teal-500");

  const refreshed = store.getContainerByFormatOrType("Kod Parçacıkları");
  assert.equal(refreshed?.title, "Yapay Zeka Kodlarım");
});

test("FIX-03: Shared links and deleted tokens are isolated between users", () => {
  localStorage.clear();

  // 1. Erdal Türk sees demo links
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
  const erdalShares = store.getSharedLinks();
  assert.ok(erdalShares.length > 0);

  // 2. New user starts with empty shared links
  store.loginUser("yeni@ornek.com", "Yeni Kullanıcı");
  const newShares = store.getSharedLinks();
  assert.equal(newShares.length, 0);

  // 3. New user creates a share token
  const token = store.createOrGetShareTokenForRecord(
    { id: "item-1", title: "Özel Şiir", content: "Mavi gökler..." },
    "text",
    "Kişisel Notlarım"
  );
  assert.ok(token);

  const userSharesAfter = store.getSharedLinks();
  assert.equal(userSharesAfter.length, 1);
  assert.equal(userSharesAfter[0].token, token);

  // 4. Erdal Türk shares are unaffected
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");
  const erdalSharesAgain = store.getSharedLinks();
  assert.equal(erdalSharesAgain.some((s) => s.token === token), false);
});

test("FIX-04: activateShareToken revokes deleted status and restores active link", () => {
  localStorage.clear();
  store.loginUser("erdal.turk@kisiseldepo.com", "Erdal Türk");

  // Mark token as deleted
  const deletedKey = store.resolveDeletedTokensKey();
  localStorage.setItem(deletedKey, JSON.stringify(["sinema-kulubu-deposu"]));
  assert.equal(store.isTokenDeleted("sinema-kulubu-deposu"), true);

  // Activate share token
  store.activateShareToken("sinema-kulubu-deposu");
  assert.equal(store.isTokenDeleted("sinema-kulubu-deposu"), false);

  const activeLinks = store.getSharedLinks();
  const found = activeLinks.find((l) => l.token === "sinema-kulubu-deposu");
  assert.ok(found);
  assert.equal(found.isActive, true);
});

test("FIX-05: getDefaultContainerTitle and getDefaultContainerDesc provide appropriate defaults", () => {
  assert.equal(store.getDefaultContainerTitle("Film & Dizi"), "Film & Dizi Koleksiyonum");
  assert.equal(store.getDefaultContainerTitle("Kod"), "Kod Parçacıkları & Snippet'lar");
  assert.equal(store.getDefaultContainerTitle("Gezi"), "Gezi & Seyahat Rotalarım");
  assert.equal(store.getDefaultContainerTitle("Ders"), "Ders & Çalışma Notlarım");
  assert.ok(store.getDefaultContainerDesc("Film & Dizi").includes("film"));
  assert.ok(store.getDefaultContainerDesc("Gezi").includes("Seyahat") || store.getDefaultContainerDesc("Gezi").includes("şehir"));
});
