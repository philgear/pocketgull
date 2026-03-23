import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Patient } from './patient.types';

@Injectable({
  providedIn: 'root'
})
export class FirestoreSyncService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /** Signal emitting the current user's UID or null if unauthenticated. */
  public readonly currentUser = signal<string | null>(null);

  constructor() {
    authState(this.auth).subscribe(user => {
      this.currentUser.set(user?.uid || null);
    });
  }

  /** Triggers a Google OAuth popup to authenticate the clinician. */
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    await signInWithPopup(this.auth, provider);
  }

  async logout() {
    await signOut(this.auth);
  }

  /**
   * Pushes a patient document to the secure Firestore vault under the clinician's namespace.
   */
  async syncPatientToCloud(patient: Patient) {
    const uid = this.currentUser();
    if (!uid) {
      console.warn('[FirestoreSyncService] Cannot sync. Clinician is not authenticated.');
      return;
    }
    const docRef = doc(this.firestore, `clinicians/${uid}/patients/${patient.id}`);
    await setDoc(docRef, patient, { merge: true });
    console.log(`[FirestoreSyncService] Successfully synced ${patient.id} to cloud vault.`);
  }

  /**
   * Pulls a specific patient chart from the secure Firestore vault.
   */
  async fetchPatientFromCloud(patientId: string): Promise<Patient | null> {
    const uid = this.currentUser();
    if (!uid) return null;
    
    const docRef = doc(this.firestore, `clinicians/${uid}/patients/${patientId}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Patient;
    }
    return null;
  }
}
