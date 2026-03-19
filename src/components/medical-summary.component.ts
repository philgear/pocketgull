import { Component, ChangeDetectionStrategy, inject, computed, ElementRef, effect, signal, viewChild, untracked } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PatientStateService, PatientState } from '../services/patient-state.service';
import { PatientManagementService, HistoryEntry, Patient } from '../services/patient-management.service';
import { DraftSummaryItem } from '../services/patient.types';
import { ExportService } from '../services/export.service';
import { ImportService } from '../services/import.service';
import { FhirIntegrationService } from '../services/fhir-integration.service';
import { DictationService } from '../services/dictation.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { marked } from 'marked';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullInputComponent } from './shared/pocket-gull-input.component';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';

@Component({
  selector: 'app-medical-summary',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent, PocketGullInputComponent, PocketGullBadgeComponent, SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* Tighter margin collapsing inside strategy prose to prevent padding blowouts */
    .prose :where(p):first-child { margin-top: 0; }
    .prose :where(p):last-child { margin-bottom: 0; }
    .prose :where(ul):last-child { margin-bottom: 0; }
    .prose :where(h2, h3):first-child { margin-top: 0; }
  `],
  template: `
    @if (patient(); as p) {
      <div class="p-4 sm:p-8 font-sans text-gray-800 dark:text-zinc-200 h-full flex flex-col bg-white dark:bg-[#09090b]">

            <!-- Chart Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start pb-6 border-b border-gray-100 dark:border-zinc-800 gap-4 sm:gap-0">
              <div>
                <h1 class="text-3xl font-light text-[#1C1C1C] dark:text-zinc-100 tracking-tight">{{ p.name }}</h1>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-400 mt-2">{{ today | date:'fullDate' }}</p>
              </div>
            </div>
            
            <!-- Transient SMART on FHIR Success Notification -->
            @if (showEpicSuccess()) {
              <div class="mb-6 bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-lg p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 class="text-xs font-bold uppercase tracking-[0.1em] text-green-800 dark:text-green-300">Epic MyChart Connected</h3>
                    <p class="text-[11px] text-green-600 dark:text-green-500/80">SMART on FHIR token securely established.</p>
                  </div>
                </div>
                <pocket-gull-button variant="ghost" size="xs" (click)="showEpicSuccess.set(false)" icon="M6 18L18 6M6 6l12 12"></pocket-gull-button>
              </div>
            }

            <div class="mt-6 space-y-8">
                <!-- Current Visit / Chief Complaint -->
                <div class="mb-8 font-sans">
                  <div class="flex justify-between items-center mb-3">
                    <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        Current Visit / Chief Complaint
                    </h2>
                    <pocket-gull-button 
                      variant="ghost" 
                      size="xs" 
                      (click)="dictateVisitNote()" 
                      title="Dictate"
                      ariaLabel="Dictate Visit Note"
                      icon="M12 14q-1.25 0-2.125-.875T9 11V5q0-1.25.875-2.125T12 2q1.25 0 2.125.875T15 5v6q0 1.25-.875 2.125T12 14m-1 7v-3.075q-2.6-.35-4.3-2.325T5 11h2q0 2.075 1.463 3.537T12 16q2.075 0 3.538-1.463T17 11h2q0 2.225-1.7 4.2T13 17.925V21z">
                    </pocket-gull-button>
                  </div>
                  <div class="relative group">
                    <pocket-gull-input
                      type="textarea"
                      [value]="newVisitReason()"
                      (valueChange)="newVisitReason.set($event)"
                      [rows]="3"
                      placeholder="Enter reason for today's visit or primary health goal..."
                      class="w-full">
                    </pocket-gull-input>
                  </div>
                  <div class="flex items-center justify-end mt-3">
                    <pocket-gull-button 
                      (click)="saveNewVisit()" 
                      [disabled]="!newVisitReason().trim()"
                      size="sm">
                      Save Visit Note
                    </pocket-gull-button>
                  </div>
                </div>

                <!-- Vitals Grid -->
                <!-- Vitals & Biometrics -->
                <section>
                    <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-6">Biometric Telemetry</h2>
                </section>
                <div class="flex flex-col gap-3 mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8">
                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">BP</span>
                    </div>
                    <div class="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-bp"
                        variant="minimal"
                        placeholder="120/80"
                        [value]="state.vitals().bp"
                        (valueChange)="state.updateVital('bp', $event)"
                        class="w-full">
                      </pocket-gull-input>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">HR</span>
                    </div>
                    <div class="flex-1 w-full flex items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-hr"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().hr"
                        (valueChange)="state.updateVital('hr', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                      <span class="text-xs text-gray-400 dark:text-zinc-500 font-bold tracking-tighter shrink-0 uppercase pl-2">BPM</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">SpO2</span>
                    </div>
                    <div class="flex-1 w-full flex items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-spo2"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().spO2"
                        (valueChange)="state.updateVital('spO2', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                      <span class="text-xs text-gray-400 dark:text-zinc-500 font-bold tracking-tighter shrink-0 uppercase pl-2">%</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Temp</span>
                    </div>
                    <div class="flex-1 w-full flex items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-temp"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().temp"
                        (valueChange)="state.updateVital('temp', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                      <span class="text-xs text-gray-400 dark:text-zinc-500 font-bold tracking-tighter shrink-0 uppercase pl-2">°F</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Weight</span>
                    </div>
                    <div class="flex-1 w-full flex items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-weight"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().weight"
                        (valueChange)="state.updateVital('weight', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                      <span class="text-xs text-gray-400 dark:text-zinc-500 font-bold tracking-tighter shrink-0 uppercase pl-2">LBS</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Height</span>
                    </div>
                    <div class="flex-1 w-full flex items-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-height"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().height"
                        (valueChange)="state.updateVital('height', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                      <span class="text-xs text-gray-400 dark:text-zinc-500 font-bold tracking-tighter shrink-0 uppercase pl-2">IN</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] leading-normal">Vit C</span>
                    </div>
                    <div class="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-vitC"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().vitC || ''"
                        (valueChange)="state.updateVital('vitC', $event)"
                        class="flex-1 min-w-0">
                      </pocket-gull-input>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] leading-normal">Vit D3</span>
                    </div>
                    <div class="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-vitD3"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().vitD3 || ''"
                        (valueChange)="state.updateVital('vitD3', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] leading-normal">Magnesium</span>
                    </div>
                    <div class="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-magnesium"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().magnesium || ''"
                        (valueChange)="state.updateVital('magnesium', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] leading-normal">Zinc</span>
                    </div>
                    <div class="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-zinc"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().zinc || ''"
                        (valueChange)="state.updateVital('zinc', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-24 shrink-0">
                        <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] leading-normal">Vit B12</span>
                    </div>
                    <div class="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg pr-4">
                      <pocket-gull-input
                        id="vitals-b12"
                        variant="minimal"
                        placeholder="--"
                        [value]="state.vitals().b12 || ''"
                        (valueChange)="state.updateVital('b12', $event)"
                        class="w-full min-w-0">
                      </pocket-gull-input>
                    </div>
                  </div>
                </div>

                <!-- Dynamic Nutrients Grid -->
                <section>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Dynamic Nutrient Panel</h2>
                        <pocket-gull-button 
                            variant="ghost" 
                            size="xs" 
                            (click)="state.addDynamicNutrient()" 
                            icon="M12 4v16m8-8H4">
                            Add Nutrient
                        </pocket-gull-button>
                    </div>
                    
                    @if (state.dynamicNutrients().length > 0) {
                        <div class="flex flex-col gap-3 mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8">
                            @for (nutrient of state.dynamicNutrients(); track nutrient.id) {
                                <div class="flex items-center gap-3">
                                    <div class="flex-1">
                                        <pocket-gull-input
                                            [value]="nutrient.name"
                                            (valueChange)="state.updateDynamicNutrient(nutrient.id, 'name', $event)"
                                            placeholder="Nutrient Name (e.g. Glutathione)"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <div class="w-32">
                                        <pocket-gull-input
                                            [value]="nutrient.value"
                                            (valueChange)="state.updateDynamicNutrient(nutrient.id, 'value', $event)"
                                            placeholder="Value"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <pocket-gull-button 
                                        variant="ghost" 
                                        size="sm" 
                                        (click)="state.removeDynamicNutrient(nutrient.id)" 
                                        icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        ariaLabel="Remove Nutrient">
                                    </pocket-gull-button>
                                </div>
                            }
                        </div>
                    } @else {
                        <div class="mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8 text-center text-sm font-light text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-dashed">
                            No dynamic nutrients recorded. Click "Add Nutrient" to begin tracking specialized compounds.
                        </div>
                    }
                </section>

                <!-- Active Medications Grid -->
                <section>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Active Medications</h2>
                        <pocket-gull-button 
                            variant="ghost" 
                            size="xs" 
                            (click)="state.addMedication()" 
                            icon="M12 4v16m8-8H4">
                            Add Medication
                        </pocket-gull-button>
                    </div>
                    
                    @if (state.medications().length > 0) {
                        <div class="flex flex-col gap-3 mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8">
                            @for (med of state.medications(); track med.id) {
                                <div class="flex items-center gap-3">
                                    <div class="flex-1">
                                        <pocket-gull-input
                                            [value]="med.name"
                                            (valueChange)="state.updateMedication(med.id, 'name', $event)"
                                            placeholder="Medication Name"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <div class="w-32">
                                        <pocket-gull-input
                                            [value]="med.value"
                                            (valueChange)="state.updateMedication(med.id, 'value', $event)"
                                            placeholder="Dosage"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <pocket-gull-button 
                                        variant="ghost" 
                                        size="sm" 
                                        (click)="state.removeMedication(med.id)" 
                                        icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        ariaLabel="Remove">
                                    </pocket-gull-button>
                                </div>
                            }
                        </div>
                    } @else {
                        <div class="mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8 text-center text-sm font-light text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-dashed">
                            No active medications recorded. Click "Add Medication" to begin tracking.
                        </div>
                    }
                </section>
                
                <!-- Oxidative Stress Panel Grid -->
                <section>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Oxidative Stress Panel</h2>
                        <pocket-gull-button 
                            variant="ghost" 
                            size="xs" 
                            (click)="state.addOxidativeStressMarker()" 
                            icon="M12 4v16m8-8H4">
                            Add Marker
                        </pocket-gull-button>
                    </div>
                    
                    @if (state.oxidativeStressMarkers().length > 0) {
                        <div class="flex flex-col gap-3 mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8">
                            @for (marker of state.oxidativeStressMarkers(); track marker.id) {
                                <div class="flex items-center gap-3">
                                    <div class="flex-1">
                                        <pocket-gull-input
                                            [value]="marker.name"
                                            (valueChange)="state.updateOxidativeStressMarker(marker.id, 'name', $event)"
                                            placeholder="Marker (e.g. MDA, Isoprostanes)"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <div class="w-32">
                                        <pocket-gull-input
                                            [value]="marker.value"
                                            (valueChange)="state.updateOxidativeStressMarker(marker.id, 'value', $event)"
                                            placeholder="Value"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <pocket-gull-button 
                                        variant="ghost" 
                                        size="sm" 
                                        (click)="state.removeOxidativeStressMarker(marker.id)" 
                                        icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        ariaLabel="Remove">
                                    </pocket-gull-button>
                                </div>
                            }
                        </div>
                    } @else {
                        <div class="mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8 text-center text-sm font-light text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-dashed">
                            No oxidative stress markers recorded. Click "Add Marker" to begin tracking.
                        </div>
                    }
                </section>
                
                <!-- Antioxidant Sources Grid -->
                <section>
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em]">Antioxidant Sources Panel</h2>
                        <pocket-gull-button 
                            variant="ghost" 
                            size="xs" 
                            (click)="state.addAntioxidantSource()" 
                            icon="M12 4v16m8-8H4">
                            Add Source
                        </pocket-gull-button>
                    </div>
                    
                    @if (state.antioxidantSources().length > 0) {
                        <div class="flex flex-col gap-3 mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8">
                            @for (source of state.antioxidantSources(); track source.id) {
                                <div class="flex items-center gap-3">
                                    <div class="flex-1">
                                        <pocket-gull-input
                                            [value]="source.name"
                                            (valueChange)="state.updateAntioxidantSource(source.id, 'name', $event)"
                                            placeholder="Source (e.g. Glutathione, NAC)"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <div class="w-32">
                                        <pocket-gull-input
                                            [value]="source.value"
                                            (valueChange)="state.updateAntioxidantSource(source.id, 'value', $event)"
                                            placeholder="Value"
                                            class="w-full">
                                        </pocket-gull-input>
                                    </div>
                                    <pocket-gull-button 
                                        variant="ghost" 
                                        size="sm" 
                                        (click)="state.removeAntioxidantSource(source.id)" 
                                        icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        ariaLabel="Remove">
                                    </pocket-gull-button>
                                </div>
                            }
                        </div>
                    } @else {
                        <div class="mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8 text-center text-sm font-light text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-dashed">
                            No antioxidant sources recorded. Click "Add Source" to begin tracking.
                        </div>
                    }
                </section>

                <!-- Patient Trends Chart -->
                @defer (on viewport) {
                  <section>
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-0">Retrospective Data Visualization</h2>
                        <div class="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded border border-gray-200 dark:border-zinc-800">
                          <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-zinc-100 transition-colors">
                            <input type="checkbox" [checked]="showCDCBaseline()" (change)="showCDCBaseline.set(!showCDCBaseline())" class="w-3.5 h-3.5 accent-[#4285F4] rounded border-gray-300 dark:border-zinc-700 bg-transparent flex-shrink-0 cursor-pointer">
                            <span class="flex items-center gap-1.5"><div class="w-2 h-0.5 bg-[#4285F4]"></div> CDC Baselines</span>
                          </label>
                          <label class="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-zinc-100 transition-colors">
                            <input type="checkbox" [checked]="showWHOBaseline()" (change)="showWHOBaseline.set(!showWHOBaseline())" class="w-3.5 h-3.5 accent-[#689F38] rounded border-gray-300 dark:border-zinc-700 bg-transparent flex-shrink-0 cursor-pointer">
                            <span class="flex items-center gap-1.5"><div class="w-2 h-0.5 bg-[#689F38]"></div> WHO Baselines</span>
                          </label>
                        </div>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Pain Path / 0–10</h3>
                              <div class="relative flex-1 min-h-0"><canvas #painChart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Blood Pressure / Composite</h3>
                              <div class="relative flex-1 min-h-0"><canvas #bpChart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Pulse Rate / BPM</h3>
                              <div class="relative flex-1 min-h-0"><canvas #hrChart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Oxygen Saturation / %</h3>
                              <div class="relative flex-1 min-h-0"><canvas #spo2Chart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col md:col-span-2">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Core Temperature / Trend</h3>
                              <div class="relative flex-1 min-h-0"><canvas #tempChart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Vitamin C</h3>
                              <div class="relative flex-1 min-h-0"><canvas #vitCChart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Vitamin D3</h3>
                              <div class="relative flex-1 min-h-0"><canvas #vitD3Chart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Magnesium</h3>
                              <div class="relative flex-1 min-h-0"><canvas #magnesiumChart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Zinc</h3>
                              <div class="relative flex-1 min-h-0"><canvas #zincChart></canvas></div>
                          </div>
                          <div class="w-full h-64 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded p-4 sm:p-6 flex flex-col md:col-span-2">
                              <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">Vitamin B12</h3>
                              <div class="relative flex-1 min-h-0"><canvas #b12Chart></canvas></div>
                          </div>
                      </div>
                  </section>
                } @placeholder {
                  <section>
                    <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-6">Retrospective Data Visualization</h2>
                    <div class="h-64 w-full flex items-center justify-center bg-gray-50/50 dark:bg-zinc-900 border border-dashed border-gray-200 dark:border-zinc-800 rounded">
                      <span class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Scroll to load charts</span>
                    </div>
                  </section>
                }

                <!-- Pre-existing Conditions -->
                @if(p.preexistingConditions.length > 0) {
                  <section>
                      <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-4">Historical Conditions</h2>
                      <div class="flex flex-wrap gap-2">
                          @for(condition of p.preexistingConditions; track condition) {
                            <pocket-gull-badge [label]="condition" severity="neutral"></pocket-gull-badge>
                          }
                      </div>
                  </section>
                }

                <!-- Draft Care Plan -->
                @if (state.draftSummaryItems().length > 0) {
                  <section class="bg-gray-50 dark:bg-zinc-900 p-4 sm:p-6 border border-gray-200 dark:border-zinc-800 rounded">
                    <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-4 flex justify-between items-center">
                      <pocket-gull-badge label="Care Recommendation Draft" severity="success" [hasIcon]="true">
                        <div badge-icon class="w-1.5 h-1.5 bg-[#689F38] rounded-full animate-pulse"></div>
                      </pocket-gull-badge>
                    </h2>
                    <ul class="space-y-3 text-[13px] text-[#1C1C1C] dark:text-zinc-100">
                      @for (item of state.draftSummaryItems(); track $index) {
                        <li class="pl-0">
                          <div class="flex justify-between items-start gap-3 group">
                             <div class="w-1 h-4 bg-gray-200 dark:bg-zinc-700 mt-0.5 shrink-0 group-hover:bg-[#689F38] transition-colors"></div>
                            <span class="flex-1 font-medium">{{ item.text }}</span>
                            <pocket-gull-button 
                              (click)="removeDraftItem(item)" 
                              variant="ghost" 
                              size="xs" 
                              title="Remove"
                              ariaLabel="Remove Draft Item"
                              icon="M18 6L6 18M6 6l12 12">
                            </pocket-gull-button>
                          </div>
                        </li>
                      }
                    </ul>
                    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
                       <pocket-gull-button 
                          (click)="finalizeDraftPlan()" 
                          variant="secondary" 
                          size="sm"
                          trailingIcon="M5 12l5 5l10-10">
                          Append to Active Strategics
                       </pocket-gull-button>
                    </div>
                  </section>
                }

                <!-- Active Care Plan -->
                @if (activeCarePlanHTML(); as html) {
                  <section>
                    <h2 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.15em] mb-4">Active Strategy Overview</h2>
                    <div class="p-4 sm:p-8 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-zinc-800 rounded prose dark:prose-invert prose-sm max-w-none prose-p:text-[#1C1C1C] dark:prose-p:text-zinc-100 prose-p:font-light prose-headings:text-[11px] prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-[0.1em] prose-headings:text-gray-500 dark:prose-headings:text-zinc-400" [innerHTML]="html | safeHtml"></div>
                  </section>
                }
      </div>
    </div>
    } @else {
        <div class="p-8 text-center text-gray-500 dark:text-zinc-400 h-full flex items-center justify-center">
            <p class="text-sm font-medium uppercase tracking-widest">No patient selected.</p>
        </div>
    }


  `
})
export class MedicalChartSummaryComponent {
  state = inject(PatientStateService);
  patientManager = inject(PatientManagementService);
  exportService = inject(ExportService);
  fhirAuth = inject(FhirIntegrationService);
  dictation = inject(DictationService);
  clinicalAI = inject(ClinicalIntelligenceService);
  http = inject(HttpClient);
  
  today = new Date();
  newVisitReason = signal('');
  showExportMenu = signal(false);
  showEpicSuccess = signal(false);
  isExporting = signal(false);

  // BigQuery Healthcare Baseline Overlays
  baselines = signal<any>(null);
  showCDCBaseline = signal(false);
  showWHOBaseline = signal(false);

  ngOnInit() {
    // Fetch aggregated baselines from server
    this.http.get('/api/health/baselines').subscribe({
        next: (data) => this.baselines.set(data),
        error: (err) => console.error('Failed to load world health baselines', err)
    });
  }

  async exportToBigQuery() {
    const p = this.patient();
    if (!p) return;
    this.isExporting.set(true);
    try {
      await this.exportService.exportToBigQuery(p);
      this.showEpicSuccess.set(true); // Reusing the success toast to signal export completion as a generic notification for now
      setTimeout(() => this.showEpicSuccess.set(false), 3000);
    } catch (e) {
      console.error('Failed to export to BigQuery', e);
      alert('BigQuery export failed. Please check the console.');
    } finally {
      this.isExporting.set(false);
    }
  }



  painChartRef = viewChild<ElementRef<HTMLCanvasElement>>('painChart');
  bpChartRef = viewChild<ElementRef<HTMLCanvasElement>>('bpChart');
  hrChartRef = viewChild<ElementRef<HTMLCanvasElement>>('hrChart');
  spo2ChartRef = viewChild<ElementRef<HTMLCanvasElement>>('spo2Chart');
  tempChartRef = viewChild<ElementRef<HTMLCanvasElement>>('tempChart');
  vitCChartRef = viewChild<ElementRef<HTMLCanvasElement>>('vitCChart');
  vitD3ChartRef = viewChild<ElementRef<HTMLCanvasElement>>('vitD3Chart');
  magnesiumChartRef = viewChild<ElementRef<HTMLCanvasElement>>('magnesiumChart');
  zincChartRef = viewChild<ElementRef<HTMLCanvasElement>>('zincChart');
  b12ChartRef = viewChild<ElementRef<HTMLCanvasElement>>('b12Chart');

  private charts: { [key: string]: any | null } = {
    pain: null,
    bp: null,
    hr: null,
    spo2: null,
    temp: null,
    vitC: null,
    vitD3: null,
    magnesium: null,
    zinc: null,
    b12: null
  };

  patient = computed(() => {
    const id = this.patientManager.selectedPatientId();
    if (!id) return null;
    return this.patientManager.patients().find(p => p.id === id) ?? null;
  });

  vitals = this.state.vitals;

  bpData = computed(() => {
    const bpString = this.state.vitals().bp;
    if (!bpString || !bpString.includes('/')) return { systolic: 0, diastolic: 0, valid: false, systolicWidth: 0, diastolicWidth: 0 };

    const [systolic, diastolic] = bpString.split('/').map(s => parseInt(s.trim(), 10));
    const valid = !isNaN(systolic) && !isNaN(diastolic);

    // Max value on graph for scaling
    const maxSystolic = 200;
    const maxDiastolic = 150;

    return {
      systolic,
      diastolic,
      valid,
      systolicWidth: (systolic / maxSystolic) * 100,
      diastolicWidth: (diastolic / maxDiastolic) * 100
    };
  });

  activeCarePlanHTML = computed(() => {
    const plan = this.state.activePatientSummary();
    if (!plan) return null;
    try {
      return marked.parse(plan, { gfm: true, breaks: true }) as string;
    } catch (e) {
      console.error('Markdown parse error for care plan', e);
      return `<p>Error parsing care plan.</p>`;
    }
  });

  private chartRenderTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('epic_connected') === 'true') {
        this.showEpicSuccess.set(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => this.showEpicSuccess.set(false), 5000);
      }
    }

    effect(() => {
      // Re-render chart when patient, vitals, or issues change
      // or when the viewChild charts become available on screen via @defer
      const p = this.patient();
      this.state.vitals();
      this.state.issues();
      this.showCDCBaseline();
      this.showWHOBaseline();
      this.baselines();
      const pc = this.painChartRef();
      const bp = this.bpChartRef();
      const hr = this.hrChartRef();
      const spo2 = this.spo2ChartRef();
      const temp = this.tempChartRef();
      const vitC = this.vitCChartRef();
      const vitD3 = this.vitD3ChartRef();
      const mag = this.magnesiumChartRef();
      const zinc = this.zincChartRef();
      const b12 = this.b12ChartRef();

      if (p && pc && bp && hr && spo2 && temp && vitC && vitD3 && mag && zinc && b12) {
        untracked(() => {
          if (this.chartRenderTimeout) {
            clearTimeout(this.chartRenderTimeout);
          }
          this.chartRenderTimeout = setTimeout(() => this.renderChart(), 600);
        });
      }
    });
  }

  private async renderChart() {
    const p = this.patient();
    if (!p) return;

    // Dynamically import Chart.js only when needed to optimize bundle size
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);

    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });

    const dates: string[] = [];
    const painLevels: number[] = [];
    const systolicLevels: (number | null)[] = [];
    const diastolicLevels: (number | null)[] = [];
    const hrLevels: (number | null)[] = [];
    const spo2Levels: (number | null)[] = [];
    const tempLevels: (number | null)[] = [];
    const vitCLevels: (number | null)[] = [];
    const vitD3Levels: (number | null)[] = [];
    const magnesiumLevels: (number | null)[] = [];
    const zincLevels: (number | null)[] = [];
    const b12Levels: (number | null)[] = [];

    const parseBp = (bp: string | undefined): [number | null, number | null] => {
      if (!bp || !bp.includes('/')) return [null, null];
      const parts = bp.split('/');
      return [parseInt(parts[0], 10) || null, parseInt(parts[1], 10) || null];
    };

    const parseNum = (val: string | undefined): number | null => {
      if (!val) return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const sortedHistory = [...p.history].sort((a, b) => a.date.localeCompare(b.date));

    sortedHistory.forEach(entry => {
      if (entry.type === 'Visit' || entry.type === 'ChartArchived') {
        let maxPain = 0;
        if (entry.state && entry.state.issues) {
          Object.values(entry.state.issues).flat().forEach(issue => {
            if (issue.painLevel > maxPain) {
              maxPain = issue.painLevel;
            }
          });
        }
        dates.push(entry.date);
        painLevels.push(maxPain);

        if (entry.state && entry.state.vitals) {
          const [sys, dia] = parseBp(entry.state.vitals.bp);
          systolicLevels.push(sys);
          diastolicLevels.push(dia);
          hrLevels.push(parseNum(entry.state.vitals.hr));
          spo2Levels.push(parseNum(entry.state.vitals.spO2));
          tempLevels.push(parseNum(entry.state.vitals.temp));
          vitCLevels.push(parseNum(entry.state.vitals.vitC));
          vitD3Levels.push(parseNum(entry.state.vitals.vitD3));
          magnesiumLevels.push(parseNum(entry.state.vitals.magnesium));
          zincLevels.push(parseNum(entry.state.vitals.zinc));
          b12Levels.push(parseNum(entry.state.vitals.b12));
        } else {
          systolicLevels.push(null);
          diastolicLevels.push(null);
          hrLevels.push(null);
          spo2Levels.push(null);
          tempLevels.push(null);
          vitCLevels.push(null);
          vitD3Levels.push(null);
          magnesiumLevels.push(null);
          zincLevels.push(null);
          b12Levels.push(null);
        }
      }
    });

    let currentMaxPain = 0;
    const currentIssues = this.state.issues();
    Object.values(currentIssues).flat().forEach(issue => {
      if (issue.painLevel > currentMaxPain) {
        currentMaxPain = issue.painLevel;
      }
    });

    dates.push('Current');
    painLevels.push(currentMaxPain);

    const [currSys, currDia] = parseBp(this.state.vitals().bp);
    systolicLevels.push(currSys);
    diastolicLevels.push(currDia);
    hrLevels.push(parseNum(this.state.vitals().hr));
    spo2Levels.push(parseNum(this.state.vitals().spO2));
    tempLevels.push(parseNum(this.state.vitals().temp));
    vitCLevels.push(parseNum(this.state.vitals().vitC));
    vitD3Levels.push(parseNum(this.state.vitals().vitD3));
    magnesiumLevels.push(parseNum(this.state.vitals().magnesium));
    zincLevels.push(parseNum(this.state.vitals().zinc));
    b12Levels.push(parseNum(this.state.vitals().b12));

    const createChart = (ref: ElementRef<HTMLCanvasElement> | undefined, label: string, data: (number | null)[], color: string, dataset2?: any, yOpts?: any, baselineKey?: string) => {
      if (!ref || !ref.nativeElement) return null;

      // Destroy existing chart if present to prevent "Canvas is already in use" error
      const existingChart = Chart.getChart(ref.nativeElement);
      if (existingChart) {
        existingChart.destroy();
      }

      const ctx = ref.nativeElement.getContext('2d');
      if (!ctx) return null;

      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, color + '40');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      const datasets: any[] = [{
        label,
        data,
        borderColor: color,
        backgroundColor: gradient,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        spanGaps: true
      }];

      if (dataset2) {
        let grad2: string | CanvasGradient = 'transparent';
        if (dataset2.borderColor) {
          grad2 = ctx.createLinearGradient(0, 0, 0, 300);
          grad2.addColorStop(0, dataset2.borderColor + '40');
          grad2.addColorStop(1, 'rgba(255,255,255,0)');
        }
        datasets.push({
          ...dataset2,
          backgroundColor: grad2,
          borderWidth: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: dataset2.borderColor || color,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
          spanGaps: true
        });
      }

      if (baselineKey && this.baselines()) {
          const info = this.baselines()[baselineKey];
          if (info) {
              const pushOverlay = (src: string, themeColor: string) => {
                  const b = info.find((x: any) => x.source === src);
                  if (!b) return;
                  if (typeof b.value === 'string' && b.value.includes('/')) {
                      const parts = b.value.split('/');
                      datasets.push({
                          label: `${src} Sys. Avg`,
                          data: Array(dates.length).fill(parseInt(parts[0], 10)),
                          borderColor: themeColor, borderDash: [4, 4], borderWidth: 2, pointRadius: 0, fill: false
                      });
                      datasets.push({
                          label: `${src} Dia. Avg`,
                          data: Array(dates.length).fill(parseInt(parts[1], 10)),
                          borderColor: themeColor, borderDash: [2, 2], borderWidth: 2, pointRadius: 0, fill: false
                      });
                  } else {
                      datasets.push({
                          label: `${src} Avg Baseline`,
                          data: Array(dates.length).fill(parseFloat(b.value)),
                          borderColor: themeColor, borderDash: [4, 4], borderWidth: 2, pointRadius: 0, fill: false
                      });
                  }
              };
              if (this.showCDCBaseline()) pushOverlay('CDC', '#4285F4');
              if (this.showWHOBaseline()) pushOverlay('WHO', '#689F38');
          }
      }

      return new Chart(ctx, {
        type: 'line',
        data: { labels: dates, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: 'Inter',
                  size: 9,
                  weight: 'bold'
                },
                color: '#9CA3AF'
              },
              border: {
                display: false
              },
              ...yOpts
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  family: 'Inter',
                  size: 9,
                  weight: 'bold'
                },
                color: '#9CA3AF',
                autoSkip: true,
                maxRotation: 0
              },
              border: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: !!dataset2,
              labels: {
                font: {
                  family: 'Inter',
                  size: 9,
                  weight: 'bold'
                },
                usePointStyle: true,
                boxWidth: 6,
                padding: 20
              }
            },
            tooltip: {
              backgroundColor: '#1C1C1C',
              titleFont: { family: 'Inter', size: 10, weight: 'bold' },
              bodyFont: { family: 'Inter', size: 12 },
              padding: 12,
              cornerRadius: 4,
              displayColors: false,
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.parsed.y}`
              }
            }
          }
        }
      });
    };

    setTimeout(() => {
      this.charts['pain'] = createChart(this.painChartRef(), 'PAIN LEVEL', painLevels, '#689F38', undefined, { max: 10, beginAtZero: true, ticks: { stepSize: 2 } });
      this.charts['bp'] = createChart(this.bpChartRef(), 'SYSTOLIC', systolicLevels, '#D0021B', {
        label: 'DIASTOLIC',
        data: diastolicLevels,
        borderColor: '#64748B'
      }, undefined, 'bloodPressure');
      this.charts['hr'] = createChart(this.hrChartRef(), 'HEART RATE', hrLevels, '#94A3B8', undefined, undefined, 'heartRate');
      this.charts['spo2'] = createChart(this.spo2ChartRef(), 'OXYGEN SATURATION', spo2Levels, '#94A3B8');
      this.charts['temp'] = createChart(this.tempChartRef(), 'CORE TEMPERATURE', tempLevels, '#94A3B8', undefined, undefined, 'temperature');
      this.charts['vitC'] = createChart(this.vitCChartRef(), 'VITAMIN C', vitCLevels, '#F59E0B');
      this.charts['vitD3'] = createChart(this.vitD3ChartRef(), 'VITAMIN D3', vitD3Levels, '#F59E0B');
      this.charts['magnesium'] = createChart(this.magnesiumChartRef(), 'MAGNESIUM', magnesiumLevels, '#F59E0B');
      this.charts['zinc'] = createChart(this.zincChartRef(), 'ZINC', zincLevels, '#F59E0B');
      this.charts['b12'] = createChart(this.b12ChartRef(), 'VITAMIN B12', b12Levels, '#F59E0B');
    }, 0);
  }



  removeDraftItem(item: DraftSummaryItem) {
    this.state.removeDraftSummaryItem(item.id);
  }

  get hasDraftItems() {
    const draftItems = this.state.draftSummaryItems();
    return draftItems && draftItems.length > 0;
  }

  updateVital(key: keyof PatientState['vitals'], event: any) {
    this.state.updateVital(key, event.target.value);
  }

  dictateVisitNote() {
    this.dictation.openDictationModal(this.newVisitReason(), (result: string) => {
      this.newVisitReason.set(result);
    });
  }

  saveNewVisit() {
    const reason = this.newVisitReason().trim();
    const patient = this.patient();
    if (!reason || !patient) return;

    // Capture the state at the time of this visit
    const visitState: PatientState = {
      ...this.state.getCurrentState(),
      patientGoals: reason // The primary goal for this snapshot is the reason for the visit.
    };

    const newEntry: HistoryEntry = {
      type: 'Visit',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      summary: reason,
      state: visitState
    };

    // Add to history (this also updates the patient's lastVisit)
    this.patientManager.addHistoryEntry(patient.id, newEntry);

    // Update the patient's primary 'patientGoals' to reflect this latest visit
    this.patientManager.updatePatientDetails(patient.id, { patientGoals: reason });

    // Reset the form
    this.newVisitReason.set('');
  }

  exportNativeJson() {
    const patient = this.patient();
    if (!patient) return;
    this.exportService.downloadAsNativeJson(patient);
    this.showExportMenu.set(false);
  }

  connectToEpic() {
    this.fhirAuth.authorize();
  }

  exportFhirBundle() {
    const patient = this.patient();
    if (!patient) return;
    this.exportService.downloadAsFhirBundle(patient);
    this.showExportMenu.set(false);
  }

  discardDrafts() {
    const draftItems = this.state.draftSummaryItems();

    if (draftItems && draftItems.length > 0) {
      if (confirm('Discard your draft modifications and revert to the saved Patient Summary?')) {
        this.state.clearDraftSummaryItems();
      }
    }
  }

  finalizeDraftPlan() {
    let plan = this.state.activePatientSummary() || '';
    const draftItems = this.state.draftSummaryItems();
    if (draftItems.length > 0) {
      const newContent = draftItems.map(item => `- ${item.text}`).join('\n');
      plan = plan ? `${plan}\n\n### Added ${new Date().toLocaleDateString()}\n${newContent}` : `### Patient Summary\n${newContent}`;
      this.state.updateActivePatientSummary(plan);
      this.state.clearDraftSummaryItems();
    }
  }
}
