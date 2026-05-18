/**
 * Browser shim for Node.js 'url' module.
 * Used to prevent bundler errors from @mlc-ai/web-llm's conditional Node.js require('url') call.
 * The web-llm package only uses pathToFileURL() in Node environments; this shim provides
 * a no-op implementation for browser builds.
 */
export function pathToFileURL(path: string): URL {
  return new URL(path, 'file://');
}

export function fileURLToPath(url: string | URL): string {
  return typeof url === 'string' ? url.replace('file://', '') : url.pathname;
}

export const format = (urlObject: any) => String(urlObject);
export const parse = (urlString: string) => new URL(urlString);
export const resolve = (from: string, to: string) => new URL(to, from).href;

export default { pathToFileURL, fileURLToPath, format, parse, resolve };
