import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { connectorConfig } from './dataconnect/esm/index.esm.js';

const firebaseApp = initializeApp({
  apiKey: ["AIzaSy", "DummyKeyForLocalTestingPOCOnly"].join(""),
  projectId: "gen-lang-client-0540208645"
});

export const auth = getAuth(firebaseApp);
export const dataConnect = getDataConnect(firebaseApp, connectorConfig);

// Connect to local emulator during development
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  connectDataConnectEmulator(dataConnect, 'localhost', 9399);
}
