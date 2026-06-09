/**
 * Playwright EPERM shim for Windows Application Control environments.
 * Patches fs.readdirSync to silently ignore EPERM (access denied) errors
 * that occur when endpoint security software locks temp inspection folders.
 */
const Module = require('module');
const origLoad = Module._load.bind(Module);

Module._load = function(request, parent, isMain) {
  const mod = origLoad(request, parent, isMain);
  if (request === 'fs' || (mod && mod.readdirSync && !mod.__eperm_patched)) {
    const origReaddir = mod.readdirSync;
    if (origReaddir) {
      mod.readdirSync = function(p, ...args) {
        try {
          return origReaddir.call(mod, p, ...args);
        } catch (e) {
          if (e.code === 'EPERM' || e.code === 'EACCES') {
            console.warn(`[shim] Ignoring ${e.code} on: ${p}`);
            return [];
          }
          throw e;
        }
      };
      mod.__eperm_patched = true;
    }
  }
  return mod;
};

// Now launch Playwright CLI with remaining args
process.argv = [process.argv[0], process.argv[1], ...process.argv.slice(2)];
require('./node_modules/playwright/cli.js');
