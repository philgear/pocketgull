import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { PatientStateService } from './patient-state.service';
import { IPatientVitals } from './patient.types';

export interface CollaborationNote {
  id: string;
  clinicianName: string;
  text: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private socket: Socket | null = null;
  private patientState = inject(PatientStateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Reactive State using Signals
  activeClinicians = signal<string[]>([]);
  collaborationNotes = signal<CollaborationNote[]>([]);
  isConnected = signal<boolean>(false);

  private readonly SESSION_ROOM_ID = 'global-clinical-room';

  constructor() {
    // Only attempt socket.io in the browser, and only when the server
    // is actually running (production / npm run preview).
    // In npm run dev the Angular dev server does not mount socket.io,
    // so we probe /socket.io/ping before connecting to avoid the
    // console flood of 404 reconnection attempts.
    if (this.isBrowser) {
      this.probeAndConnect();
    }
  }

  /**
   * Lightweight probe: hit the socket.io handshake endpoint once.
   * If the server responds, proceed to connect. If it 404s or errors,
   * silently skip — collaboration is unavailable in this environment.
   */
  private probeAndConnect(): void {
    fetch('/socket.io/?EIO=4&transport=polling', { method: 'GET' })
      .then(res => {
        if (res.ok || res.status === 400) {
          // 400 = socket.io responded (wrong protocol version is still "up")
          this.connect();
        }
        // 404 = not mounted (dev server) — stay silent
      })
      .catch(() => {
        // Network error / not running — stay silent
      });
  }

  private connect(): void {
    if (this.socket) return;

    this.socket = io({
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[CollaborationService] Connected to real-time sync.');
      this.isConnected.set(true);
      this.joinRoom();
    });

    this.socket.on('connect_error', () => {
      // Swallow — reconnectionAttempts will exhaust silently
    });

    this.socket.on('disconnect', () => {
      console.log('[CollaborationService] Disconnected.');
      this.isConnected.set(false);
      this.activeClinicians.set([]);
    });

    this.socket.on('vitals_updated', (vitals: Partial<IPatientVitals>) => {
      this.patientState.vitals.update(current => ({ ...current, ...vitals }));
    });

    this.socket.on('note_received', (note: CollaborationNote) => {
      this.collaborationNotes.update(notes => [...notes, note]);
    });

    this.socket.on('presence_updated', (clinicianName: string) => {
      this.activeClinicians.update(clinicians => {
        if (!clinicians.includes(clinicianName)) {
          return [...clinicians, clinicianName];
        }
        return clinicians;
      });
    });
  }

  private joinRoom(): void {
    if (!this.socket) return;
    this.socket.emit('join_patient_room', this.SESSION_ROOM_ID);
    this.socket.emit('presence_update', {
      patientId: this.SESSION_ROOM_ID,
      clinician: 'Dr. Colleague'
    });
  }

  public sendNote(text: string): void {
    if (!this.socket || !this.isConnected()) return;

    const newNote: CollaborationNote = {
      id: crypto.randomUUID(),
      clinicianName: 'Dr. Colleague',
      text,
      timestamp: new Date().toISOString()
    };

    this.collaborationNotes.update(notes => [...notes, newNote]);
    this.socket.emit('send_note', { patientId: this.SESSION_ROOM_ID, note: newNote });
  }

  public syncVitals(vitals: Partial<IPatientVitals>): void {
    if (!this.socket || !this.isConnected()) return;
    this.socket.emit('sync_vitals', { patientId: this.SESSION_ROOM_ID, vitals });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected.set(false);
    this.activeClinicians.set([]);
  }
}
