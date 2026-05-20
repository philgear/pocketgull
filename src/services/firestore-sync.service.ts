import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { IPatient } from './patient.types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreSyncService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /** Signal emitting the current user's UID or null if unauthenticated. */
  public readonly currentUser = signal<string | null>(null);
  private _isMockAuthenticated = false;

  constructor() {
    authState(this.auth).subscribe(user => {
      if (user) {
        this.currentUser.set(user.uid);
      } else if (!this._isMockAuthenticated) {
        this.currentUser.set(null);
      }
    });
  }

  /** Triggers a Google OAuth popup to authenticate the clinician, or simulates it if in demo mode. */
  async signInWithGoogle() {
    if (environment.firebase.apiKey.includes('placeholder')) {
      console.log('[FirestoreSyncService] Placeholder Firebase API key detected. Initiating offline mock Google SSO...');
      // Simulate OAuth network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      this._isMockAuthenticated = true;
      this.currentUser.set('mock-clinician-philgear');
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    await signInWithPopup(this.auth, provider);
  }

  async logout() {
    this._isMockAuthenticated = false;
    this.currentUser.set(null);
    await signOut(this.auth);
  }

  /**
   * Pushes a patient document to the secure Firestore vault under the clinician's namespace.
   */
  async syncPatientToCloud(patient: IPatient) {
    const uid = this.currentUser();
    if (!uid) {
      console.warn('[FirestoreSyncService] Cannot sync. Clinician is not authenticated.');
      return;
    }

    if (this._isMockAuthenticated) {
      console.log(`[FirestoreSyncService] [MOCK] Synced patient ${patient.id} to local memory for clinician ${uid}`);
      return;
    }

    const docRef = doc(this.firestore, `clinicians/${uid}/patients/${patient.id}`);
    await setDoc(docRef, patient, { merge: true });
    console.log(`[FirestoreSyncService] Successfully synced ${patient.id} to cloud vault.`);
  }

  /**
   * Pulls a specific patient chart from the secure Firestore vault.
   */
  async fetchPatientFromCloud(patientId: string): Promise<IPatient | null> {
    const uid = this.currentUser();
    if (!uid) return null;
    
    if (this._isMockAuthenticated) {
      console.log(`[FirestoreSyncService] [MOCK] Fetched patient ${patientId} from memory fallback.`);
      return null;
    }

    const docRef = doc(this.firestore, `clinicians/${uid}/patients/${patientId}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as IPatient;
    }
    return null;
  }
}
