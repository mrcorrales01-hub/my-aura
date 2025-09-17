import i18n from 'i18next';

export function tSafe(key: string, opts: any = {}): string {
  const v = i18n.t(key, { defaultValue: '', ...opts });
  const result = typeof v === 'string' ? v : '';
  if (!result || result === key || result.trim() === '') {
    if (import.meta.env.DEV) console.warn('[i18n] Missing:', key);
    return key; // graceful fallback so no raw "undefined"
  }
  return result;
}