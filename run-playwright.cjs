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
    // Patch readdirSync
    const origReaddirSync = mod.readdirSync;
    if (origReaddirSync) {
      mod.readdirSync = function(p, ...args) {
        try {
          return origReaddirSync.call(mod, p, ...args);
        } catch (e) {
          if (e.code === 'EPERM' || e.code === 'EACCES') {
            console.warn(`[shim] Ignoring ${e.code} on readdirSync: ${p}`);
            return [];
          }
          throw e;
        }
      };
    }

    // Patch readdir (callback)
    const origReaddir = mod.readdir;
    if (origReaddir) {
      mod.readdir = function(p, ...args) {
        const callback = args[args.length - 1];
        if (typeof callback === 'function') {
          const newArgs = [...args.slice(0, -1), function(err, files) {
            if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
              console.warn(`[shim] Ignoring ${err.code} on readdir: ${p}`);
              return callback(null, []);
            }
            return callback(err, files);
          }];
          return origReaddir.call(mod, p, ...newArgs);
        }
        return origReaddir.call(mod, p, ...args);
      };
    }

    // Patch promises.readdir
    if (mod.promises && mod.promises.readdir) {
      const origPromisesReaddir = mod.promises.readdir;
      mod.promises.readdir = async function(p, ...args) {
        try {
          return await origPromisesReaddir.call(mod.promises, p, ...args);
        } catch (e) {
          if (e.code === 'EPERM' || e.code === 'EACCES') {
            console.warn(`[shim] Ignoring ${e.code} on promises.readdir: ${p}`);
            return [];
          }
          throw e;
        }
      };
    }

    mod.__eperm_patched = true;
  }
  return mod;
};

// Now launch Playwright CLI with remaining args
process.argv = [process.argv[0], process.argv[1], ...process.argv.slice(2)];
require('./node_modules/playwright/cli.js');
