const { escAttr, countdownFrom, formatClock } = require('../lib/utils');

describe('escAttr', () => {
  test('escapes ampersand, quote, and less-than', () => {
    expect(escAttr('a&b"c<d')).toBe('a&amp;b&quot;c&lt;d');
  });

  test('leaves plain text unchanged', () => {
    expect(escAttr('hello world')).toBe('hello world');
  });

  test('coerces non-string values', () => {
    expect(escAttr(42)).toBe('42');
    expect(escAttr(null)).toBe('null');
  });

  test('handles empty string', () => {
    expect(escAttr('')).toBe('');
  });
});

describe('countdownFrom', () => {
  test('returns null for a future date', () => {
    expect(countdownFrom('2999-01-01')).toBeNull();
  });

  test('returns null for unparseable dates (no NaN objects)', () => {
    expect(countdownFrom('not-a-date')).toBeNull();
    expect(countdownFrom('')).toBeNull();
  });

  test('returns non-negative parts for a past date', () => {
    const result = countdownFrom('2020-01-01');
    expect(result).not.toBeNull();
    expect(result.days).toBeGreaterThan(0);
    expect(result.hours).toBeGreaterThanOrEqual(0);
    expect(result.hours).toBeLessThan(24);
    expect(result.minutes).toBeGreaterThanOrEqual(0);
    expect(result.minutes).toBeLessThan(60);
    expect(result.seconds).toBeGreaterThanOrEqual(0);
    expect(result.seconds).toBeLessThan(60);
  });

  test('parts are integers', () => {
    const result = countdownFrom('2020-01-01');
    expect(Number.isInteger(result.days)).toBe(true);
    expect(Number.isInteger(result.hours)).toBe(true);
    expect(Number.isInteger(result.minutes)).toBe(true);
    expect(Number.isInteger(result.seconds)).toBe(true);
  });

  test('accepts a clock override for deterministic tests', () => {
    const fixedNow = new Date('2024-02-15T12:30:45');
    const result = countdownFrom('2024-02-14', fixedNow);
    expect(result).toEqual({ days: 1, hours: 12, minutes: 30, seconds: 45 });
  });
});

describe('formatClock', () => {
  test('pads single-digit hours and minutes', () => {
    const d = new Date(2024, 0, 1, 9, 5);
    expect(formatClock(d)).toBe('09:05');
  });

  test('formats double-digit hours and minutes', () => {
    const d = new Date(2024, 0, 1, 14, 30);
    expect(formatClock(d)).toBe('14:30');
  });

  test('handles midnight', () => {
    const d = new Date(2024, 0, 1, 0, 0);
    expect(formatClock(d)).toBe('00:00');
  });

  test('throws on invalid clock input', () => {
    expect(() => formatClock(null)).toThrow(TypeError);
    expect(() => formatClock(new Date('invalid'))).toThrow(TypeError);
  });
});
