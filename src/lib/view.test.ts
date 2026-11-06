import { describe, it, expect } from 'vitest';
import { todayWib, formatTime } from './view';

describe('todayWib', () => {
  it('menentukan hari dalam zona Asia/Jakarta bukan zona perangkat', () => {
    // 2026-11-05T17:30:00Z = Kamis 17:30 UTC, Jumat 00:30 WIB
    expect(todayWib(new Date('2026-11-05T17:30:00Z'))).toBe('Jumat');
  });

  it('memetakan semua hari dalam seminggu dengan benar', () => {
    const cases: [string, string][] = [
      ['2026-11-02T00:00:00Z', 'Senin'],
      ['2026-11-03T00:00:00Z', 'Selasa'],
      ['2026-11-04T00:00:00Z', 'Rabu'],
      ['2026-11-05T00:00:00Z', 'Kamis'],
      ['2026-11-06T00:00:00Z', 'Jumat'],
      ['2026-11-07T00:00:00Z', 'Sabtu'],
      ['2026-11-08T00:00:00Z', 'Minggu'],
    ];
    for (const [iso, expected] of cases) {
      expect(todayWib(new Date(iso))).toBe(expected);
    }
  });
});

describe('formatTime', () => {
  it('mengubah pemisah titik dua menjadi titik', () => {
    expect(formatTime('07:30')).toBe('07.30');
    expect(formatTime('09:10')).toBe('09.10');
    expect(formatTime('00:00')).toBe('00.00');
  });
});
