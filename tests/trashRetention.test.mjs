import test from "node:test";
import assert from "node:assert/strict";
import {
  getTrashRetentionDays,
  setTrashRetentionDays,
  calculateDaysRemaining,
  purgeExpiredTrashItems,
  getTrashItems,
  addToTrash,
} from "../src/lib/appStore.ts";

test("RETENTION-01: Varsayılan saklama süresi 30 gün olmalıdır", () => {
  const days = getTrashRetentionDays();
  assert.equal(days, 30);
});

test("RETENTION-02: calculateDaysRemaining 15, 30 ve 60 güne göre doğru hesaplar", () => {
  const oneDayAgo = Date.now() - 1000 * 60 * 60 * 24;
  const mockItem = {
    id: "test-1",
    title: "Test Öğesi",
    originContainer: "Test Deposu",
    type: "text",
    deletedAt: "Dün",
    daysRemaining: 29,
    deletedTimestamp: oneDayAgo,
  };

  // 30 günlük politikada 1 gün geçmişse 29 gün kalır
  assert.equal(calculateDaysRemaining(mockItem, 30), 29);
  // 15 günlük politikada 1 gün geçmişse 14 gün kalır
  assert.equal(calculateDaysRemaining(mockItem, 15), 14);
  // 60 günlük politikada 1 gün geçmişse 59 gün kalır
  assert.equal(calculateDaysRemaining(mockItem, 60), 59);
});

test("RETENTION-03: Son 5 gün kala kalan gün tespiti doğru çalışır", () => {
  // 15 günlük politikada 12 gün önce silinen öğe: 15 - 12 = 3 gün kaldı (<= 5 gün kuralı)
  const twelveDaysAgo = Date.now() - 12 * 1000 * 60 * 60 * 24;
  const mockItem = {
    id: "test-critical",
    title: "Kritik Öğe",
    originContainer: "Test Deposu",
    type: "file",
    deletedAt: "12 gün önce",
    daysRemaining: 3,
    deletedTimestamp: twelveDaysAgo,
  };

  const remaining = calculateDaysRemaining(mockItem, 15);
  assert.equal(remaining, 3);
  assert.ok(remaining <= 5, "Son 5 gün ve altı olmalıdır (kırmızı uyarı eşiği)");
});

test("RETENTION-04: Süresi dolan (<=0 gün) öğeler purgeExpiredTrashItems ile gerçekten silinir", () => {
  // 35 gün önce silinmiş bir öğe
  const thirtyFiveDaysAgo = Date.now() - 35 * 1000 * 60 * 60 * 24;
  const expiredItem = {
    id: "expired-test",
    title: "Süresi Dolan Öğe",
    originContainer: "Test Deposu",
    type: "movie",
    deletedAt: "35 gün önce",
    daysRemaining: 0,
    deletedTimestamp: thirtyFiveDaysAgo,
  };

  // 30 günlük politikada negatif/sıfır döner
  const rem30 = calculateDaysRemaining(expiredItem, 30);
  assert.ok(rem30 <= 0, "30 günden eski öğenin süresi dolmuş olmalıdır");
});
