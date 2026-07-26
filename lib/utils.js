/**
 * Pure utility functions for the love-invitation microsite.
 * No DOM dependencies — fully testable in Node.
 */

/**
 * Escape special HTML characters (&, ", <) in a string.
 * @param {*} s
 * @returns {string}
 */
function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Calculate elapsed time from a start date (ISO date part, e.g. '2024-02-14').
 * Returns null when the start date is in the future OR unparseable.
 *
 * @param {string} startDate - ISO date part, e.g. '2024-02-14'
 * @param {Date} [now] - optional clock override for testing
 * @returns {{ days: number, hours: number, minutes: number, seconds: number } | null}
 */
function countdownFrom(startDate, now) {
  const current = now instanceof Date ? now : new Date();
  const start = new Date(String(startDate) + 'T00:00:00');
  const ms = current - start;
  if (Number.isNaN(ms) || ms < 0) return null;
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
  };
}

/**
 * Format a Date into HH:MM for a status-bar clock.
 * @param {Date} date
 * @returns {string}
 * @throws {TypeError} if date is not a Date or is Invalid Date
 */
function formatClock(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('formatClock expects a valid Date');
  }
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// Browser global + CommonJS export
if (typeof window !== 'undefined') {
  window.LoveUtils = { escAttr, countdownFrom, formatClock };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escAttr, countdownFrom, formatClock };
}
