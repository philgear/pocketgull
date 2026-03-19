import { Injectable, signal, computed } from '@angular/core';
import {
  BodyPartIssue,
  PatientVitals,
  BiometricEntry,
  ClinicalNote,
  ChecklistItem,
  ShoppingListItem,
  DraftSummaryItem,
  PatientState,
  HistoryEntry,
  Bookmark,
  BODY_PART_NAMES,
  BODY_PART_MAPPING
} from './patient.types';

export { BODY_PART_NAMES, BODY_PART_MAPPING };
export type { PatientState };


@Injectable({
  providedIn: 'root'
})
export class PatientStateService {
  // --- UI State ---
  readonly selectedPartId = signal<string | null>(null);
  readonly selectedNoteId = signal<string | null>(null);
  readonly isLiveAgentActive = signal<boolean>(false);
  readonly liveAgentInput = signal<string>('');
  readonly isResearchFrameVisible = signal<boolean>(false);
  readonly analysisUpdateRequest = signal(0);
  readonly requestedResearchUrl = signal<string | null>(null);
  readonly requestedResearchQuery = signal<string | null>(null);
  readonly requestedSearchEngine = signal<'google' | 'pubmed' | null>(null);
  readonly viewingPastVisit = signal<HistoryEntry | null>(null);
  readonly bodyViewerMode = signal<'3d' | '2d'>('3d');
  readonly anatomyViewMode = signal<'skin' | 'muscle' | 'skeleton' | 'organs' | 'molecular'>('skin');
  readonly activePatientSummary = signal<string | null>(null);
  readonly draftSummaryItems = signal<DraftSummaryItem[]>([]);
  readonly lensAnnotations = signal<Record<string, Record<string, any>>>({});

  // --- Patient Data State ---
  readonly issues = signal<Record<string, BodyPartIssue[]>>({});
  readonly patientGoals = signal<string>("");
  readonly    vitals = signal<PatientVitals>({
        bp: '',
        hr: '',
        temp: '',
        spO2: '',
        weight: '',
        height: '',
        vitC: '',
        vitD3: '',
        magnesium: '',
        zinc: '',
        b12: ''
    });

    readonly dynamicNutrients = signal<import('./patient.types').DynamicMarker[]>([]);
  readonly oxidativeStressMarkers = signal<import('./patient.types').DynamicMarker[]>([]);
  readonly antioxidantSources = signal<import('./patient.types').DynamicMarker[]>([]);
  readonly medications = signal<import('./patient.types').DynamicMarker[]>([]);
  
  readonly clinicalNotes = signal<ClinicalNote[]>([]);
  readonly checklist = signal<ChecklistItem[]>([]);
  readonly shoppingList = signal<ShoppingListItem[]>([]);
  readonly biometricHistory = signal<BiometricEntry[]>([]);

  // A trigger to force the UI to expand the analysis panel when an item is selected/clicked
  readonly uiExpandTrigger = signal<number>(0);

  constructor() { }

  // --- Computed State ---
  readonly hasIssues = computed(() =>
    Object.keys(this.issues()).length > 0 || this.patientGoals().length > 0
  );

  readonly selectedPartName = computed(() => {
    const id = this.selectedPartId();
    if (!id) return null;
    return BODY_PART_NAMES[id] || id;
  });

  // Helper to check if a part has any notes
  hasIssue(partId: string): boolean {
    const issues = this.issues()[partId];
    return !!issues && issues.length > 0;
  }

  // Helper to check if a part has a note with a pain level > 0
  hasPainfulIssue(partId: string): boolean {
    const issues = this.issues()[partId];
    return !!issues && issues.some(i => i.painLevel > 0);
  }

  // --- Actions ---
  triggerUiExpand() {
    this.uiExpandTrigger.set(Date.now());
  }

  selectPart(partId: string | null) {
    this.selectedPartId.set(partId);
    this.triggerUiExpand();
    if (!partId) {
      this.selectedNoteId.set(null); // Deselect note when part is deselected
    }
  }

  selectNote(noteId: string | null) {
    this.selectedNoteId.set(noteId);
  }

  toggleLiveAgent(active: boolean) {
    this.isLiveAgentActive.set(active);
  }

  toggleResearchFrame(visible?: boolean) {
    if (visible === undefined) {
      this.isResearchFrameVisible.update(v => !v);
    } else {
      this.isResearchFrameVisible.set(visible);
    }
  }

  updateIssue(partId: string, issue: BodyPartIssue) {
    this.issues.update(current => {
      const issuesForPart = current[partId] ? [...current[partId]] : [];
      const existingIndex = issuesForPart.findIndex(i => i.noteId === issue.noteId);
      if (existingIndex > -1) {
        // Update existing issue
        issuesForPart[existingIndex] = issue;
      } else {
        // Add new issue
        issuesForPart.push(issue);
      }
      return {
        ...current,
        [partId]: issuesForPart
      };
    });
  }

  removeIssueNote(partId: string, noteId: string) {
    this.issues.update(current => {
      const issuesForPart = current[partId] || [];
      const updatedIssuesForPart = issuesForPart.filter(i => i.noteId !== noteId);
      const updated = { ...current };
      if (updatedIssuesForPart.length > 0) {
        updated[partId] = updatedIssuesForPart;
      } else {
        // If no issues are left for this part, remove the part key
        delete updated[partId];
      }
      return updated;
    });
  }

  updateGoals(goals: string) {
    this.patientGoals.set(goals);
  }

    updateVital(key: keyof PatientVitals, value: string) {
        this.vitals.update(vitals => ({ ...vitals, [key]: value }));
    }

    addDynamicNutrient() {
        this.dynamicNutrients.update(nutrients => [
            ...nutrients, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateDynamicNutrient(id: string, field: 'name' | 'value', value: string) {
        this.dynamicNutrients.update(nutrients => 
            nutrients.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeDynamicNutrient(id: string) {
        this.dynamicNutrients.update(nutrients => nutrients.filter(n => n.id !== id));
    }
    
    // --- Oxidative Stress Markers ---
    addOxidativeStressMarker() {
        this.oxidativeStressMarkers.update(markers => [
            ...markers, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateOxidativeStressMarker(id: string, field: 'name' | 'value', value: string) {
        this.oxidativeStressMarkers.update(markers => 
            markers.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeOxidativeStressMarker(id: string) {
        this.oxidativeStressMarkers.update(markers => markers.filter(n => n.id !== id));
    }

    // --- Antioxidant Sources ---
    addAntioxidantSource() {
        this.antioxidantSources.update(sources => [
            ...sources, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateAntioxidantSource(id: string, field: 'name' | 'value', value: string) {
        this.antioxidantSources.update(sources => 
            sources.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeAntioxidantSource(id: string) {
        this.antioxidantSources.update(sources => sources.filter(n => n.id !== id));
    }

    // --- Medications ---
    addMedication() {
        this.medications.update(meds => [
            ...meds, 
            { id: Date.now().toString(), name: '', value: '' }
        ]);
    }

    updateMedication(id: string, field: 'name' | 'value', value: string) {
        this.medications.update(meds => 
            meds.map(n => n.id === id ? { ...n, [field]: value } : n)
        );
    }

    removeMedication(id: string) {
        this.medications.update(meds => meds.filter(n => n.id !== id));
    }
  updateActivePatientSummary(plan: string | null) {
    this.activePatientSummary.set(plan);
  }

  // --- Biometric Data Actions ---
  addBiometricEntries(entries: BiometricEntry[]) {
    this.biometricHistory.update(history => [...history, ...entries]);
  }

  clearBiometricHistory() {
    this.biometricHistory.set([]);
  }

  // --- Care Plan Drafting Actions ---
  addClinicalNote(note: ClinicalNote) {
    this.clinicalNotes.update(notes => {
      const existing = notes.findIndex(n => n.id === note.id);
      if (existing > -1) {
        const next = [...notes];
        next[existing] = note;
        return next;
      }
      return [...notes, note];
    });
  }

  removeClinicalNote(id: string) {
    this.clinicalNotes.update(notes => notes.filter(n => n.id !== id));
  }

  addDraftSummaryItem(id: string, text: string) {
    this.draftSummaryItems.update(items => {
      const existing = items.findIndex(i => i.id === id);
      if (existing > -1) {
        const next = [...items];
        next[existing] = { id, text };
        return next;
      }
      return [...items, { id, text }];
    });
  }

  addChecklistItem(item: ChecklistItem) {
    this.checklist.update(items => [...items, item]);
  }

  toggleChecklistItem(id: string) {
    this.checklist.update(items => items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }

  removeChecklistItem(id: string) {
    this.checklist.update(items => items.filter(item => item.id !== id));
  }

  addShoppingListItem(item: ShoppingListItem) {
    this.shoppingList.update(items => [...items, item]);
  }

  toggleShoppingListItem(id: string) {
    this.shoppingList.update(items => items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }

  removeShoppingListItem(id: string) {
    this.shoppingList.update(items => items.filter(item => item.id !== id));
  }

  removeDraftSummaryItem(id: string) {
    this.draftSummaryItems.update(items => items.filter(item => item.id !== id));
  }

  clearDraftSummaryItems() {
    this.draftSummaryItems.set([]);
  }

  requestAnalysisUpdate() {
    this.analysisUpdateRequest.update(v => v + 1);
  }

  requestResearchUrl(url: string) {
    this.requestedResearchUrl.set(url);
  }

  requestResearchSearch(query: string, engine?: 'google' | 'pubmed') {
    if (engine) {
      this.requestedSearchEngine.set(engine);
    }
    this.requestedResearchQuery.set(query);
    this.toggleResearchFrame(true);
  }

  setViewingPastVisit(visit: HistoryEntry | null) {
    this.viewingPastVisit.set(visit);
  }


  // --- State Management for Multi-Patient ---

  /** Clears all patient data to represent a clean slate. */
  clearState() {
    this.selectedPartId.set(null);
    this.selectedNoteId.set(null);
    this.isLiveAgentActive.set(false); // also end any active consult
    this.isResearchFrameVisible.set(false);
    this.issues.set({});
    this.patientGoals.set('');
        this.vitals.set({
            bp: '', hr: '', temp: '', spO2: '', weight: '', height: '',
            vitC: '', vitD3: '', magnesium: '', zinc: '', b12: ''
        });
        this.dynamicNutrients.set([]);
        this.oxidativeStressMarkers.set([]);
        this.antioxidantSources.set([]);
        this.medications.set([]);
    this.clinicalNotes.set([]);
    this.checklist.set([]);
    this.shoppingList.set([]);
    this.activePatientSummary.set(null);
    this.draftSummaryItems.set([]);
    this.biometricHistory.set([]);
    this.requestedResearchUrl.set(null);
    this.requestedResearchQuery.set(null);
    this.requestedSearchEngine.set(null);
    this.viewingPastVisit.set(null);
  }

  /** Clears only patient data, leaving UI state intact, for review mode */
  clearIssuesAndGoalsForReview() {
    this.selectedPartId.set(null);
    this.selectedNoteId.set(null);
    this.issues.set({});
    this.patientGoals.set('');
    this.draftSummaryItems.set([]);
    // Do not clear clinicalNotes or checklist here
  }

  /** Loads the state of a specific patient. */
  loadState(state: PatientState) {
    this.clearState(); // Start from a clean slate
    this.issues.set(state.issues);
        if (state.patientGoals) this.patientGoals.set(state.patientGoals);
        if (state.vitals) this.vitals.set(state.vitals);
        if (state.dynamicNutrients) this.dynamicNutrients.set(state.dynamicNutrients);
        if (state.oxidativeStressMarkers) this.oxidativeStressMarkers.set(state.oxidativeStressMarkers);
        if (state.antioxidantSources) this.antioxidantSources.set(state.antioxidantSources);
        if (state.medications) this.medications.set(state.medications);
    this.clinicalNotes.set(state.clinicalNotes || []);
    this.checklist.set(state.checklist || []);
    this.shoppingList.set(state.shoppingList || []);
    this.viewingPastVisit.set(null); // Ensure we're not in review mode when loading a patient.
  }

  /** Returns the current patient state for saving. */
  getCurrentState(): PatientState {
    return {
            issues: this.issues(),
            patientGoals: this.patientGoals(),
            vitals: this.vitals(),
            dynamicNutrients: this.dynamicNutrients(),
            oxidativeStressMarkers: this.oxidativeStressMarkers(),
            antioxidantSources: this.antioxidantSources(),
            medications: this.medications(),
            clinicalNotes: this.clinicalNotes(),
            checklist: this.checklist(),
            shoppingList: this.shoppingList(),
        };
  }


  // --- Data Aggregation ---
  getAllDataForPrompt(patientHistory: HistoryEntry[] = [], bookmarks: Bookmark[] = []): string {
    const issues = this.issues();
    const vitals = this.vitals();
    const carePlan = this.activePatientSummary();

    // 1. Current Issues
    const partsText = Object.values(issues).flat().map((i: BodyPartIssue) =>
      `- Body Part: ${i.name}, Pain Level: ${i.painLevel}/10, Description: ${i.description}`
    ).join('\n');

    // 2. Vitals
    const vitalsText = `
    - BP: ${vitals.bp || 'N/A'}
    - HR: ${vitals.hr || 'N/A'}
    - Temp: ${vitals.temp || 'N/A'}
    - SpO2: ${vitals.spO2 || 'N/A'}
    - Weight: ${vitals.weight || 'N/A'}, Height: ${vitals.height || 'N/A'}
- Vitamin C: ${vitals.vitC || 'N/A'}
- Vitamin D3: ${vitals.vitD3 || 'N/A'}
- Magnesium: ${vitals.magnesium || 'N/A'}
- Zinc: ${vitals.zinc || 'N/A'}
- Vitamin B12: ${vitals.b12 || 'N/A'}

Dynamic Nutrients:
${this.dynamicNutrients().length > 0 ? this.dynamicNutrients().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Oxidative Stress Markers:
${this.oxidativeStressMarkers().length > 0 ? this.oxidativeStressMarkers().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Antioxidant Sources:
${this.antioxidantSources().length > 0 ? this.antioxidantSources().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Active Medications:
${this.medications().length > 0 ? this.medications().map(m => `- ${m.name}: ${m.value}`).join('\n') : 'None recorded'}

Pain Areas:   `;

    // 3. Historical Context (Last 3 visits and recent notes)
    const recentHistory = patientHistory
      .filter(h => h.type === 'Visit' || h.type === 'NoteCreated' || h.type === 'BookmarkAdded')
      .slice(0, 5) // Limit to last 5 relevant entries to keep context manageable
      .map(h => {
        if (h.type === 'Visit') return `- Visit (${h.date}): ${h.summary}`;
        if (h.type === 'NoteCreated') return `- Note (${h.date}): ${h.summary}`;
        if (h.type === 'BookmarkAdded') return `- Bookmark (${h.date}): ${h.summary}`;
        return '';
      }).join('\n');

    // 4. Research Context & Bookmarks
    const citedBookmarks = bookmarks.filter(b => b.cited);
    const bookmarksText = bookmarks.map(b =>
      `- [${b.cited ? 'CITED' : 'Reference'}] ${b.title}: ${b.url}${b.authors ? ` (Authors: ${b.authors})` : ''}${b.doi ? ` (DOI: ${b.doi})` : ''}`
    ).join('\n');

    let prompt = `
    Patient Goals/Chief Complaint: ${this.patientGoals()}
    
    Vitals:
    ${vitalsText}

    Reported Body Issues (Current):
    ${partsText || 'None selected'}

    Recent History & Context:
    ${recentHistory || 'No recent history available.'}

    Research Context (Bookmarks):
    ${bookmarksText || 'No bookmarks available. Use general medical knowledge.'}
    `;

    if (carePlan) {
      prompt += `
      \n----\n
      IMPORTANT: A physician-created care plan is already in place. Your analysis should align with, and build upon, this plan. Do not contradict it.
      Care Plan:
      ${carePlan}
      \n----
      `;
    }

    return prompt;
  }
}