import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientState } from './patient.types';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private readonly DB_NAME = 'PocketGullDB';
  private readonly STORE_NAME = 'patients';
  private readonly VERSION = 2;

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not available in this environment'));
        return;
      }
      const request = window.indexedDB.open(this.DB_NAME, this.VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('patients_roster')) {
          db.createObjectStore('patients_roster', { keyPath: 'id' });
        }
      };
    });
  }

  async saveState(id: string, state: PatientState): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const db = await this.initDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const data = getReq.result || { id, chatHistory: [] };
            data.state = state;
            data.timestamp = Date.now();
            const putReq = store.put(data);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch (e) {
      console.warn('Persistence skipped:', e);
    }
  }

  async saveChatHistory(id: string, chatHistory: any[]): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const db = await this.initDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const data = getReq.result || { id, state: null };
            data.chatHistory = chatHistory;
            data.timestamp = Date.now();
            const putReq = store.put(data);
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch (e) {
      console.warn('Chat Persistence skipped:', e);
    }
  }

  async loadState(id: string): Promise<{ state: PatientState, chatHistory: any[] } | null> {
    if (!this.isBrowser) return null;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result ? request.result : null);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Hydration skipped:', e);
      return null;
    }
  }

  // --- Patient Roster Operations ---
  async loadPatients(): Promise<any[]> {
    if (!this.isBrowser) return [];
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('patients_roster', 'readonly');
        const store = transaction.objectStore('patients_roster');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Roster hydration skipped:', e);
      return [];
    }
  }

  async savePatient(patient: any): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('patients_roster', 'readwrite');
        const store = transaction.objectStore('patients_roster');
        const request = store.put(patient);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Roster save skipped:', e);
    }
  }

  async deletePatient(id: string): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('patients_roster', 'readwrite');
        const store = transaction.objectStore('patients_roster');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Roster delete skipped:', e);
    }
  }
}
