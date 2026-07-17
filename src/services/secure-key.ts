const STORAGE_KEY = '_pg_g_ak';

export function getStoredApiKey(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    // Reverse and base64 decode to deobfuscate
    return atob(raw.split('').reverse().join(''));
  } catch {
    return '';
  }
}

export function setStoredApiKey(key: string): void {
  try {
    if (!key) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    // Base64 encode and reverse to obfuscate
    const obfuscated = btoa(key).split('').reverse().join('');
    localStorage.setItem(STORAGE_KEY, obfuscated);
  } catch (e) {
    console.error('Failed to save configuration key:', e);
  }
}
