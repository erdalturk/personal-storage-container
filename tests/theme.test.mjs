import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Theme validation logic: defaults to system and validates choices', () => {
  const STORAGE_KEY = 'personal_container_theme';
  const validThemes = ['system', 'light', 'dark'];

  // 1. Varsayılan tema tercihi sistem olmalı
  const getInitialTheme = (saved) => {
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  };

  assert.equal(getInitialTheme(null), 'system');
  assert.equal(getInitialTheme('unknown'), 'system');
  assert.equal(getInitialTheme('dark'), 'dark');
  assert.equal(getInitialTheme('light'), 'light');

  // 2. Sistem modunda çözümlenen tema hesabı
  const resolveActiveTheme = (theme, prefersDark) => {
    if (theme === 'system') {
      return prefersDark ? 'dark' : 'light';
    }
    return theme;
  };

  assert.equal(resolveActiveTheme('system', true), 'dark');
  assert.equal(resolveActiveTheme('system', false), 'light');
  assert.equal(resolveActiveTheme('dark', false), 'dark');
  assert.equal(resolveActiveTheme('light', true), 'light');

  // 3. Döngüsel geçiş (Cycle) mantığı: system -> dark -> light -> system
  const cycleTheme = (current) => {
    if (current === 'system') return 'dark';
    if (current === 'dark') return 'light';
    return 'system';
  };

  assert.equal(cycleTheme('system'), 'dark');
  assert.equal(cycleTheme('dark'), 'light');
  assert.equal(cycleTheme('light'), 'system');
});
