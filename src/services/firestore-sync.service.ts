import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth, authState, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { IPatient } from './patient.types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreSyncService {
  private firestore = inject(Firestore, { optional: true });
  private auth = inject(Auth, { optional: true });

  /** Signal emitting the current user's UID or null if unauthenticated. */
  public readonly currentUser = signal<string | null>(null);
  /** Signal emitting the current user's email. */
  public readonly currentUserEmail = signal<string | null>(null);
  /** Signal emitting whether the initial auth state is still loading. */
  public readonly isAuthLoading = signal<boolean>(true);

  constructor() {
    if (this.auth) {
      authState(this.auth).subscribe(user => {
        this.isAuthLoading.set(false);
        if (user) {
          if (user.email === 'philgear@gmail.com') {
            this.currentUser.set(user.uid);
            this.currentUserEmail.set(user.email);
          } else {
            console.error('[Firebase Auth] Unauthorized email attempt:', user.email);
            signOut(this.auth!);
            this.currentUser.set(null);
            this.currentUserEmail.set(null);
          }
        } else if (this.currentUser() !== 'mock-google-clinician') {
          this.currentUser.set(null);
          this.currentUserEmail.set(null);
        }
      });

      // Retrieve incoming redirect results on boot
      if (typeof window !== 'undefined') {
        getRedirectResult(this.auth)
          .then(result => {
            this.isAuthLoading.set(false);
            if (result?.user) {
              if (result.user.email === 'philgear@gmail.com') {
                console.log('[Firebase Auth] Logged in via redirect result:', result.user.uid);
                this.currentUser.set(result.user.uid);
                this.currentUserEmail.set(result.user.email);
              } else {
                console.error('[Firebase Auth] Unauthorized email via redirect result:', result.user.email);
                signOut(this.auth!);
                this.currentUser.set(null);
                this.currentUserEmail.set(null);
              }
            }
          })
          .catch(err => {
            this.isAuthLoading.set(false);
            console.warn('[Firebase Auth] Redirect result lookup warning:', err.message);
          });
      }
    } else {
      this.isAuthLoading.set(false);
    }
  }

  /** Triggers a Google OAuth popup, falling back to redirect, or using a mock if keys are placeholders. */
  async signInWithGoogle() {
    const isPlaceholder = !environment.firebase.apiKey || environment.firebase.apiKey.includes('placeholder');
    if (isPlaceholder || !this.auth) {
      console.warn('[Firebase Auth] Using placeholder configuration. Authenticating with mock clinician credentials...');
      await new Promise(resolve => setTimeout(resolve, 800));
      this.currentUser.set('mock-google-clinician');
      this.currentUserEmail.set('philgear@gmail.com');
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    try {
      console.log('[Firebase Auth] Initiating Google Popup Sign-in...');
      const result = await signInWithPopup(this.auth, provider);
      if (result.user && result.user.email !== 'philgear@gmail.com') {
        console.error('[Firebase Auth] Post-sign-in unauthorized email:', result.user.email);
        await signOut(this.auth);
        this.currentUser.set(null);
        this.currentUserEmail.set(null);
        throw new Error('Access Denied: Clinician account unauthorized.');
      }
    } catch (err: any) {
      if (err.message?.includes('Access Denied')) {
        throw err;
      }
      // Handle blocked popup or third-party cookies block via redirect
      console.warn('[Firebase Auth] Popup blocked or failed. Redirecting user instead:', err.message);
      try {
        await signInWithRedirect(this.auth, provider);
      } catch (redirectErr: any) {
        console.error('[Firebase Auth] Redirect attempt failed:', redirectErr.message);
        throw redirectErr;
      }
    }
  }

  async logout() {
    if (this.auth && this.currentUser() !== 'mock-google-clinician') {
      await signOut(this.auth);
    }
    this.currentUser.set(null);
    this.currentUserEmail.set(null);
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
    if (uid === 'mock-google-clinician' || !this.firestore) {
      console.log('[FirestoreSyncService] Mock sync complete (No cloud write).');
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
    if (uid === 'mock-google-clinician' || !this.firestore) {
      console.log('[FirestoreSyncService] Mock fetch complete (Returning null).');
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
