/**
 * Playwright EPERM shim for Windows Application Control environments.
 * Patches fs.readdirSync to silently ignore EPERM (access denied) errors
 * that occur when endpoint security software locks temp inspection folders.
 */
const fs = require('fs');
const path = require('path');

const workspaceTemp = path.join(__dirname, '.playwright_temp');
if (!fs.existsSync(workspaceTemp)) {
  try { fs.mkdirSync(workspaceTemp, { recursive: true }); } catch (e) {}
}
process.env.TMP = workspaceTemp;
process.env.TEMP = workspaceTemp;

const origReaddirSync = fs.readdirSync;
fs.readdirSync = function(p, options) {
  try {
    return origReaddirSync.call(fs, p, options);
  } catch (e) {
    if (e.code === 'EPERM' || e.code === 'EACCES') {
      console.warn(`[shim] Ignoring ${e.code} on readdirSync: ${p}`);
      return [];
    }
    throw e;
  }
};

const origReaddir = fs.readdir;
fs.readdir = function(p, ...args) {
  const callback = args[args.length - 1];
  if (typeof callback === 'function') {
    const newArgs = [...args.slice(0, -1), function(err, files) {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
        console.warn(`[shim] Ignoring ${err.code} on readdir: ${p}`);
        return callback(null, []);
      }
      return callback(err, files);
    }];
    return origReaddir.call(fs, p, ...newArgs);
  }
  return origReaddir.call(fs, p, ...args);
};

if (fs.promises && fs.promises.readdir) {
  const origPromisesReaddir = fs.promises.readdir;
  fs.promises.readdir = async function(p, ...args) {
    try {
      return await origPromisesReaddir.call(fs.promises, p, ...args);
    } catch (e) {
      if (e.code === 'EPERM' || e.code === 'EACCES') {
        console.warn(`[shim] Ignoring ${e.code} on promises.readdir: ${p}`);
        return [];
      }
      throw e;
    }
  };
}

// Now launch Playwright CLI with remaining args
const cliPath = path.resolve(__dirname, 'node_modules/@playwright/test/cli.js');
process.argv = [process.argv[0], cliPath, ...process.argv.slice(2)];
require(cliPath);
