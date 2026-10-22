import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Mock globals
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

import { isSupabaseConfigured } from "../src/lib/supabaseClient.ts";

test("SYNC-01: Supabase SQL schema contains all 5 tables and RLS security policies", () => {
  const schemaPath = path.resolve(process.cwd(), "supabase/schema.sql");
  assert.ok(fs.existsSync(schemaPath), "supabase/schema.sql must exist");
  const sql = fs.readFileSync(schemaPath, "utf8");

  // Tablolar
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.profiles"));
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.containers"));
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.container_items"));
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.shared_links"));
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.trash_items"));

  // RLS Kuralları
  assert.ok(sql.includes("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY"));
  assert.ok(sql.includes("ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY"));
  assert.ok(sql.includes("ALTER TABLE public.container_items ENABLE ROW LEVEL SECURITY"));
  assert.ok(sql.includes("ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY"));
  assert.ok(sql.includes("CREATE POLICY \"Public can view active shared links\""));

  // Otomatik Başlangıç Tetikleyicisi
  assert.ok(sql.includes("CREATE OR REPLACE FUNCTION public.handle_new_user"));
  assert.ok(sql.includes("CREATE TRIGGER on_auth_user_created"));
});

test("SYNC-02: Graceful offline fallback when Supabase keys are not set", () => {
  const configured = isSupabaseConfigured();
  assert.equal(typeof configured, "boolean");
  assert.equal(configured, false, "Should be false when no env vars are defined");
});

test("SYNC-03: Local storage sync time persistence functions as expected", () => {
  localStorage.clear();
  const testTime = new Date().toLocaleString("tr-TR");
  localStorage.setItem("psc_last_synced_at", testTime);
  assert.equal(localStorage.getItem("psc_last_synced_at"), testTime);
});
