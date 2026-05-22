import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LociPalaceService, ILocusEntry } from '../services/loci-palace.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-memory-palace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top banner / intro -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-zinc-950 p-6 sm:p-8 text-white border border-purple-500/20 shadow-xl">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent)] pointer-events-none"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold uppercase tracking-widest text-purple-300">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
              Method of Loci Palace
            </div>
            <h2 class="text-xl sm:text-2xl font-extrabold tracking-tight">Spatial Clinical Memory Palace</h2>
            <p class="text-xs text-zinc-300 leading-relaxed font-medium">
              Anchor clinical findings, observations, and therapeutic directives to virtual spatial rooms. This cognitive memory warehouse streams updates directly to a secure Google BigQuery analytics dataset.
            </p>
          </div>
          <div class="flex gap-3 shrink-0">
            <button (click)="openAddModal()" 
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-500 transition-colors rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 border border-purple-400/20 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              Place Locus
            </button>
          </div>
        </div>
      </div>

      <!-- Spatial Layout Palace Visualization -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Interactive Map Panel -->
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div class="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-zinc-850 pb-4">
              <div>
                <h3 class="text-xs font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-widest">Architectural Floor Plan</h3>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Select a chamber to focus recollection</p>
              </div>
              @if (selectedRoom()) {
                <button (click)="selectedRoom.set(null)" 
                        class="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 hover:underline">
                  [RESET ROOM FOCUS]
                </button>
              }
            </div>

            <!-- Visual grid map of rooms -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px]">
              
              <!-- Room: Foyer -->
              <div (click)="selectedRoom.set('Foyer')"
                   [class.ring-2]="selectedRoom() === 'Foyer'"
                   class="group relative overflow-hidden rounded-xl p-5 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ring-purple-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-xl rounded-full"></div>
                <div class="relative z-10 flex flex-col justify-between h-full min-h-[100px]">
                  <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CHAMBER 01</span>
                    <span class="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[9px] font-bold">{{ getRoomCount('Foyer') }} LOCI</span>
                  </div>
                  <div class="mt-4">
                    <h4 class="text-sm font-extrabold text-gray-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Foyer</h4>
                    <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Clock / Entryway</p>
                    
                    @if (getLociForRoom('Foyer'); as roomLoci) {
                      @if (roomLoci.length > 0) {
                        <div class="mt-3 flex flex-wrap gap-1">
                          @for (locus of roomLoci; track locus.id) {
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono font-bold text-purple-600 dark:text-purple-300"
                                  [title]="locus.content">
                              <span class="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                              {{ locus.locus }}
                            </span>
                          }
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>

              <!-- Room: Library -->
              <div (click)="selectedRoom.set('Library')"
                   [class.ring-2]="selectedRoom() === 'Library'"
                   class="group relative overflow-hidden rounded-xl p-5 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ring-purple-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full"></div>
                <div class="relative z-10 flex flex-col justify-between h-full min-h-[100px]">
                  <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CHAMBER 02</span>
                    <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold">{{ getRoomCount('Library') }} LOCI</span>
                  </div>
                  <div class="mt-4">
                    <h4 class="text-sm font-extrabold text-gray-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Library</h4>
                    <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Bookshelf / Archives</p>
                    
                    @if (getLociForRoom('Library'); as roomLoci) {
                      @if (roomLoci.length > 0) {
                        <div class="mt-3 flex flex-wrap gap-1">
                          @for (locus of roomLoci; track locus.id) {
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono font-bold text-purple-600 dark:text-purple-300"
                                  [title]="locus.content">
                              <span class="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                              {{ locus.locus }}
                            </span>
                          }
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>

              <!-- Room: Office -->
              <div (click)="selectedRoom.set('Office')"
                   [class.ring-2]="selectedRoom() === 'Office'"
                   class="group relative overflow-hidden rounded-xl p-5 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ring-purple-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-xl rounded-full"></div>
                <div class="relative z-10 flex flex-col justify-between h-full min-h-[100px]">
                  <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CHAMBER 03</span>
                    <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-[9px] font-bold">{{ getRoomCount('Office') }} LOCI</span>
                  </div>
                  <div class="mt-4">
                    <h4 class="text-sm font-extrabold text-gray-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Office</h4>
                    <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Desk / Workspace</p>
                    
                    @if (getLociForRoom('Office'); as roomLoci) {
                      @if (roomLoci.length > 0) {
                        <div class="mt-3 flex flex-wrap gap-1">
                          @for (locus of roomLoci; track locus.id) {
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono font-bold text-purple-600 dark:text-purple-300"
                                  [title]="locus.content">
                              <span class="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                              {{ locus.locus }}
                            </span>
                          }
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>

              <!-- Room: Laboratory -->
              <div (click)="selectedRoom.set('Laboratory')"
                   [class.ring-2]="selectedRoom() === 'Laboratory'"
                   class="group relative overflow-hidden rounded-xl p-5 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ring-purple-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-xl rounded-full"></div>
                <div class="relative z-10 flex flex-col justify-between h-full min-h-[100px]">
                  <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CHAMBER 04</span>
                    <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[9px] font-bold">{{ getRoomCount('Laboratory') }} LOCI</span>
                  </div>
                  <div class="mt-4">
                    <h4 class="text-sm font-extrabold text-gray-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Laboratory</h4>
                    <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Biomarkers / IVitals</p>
                    
                    @if (getLociForRoom('Laboratory'); as roomLoci) {
                      @if (roomLoci.length > 0) {
                        <div class="mt-3 flex flex-wrap gap-1">
                          @for (locus of roomLoci; track locus.id) {
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono font-bold text-purple-600 dark:text-purple-300"
                                  [title]="locus.content">
                              <span class="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                              {{ locus.locus }}
                            </span>
                          }
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>

              <!-- Room: Sanctuary -->
              <div (click)="selectedRoom.set('Sanctuary')"
                   [class.ring-2]="selectedRoom() === 'Sanctuary'"
                   class="group relative overflow-hidden rounded-xl p-5 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ring-purple-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-xl rounded-full"></div>
                <div class="relative z-10 flex flex-col justify-between h-full min-h-[100px]">
                  <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">CHAMBER 05</span>
                    <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[9px] font-bold">{{ getRoomCount('Sanctuary') }} LOCI</span>
                  </div>
                  <div class="mt-4">
                    <h4 class="text-sm font-extrabold text-gray-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Sanctuary</h4>
                    <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Quiet / Sleep Therapy</p>
                    
                    @if (getLociForRoom('Sanctuary'); as roomLoci) {
                      @if (roomLoci.length > 0) {
                        <div class="mt-3 flex flex-wrap gap-1">
                          @for (locus of roomLoci; track locus.id) {
                            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono font-bold text-purple-600 dark:text-purple-300"
                                  [title]="locus.content">
                              <span class="w-1 h-1 rounded-full bg-purple-500 animate-pulse"></span>
                              {{ locus.locus }}
                            </span>
                          }
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>

              <!-- Master Control Box -->
              <div class="flex flex-col justify-center items-center p-5 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-zinc-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                <div class="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Warehouse Synced</div>
                <div class="text-[9px] font-mono text-zinc-400 mt-0.5">BigQuery Connected</div>
              </div>

            </div>
          </div>
        </div>

        <!-- Sidebar / Filtered List Panel -->
        <div class="space-y-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm h-full flex flex-col min-h-[380px]">
            <div class="mb-4">
              <h3 class="text-xs font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-widest">
                {{ selectedRoom() ? selectedRoom() + ' Memories' : 'Anchored Memories' }}
              </h3>
              <p class="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5 font-semibold">
                {{ filteredLoci().length }} Total Loci found
              </p>
            </div>

            <div class="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[400px]">
              @if (lociPalace.loading() && filteredLoci().length === 0) {
                <div class="py-12 flex flex-col justify-center items-center opacity-50">
                  <div class="w-6 h-6 border-2 border-zinc-200 border-t-purple-600 rounded-full animate-spin mb-3"></div>
                  <span class="text-[10px] font-bold uppercase tracking-widest">Loading Warehouse...</span>
                </div>
              } @else if (filteredLoci().length === 0) {
                <div class="py-12 text-center border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-xl">
                  <p class="text-xs font-bold text-zinc-400 uppercase tracking-wider">No memories anchored</p>
                  <p class="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">Place a new locus to begin</p>
                </div>
              } @else {
                @for (entry of filteredLoci(); track entry.id) {
                  <div class="group relative p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-850 hover:shadow-sm transition-all animate-fade-in">
                    
                    <!-- Delete button -->
                    <button (click)="deleteEntry(entry)" 
                            class="absolute top-3 right-3 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                            title="Delete memory">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>

                    <div class="flex flex-wrap items-center gap-1.5 mb-2">
                      <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {{ entry.room }}
                      </span>
                      <span class="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                        → {{ entry.locus }}
                      </span>
                    </div>

                    <p class="text-xs text-gray-800 dark:text-zinc-200 leading-relaxed font-medium mb-3">
                      {{ entry.content }}
                    </p>

                    <div class="flex justify-between items-center text-[8px] font-mono text-zinc-400 uppercase tracking-widest border-t border-gray-100 dark:border-zinc-800/50 pt-2">
                      <span>{{ entry.memory_type }}</span>
                      <span>{{ entry.created_at | date:'yyyy.MM.dd HH:mm' }}</span>
                    </div>
                  </div>
                }
              }
            </div>
          </div>
        </div>

      </div>

      <!-- Add Locus Modal Overlay -->
      @if (isAddModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" (click)="closeAddModal()">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up" (click)="$event.stopPropagation()">
            
            <div class="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-950 text-white flex justify-between items-center">
              <h3 class="text-xs font-black uppercase tracking-widest">Place Spatial Locus</h3>
              <button (click)="closeAddModal()" class="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form (ngSubmit)="submitLocus()" class="p-6 space-y-4">
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">PALACE CHAMBER *</label>
                  <select [(ngModel)]="newRoom" name="newRoom" required
                          class="w-full text-xs font-bold rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-500">
                    <option value="Foyer">Foyer</option>
                    <option value="Library">Library</option>
                    <option value="Office">Office</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Sanctuary">Sanctuary</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">SPECIFIC LOCUS SPOT *</label>
                  <input [(ngModel)]="newLocus" name="newLocus" required type="text" placeholder="e.g. Grandfather Clock"
                         class="w-full text-xs font-bold rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-500">
                </div>
              </div>

              <div>
                <label class="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">MEMORY TYPE *</label>
                <select [(ngModel)]="newType" name="newType" required
                        class="w-full text-xs font-bold rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-500">
                  <option value="Clinical Note">Clinical Note</option>
                  <option value="Recommendation">Recommendation</option>
                  <option value="Lab Finding">Lab Finding</option>
                  <option value="Intervention">Intervention</option>
                </select>
              </div>

              <div>
                <label class="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5">MEMORY CONTENT *</label>
                <textarea [(ngModel)]="newContent" name="newContent" required rows="4" placeholder="Enter findings or insights to anchor to this locus..."
                          class="w-full text-xs font-medium rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-purple-500"></textarea>
              </div>

              <div class="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800/80">
                <button type="button" (click)="closeAddModal()"
                        class="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit"
                        class="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-900/20 rounded-xl transition-colors border border-purple-500/20">
                  Place Memory
                </button>
              </div>

            </form>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    .animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class MemoryPalaceComponent implements OnInit {
  lociPalace = inject(LociPalaceService);
  state = inject(PatientStateService);

  selectedRoom = signal<string | null>(null);
  isAddModalOpen = signal<boolean>(false);

  // Form fields
  newRoom = 'Foyer';
  newLocus = '';
  newType = 'Clinical Note';
  newContent = '';

  ngOnInit() {
    this.lociPalace.fetchLoci('current_patient');
  }

  getRoomCount(room: string): number {
    return this.lociPalace.loci().filter(item => item.room === room).length;
  }

  getLociForRoom(room: string): ILocusEntry[] {
    return this.lociPalace.loci().filter(item => item.room === room);
  }

  filteredLoci = computed(() => {
    const room = this.selectedRoom();
    const list = this.lociPalace.loci();
    if (!room) return list;
    return list.filter(item => item.room === room);
  });

  openAddModal() {
    this.newRoom = this.selectedRoom() || 'Foyer';
    this.newLocus = '';
    this.newType = 'Clinical Note';
    this.newContent = '';
    this.isAddModalOpen.set(true);
  }

  closeAddModal() {
    this.isAddModalOpen.set(false);
  }

  async submitLocus() {
    if (!this.newRoom || !this.newLocus || !this.newContent) return;

    await this.lociPalace.saveLocus({
      patient_id: 'current_patient',
      room: this.newRoom,
      locus: this.newLocus,
      memory_type: this.newType,
      content: this.newContent
    });

    this.closeAddModal();
  }

  async deleteEntry(entry: ILocusEntry) {
    if (confirm(`Are you sure you want to delete the locus anchored at ${entry.room} → ${entry.locus}?`)) {
      await this.lociPalace.deleteLocus(entry.id, 'current_patient');
    }
  }
}
