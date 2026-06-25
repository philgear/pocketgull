/**
 * Playwright EPERM shim for Windows Application Control environments.
 * Patches fs.readdirSync to silently ignore EPERM (access denied) errors
 * that occur when endpoint security software locks temp inspection folders.
 */
process.chdir(__dirname);

const Module = require('module');
const origLoad = Module._load.bind(Module);

Module._load = function(request, parent, isMain) {
  const mod = origLoad(request, parent, isMain);
  if (mod && !mod.__eperm_patched) {
    if (request === 'fs' || request === 'node:fs') {
      const origReaddir = mod.readdirSync;
      if (origReaddir) {
        mod.readdirSync = function(p, ...args) {
          try {
            return origReaddir.call(mod, p, ...args);
          } catch (e) {
            if (e && (e.code === 'EPERM' || e.code === 'EACCES')) {
              console.warn(`[shim] Ignoring Sync ${e.code} on: ${p}`);
              return [];
            }
            throw e;
          }
        };
      }
      
      const origReaddirAsync = mod.readdir;
      if (origReaddirAsync) {
        mod.readdir = function(p, options, callback) {
          let cb = callback;
          let opts = options;
          if (typeof options === 'function') {
            cb = options;
            opts = undefined;
          }
          try {
            return origReaddirAsync.call(mod, p, opts, function(err, files) {
              if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
                console.warn(`[shim] Ignoring async ${err.code} on: ${p}`);
                if (cb) cb(null, []);
                return;
              }
              if (cb) cb(err, files);
            });
          } catch (e) {
            if (e && (e.code === 'EPERM' || e.code === 'EACCES')) {
              console.warn(`[shim] Ignoring async sync-throw ${e.code} on: ${p}`);
              if (cb) cb(null, []);
              return;
            }
            throw e;
          }
        };
      }

      if (mod.promises && mod.promises.readdir) {
        const origReaddirPromise = mod.promises.readdir;
        mod.promises.readdir = async function(p, options) {
          try {
            return await origReaddirPromise.call(mod.promises, p, options);
          } catch (e) {
            if (e && (e.code === 'EPERM' || e.code === 'EACCES')) {
              console.warn(`[shim] Ignoring promise ${e.code} on: ${p}`);
              return [];
            }
            throw e;
          }
        };
      }
      mod.__eperm_patched = true;
    } else if (request === 'fs/promises' || request === 'node:fs/promises') {
      const origReaddirPromise = mod.readdir;
      if (origReaddirPromise) {
        mod.readdir = async function(p, options) {
          try {
            return await origReaddirPromise.call(mod, p, options);
          } catch (e) {
            if (e && (e.code === 'EPERM' || e.code === 'EACCES')) {
              console.warn(`[shim] Ignoring direct promise ${e.code} on: ${p}`);
              return [];
            }
            throw e;
          }
        };
      }
      mod.__eperm_patched = true;
    }
  }
  return mod;
};

// Now launch Playwright CLI with remaining args
process.argv = [process.argv[0], process.argv[1], ...process.argv.slice(2)];
require('./node_modules/playwright/cli.js');

