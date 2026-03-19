import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { RevealDirective } from '../directives/reveal.directive';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';

@Component({
  selector: 'app-task-flow',
  standalone: true,
  imports: [CommonModule, RevealDirective, SafeHtmlPipe],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full w-full flex flex-col overflow-hidden relative bg-white dark:bg-[#09090b] rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-md">
      <!-- Bracket Header -->
      <div class="bg-gray-50/50 dark:bg-zinc-900/50 px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-start shrink-0">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-[#416B1F] dark:text-[#689f38] block mb-1">
            Active Task
          </span>
          <h2 class="text-xl font-medium text-[#1C1C1C] dark:text-zinc-100">Tasks, Notes & Shopping</h2>
        </div>
        <div class="flex flex-col items-end gap-1 sm:gap-2">
            <div class="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-[#689f38]/10 rounded-full border border-green-100 dark:border-[#689f38]/30">
              <div class="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-[#689f38] animate-pulse"></div>
              <span class="text-[10px] sm:text-xs font-medium text-green-700 dark:text-[#689f38] uppercase tracking-wide">Live</span>
            </div>
            <div class="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest text-right">
               {{ checklist().length }} Tasks • {{ clinicalNotes().length }} Notes • {{ shoppingList().length }} Items
            </div>
        </div>
      </div>

      <!-- Content / List -->
      <div class="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] dark:bg-zinc-950">
        @if (clinicalNotes().length === 0 && checklist().length === 0 && shoppingList().length === 0) {
          <div class="h-full flex flex-col items-center justify-center opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-4 text-gray-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <p class="text-xs font-bold uppercase tracking-widest text-[#1C1C1C] dark:text-zinc-100 text-center max-w-xs leading-relaxed">
              No tasks, notes, or list items yet. <br/> Add items using the input below or from the Assessment Panel.
            </p>
          </div>
        } @else {
          <div class="relative pl-2 mt-4 ml-2">
            <!-- Vertical Timeline Line -->
            <div class="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200 dark:bg-zinc-800"></div>

            <div class="flex flex-col">
              <!-- Checklist Section -->
              @if (enhancedChecklist().length > 0) {
                <div class="mb-2">
                  <div class="flex items-center justify-between pl-8 mb-4">
                    <h3 class="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Tasks</h3>
                    <select name="taskSortOrderCtrl" id="taskSortOrderCtrl" [value]="taskSortOrder()" (change)="taskSortOrder.set($any($event.target).value)" class="text-[10px] uppercase font-bold text-gray-500 bg-transparent border-none cursor-pointer hover:text-[#1C1C1C] dark:hover:text-zinc-300 focus:ring-0">
                      <option value="default">Sort: Default</option>
                      <option value="pain">Sort: Severity (Pain)</option>
                      <option value="status">Sort: Open</option>
                    </select>
                  </div>
                  <div class="flex flex-col">
                    @for (task of enhancedChecklist(); track task.id; let i = $index) {
                      <div appReveal [revealDelay]="i * 75" class="relative pl-8 pb-4 group">
                        <!-- Node on the timeline -->
                        <div [class]="'absolute left-[7px] top-3 w-2.5 h-2.5 rounded-sm border-2 z-10 shadow-sm transition-colors ' + task.colorClass" [class.opacity-50]="task.completed"></div>
                        
                        <!-- Data Card -->
                        <div class="flex items-start gap-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg p-3 shadow-sm transition-all duration-200 hover:shadow-md group-hover:border-gray-300 dark:group-hover:border-zinc-600">
                          <input 
                            type="checkbox" 
                            [id]="'task-' + task.id"
                            [name]="'task-' + task.id"
                            [checked]="task.completed"
                            (change)="toggleTask(task.id)"
                            class="mt-1 w-4 h-4 text-[#1C1C1C] dark:text-zinc-100 bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded focus:ring-[#1C1C1C] dark:focus:ring-zinc-600 flex-shrink-0 cursor-pointer"
                          >
                          <label [for]="'task-' + task.id" class="text-sm text-[#1C1C1C] dark:text-zinc-100 flex-1 cursor-pointer" [class.line-through]="task.completed" [class.opacity-50]="task.completed" [innerHTML]="task.formattedText | safeHtml">
                          </label>
                          <button (click)="removeTask(task.id)" class="text-gray-300 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Remove Task">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Shopping List Section -->
              @if (shoppingList().length > 0) {
                <div class="mb-2">
                  <h3 class="flex items-center gap-1.5 text-[10px] font-bold text-[#E3663B] dark:text-[#ff8a65] uppercase tracking-widest mb-4 pl-8">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    Shopping List
                  </h3>
                  <div class="flex flex-col">
                    @for (item of shoppingList(); track item.id; let i = $index) {
                      <div appReveal [revealDelay]="i * 75" class="relative pl-8 pb-4 group">
                        <!-- Node on the timeline -->
                        <div class="absolute left-[7px] top-3 w-2.5 h-2.5 rounded-sm border-2 bg-white dark:bg-zinc-950 z-10 border-[#E3663B] dark:border-[#ff8a65] shadow-sm" [class.opacity-50]="item.completed"></div>
                        
                        <!-- Data Card -->
                        <div class="flex items-start gap-3 bg-orange-50/30 dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-800/30 rounded-lg p-3 shadow-sm transition-all duration-200 hover:shadow-md group-hover:border-orange-300 dark:group-hover:border-orange-600">
                          <input 
                            type="checkbox" 
                            [id]="'shop-' + item.id"
                            [name]="'shop-' + item.id"
                            [checked]="item.completed"
                            (change)="toggleShoppingItem(item.id)"
                            class="mt-1 w-4 h-4 text-[#E3663B] bg-white border-gray-300 rounded focus:ring-[#E3663B] flex-shrink-0 cursor-pointer"
                          >
                          <label [for]="'shop-' + item.id" class="text-sm text-[#1C1C1C] dark:text-zinc-100 flex-1 cursor-pointer" [class.line-through]="item.completed" [class.opacity-50]="item.completed">
                            {{ item.name }}
                          </label>
                          <button (click)="removeShoppingItem(item.id)" class="text-gray-300 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" title="Remove Item">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Clinical Notes Section -->
              @if (clinicalNotes().length > 0) {
                <div class="mb-2">
                  <h3 class="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4 pl-8">Notes</h3>
                  <div class="flex flex-col">
                    @for (note of enhancedClinicalNotes(); track note.id; let i = $index) {
                      <div appReveal [revealDelay]="i * 75" class="relative pl-8 pb-6 group">
                        <!-- Node on the timeline -->
                        <div [class]="'absolute left-[7px] top-3.5 w-2.5 h-2.5 rounded-sm border-2 z-10 shadow-sm transition-colors ' + note.colorClass"></div>
                        
                        <!-- Data Card -->
                        <div class="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md group-hover:border-gray-300 dark:group-hover:border-zinc-600 relative">
                          <div class="flex justify-between items-start mb-3">
                            <span class="text-[10px] font-bold uppercase tracking-widest text-[#416B1F] dark:text-[#689f38] bg-[#F1F8E9] dark:bg-[#689f38]/10 px-2 py-1 rounded inline-block">
                              {{ note.sourceLens }}
                            </span>
                            <button (click)="removeNote(note.id)" class="text-gray-300 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Note">
                               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                          </div>
                          <p class="text-sm text-gray-700 dark:text-zinc-300 font-medium leading-relaxed mb-3 whitespace-pre-wrap" [innerHTML]="note.formattedText | safeHtml"></p>
                          <div class="flex justify-between items-center text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest pt-2.5 border-t border-gray-50 dark:border-zinc-800/50 mt-1">
                            <span>{{ note.date | date:'MMM d, y, h:mm a' }}</span>
                            <span class="text-gray-400 flex items-center gap-1">
                               <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-emerald-400 disabled" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                               LOGGED
                            </span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Add Item Input -->
      <div class="p-4 bg-white dark:bg-[#09090b] border-t border-gray-100 dark:border-zinc-800 shrink-0 flex flex-col gap-3">
        <label for="taskInputText" class="sr-only">New task or note</label>
        <textarea 
            id="taskInputText"
            name="taskInputText"
            #itemInput
            (keydown.enter)="handleEnter($event, itemInput)"
            (input)="autoResize(itemInput)"
            placeholder="Type a clinical note, task, or shopping item... (Shift+Enter for new line)" 
            rows="1"
            class="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#416B1F]/30 focus:border-[#416B1F] transition-all placeholder-gray-400 dark:placeholder-zinc-600 resize-none max-h-32"
        ></textarea>
        <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button (click)="submitNote(itemInput)" class="w-full sm:w-auto justify-center px-4 py-2 sm:py-1.5 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 hover:bg-gray-200 rounded transition-colors uppercase tracking-widest flex items-center gap-1.5">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 sm:w-3 border-gray-200 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
               Add Note
            </button>
            <button (click)="submitShoppingItem(itemInput)" class="w-full sm:w-auto justify-center px-4 py-2 sm:py-1.5 text-xs font-bold text-white bg-[#E3663B] hover:bg-[#c95a34] rounded transition-colors uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
               Add Item
            </button>
            <button (click)="submitTask(itemInput)" class="w-full sm:w-auto justify-center px-4 py-2 sm:py-1.5 text-xs font-bold text-white bg-[#1C1C1C] hover:bg-[#416B1F] rounded transition-colors uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
               Add Task
            </button>
        </div>
      </div>
    </div>
  `
})
export class TaskFlowComponent {
  state = inject(PatientStateService);

  clinicalNotes = computed(() => this.state.clinicalNotes() || []);
  checklist = computed(() => this.state.checklist() || []);
  shoppingList = computed(() => this.state.shoppingList() || []);

  taskSortOrder = signal<'default' | 'pain' | 'status'>('default');

  enhancedChecklist = computed(() => {
    let tasks = this.checklist();
    let enhanced = tasks.map(task => {
      let painScore: number | null = null;
      const painMatch = task.text.match(/\[(?:Pain|Severity):?\s*(\d+)\]?/i) || task.text.match(/\[(\d+)\/10\]/i);
      if (painMatch) {
        painScore = parseInt(painMatch[1], 10);
      }

      let colorClass = 'border-[#1C1C1C] dark:border-zinc-300 bg-white dark:bg-zinc-950'; // default node
      if (painScore !== null) {
        if (painScore >= 7) colorClass = 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20';
        else if (painScore >= 4) colorClass = 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/20';
        else if (painScore > 0) colorClass = 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/20';
      } else {
        if (task.text.includes('[Orthopedics]')) colorClass = 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20';
        else if (task.text.includes('[Cardiology]')) colorClass = 'border-rose-500 dark:border-rose-400 bg-rose-50 dark:bg-rose-950/20';
        else if (task.text.includes('[Neurology]')) colorClass = 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20';
      }

      let formattedText = task.text.replace(/\[(.*?)\]/g, (match, inner) => {
        let badgeStyle = 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700';
        if (colorClass.includes('red')) badgeStyle = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
        else if (colorClass.includes('amber')) badgeStyle = 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
        else if (colorClass.includes('green')) badgeStyle = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
        else if (colorClass.includes('blue')) badgeStyle = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
        else if (colorClass.includes('rose')) badgeStyle = 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
        else if (colorClass.includes('indigo')) badgeStyle = 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
        return `<span class="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${badgeStyle} mx-1">${inner}</span>`;
      });

      return { ...task, painScore, colorClass, formattedText };
    });

    if (this.taskSortOrder() === 'pain') {
      enhanced.sort((a, b) => (b.painScore || 0) - (a.painScore || 0));
    } else if (this.taskSortOrder() === 'status') {
      enhanced.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    }
    return enhanced;
  });

  enhancedClinicalNotes = computed(() => {
    let notes = this.clinicalNotes();
    return notes.map(note => {
      let colorClass = 'border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'; // default class

      const lowerText = note.text.toLowerCase();
      if (lowerText.includes('[plan of care]') || lowerText.includes('[treatment]')) {
        colorClass = 'border-[#416B1F] dark:border-[#689f38] bg-[#F1F8E9] dark:bg-[#689f38]/20';
      } else if (lowerText.includes('[alert]') || lowerText.includes('[critical]')) {
        colorClass = 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/20';
      } else if (lowerText.includes('[assessment]') || lowerText.includes('[assessmen]')) {
        colorClass = 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20';
      } else if (lowerText.includes('[observation]')) {
        colorClass = 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/20';
      }

      let formattedText = note.text.replace(/\[(.*?)\]/g, (match, inner) => {
        let badgeStyle = 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700';
        const lInner = inner.toLowerCase();
        // Content-aware badge coloring
        if (lInner.includes('plan of care') || lInner.includes('treatment')) {
          badgeStyle = 'bg-[#F1F8E9] dark:bg-[#689f38]/30 text-[#416B1F] dark:text-[#689f38] border border-[#416B1F]/30 dark:border-[#689f38]/50';
        } else if (lInner.includes('alert') || lInner.includes('critical')) {
          badgeStyle = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
        } else if (lInner.includes('assessment') || lInner.includes('assessmen')) {
          badgeStyle = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
        } else {
          // Inherit node vibe
          if (colorClass.includes('red')) badgeStyle = 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
          else if (colorClass.includes('amber')) badgeStyle = 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
          else if (colorClass.includes('blue')) badgeStyle = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
          else if (colorClass.includes('416B1F')) badgeStyle = 'bg-[#F1F8E9] dark:bg-[#689f38]/30 text-[#416B1F] dark:text-[#689f38] border border-[#416B1F]/30 dark:border-[#689f38]/50';
        }

        return `<span class="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${badgeStyle} mx-1 mb-1 inline-block">${inner}</span>`;
      });

      return { ...note, colorClass, formattedText };
    });
  });

  removeNote(id: string) {
    this.state.removeClinicalNote(id);
  }

  handleEnter(event: KeyboardEvent, el: HTMLTextAreaElement) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default newline
      // Default to adding a task if they just press Enter
      this.submitTask(el);
    }
  }

  submitNote(el: HTMLTextAreaElement) {
    const text = el.value;
    if (!text.trim()) return;
    this.state.addClinicalNote({
      id: `note_${Date.now()}`,
      text: text.trim(),
      date: new Date().toISOString(),
      sourceLens: 'Manual Entry'
    });
    this.resetInput(el);
  }

  submitTask(el: HTMLTextAreaElement) {
    const text = el.value;
    if (!text.trim()) return;
    this.state.addChecklistItem({
      id: `task_${Date.now()}`,
      text: text.trim(),
      completed: false
    });
    this.resetInput(el);
  }

  private resetInput(el: HTMLTextAreaElement) {
    el.value = '';
    el.style.height = 'auto'; // Reset auto-expanding height
  }

  toggleTask(id: string) {
    this.state.toggleChecklistItem(id);
  }

  removeTask(id: string) {
    this.state.removeChecklistItem(id);
  }

  submitShoppingItem(el: HTMLTextAreaElement) {
    const text = el.value;
    if (!text.trim()) return;
    this.state.addShoppingListItem({
      id: `shop_${Date.now()}`,
      name: text.trim(),
      completed: false
    });
    this.resetInput(el);
  }

  toggleShoppingItem(id: string) {
    this.state.toggleShoppingListItem(id);
  }

  removeShoppingItem(id: string) {
    this.state.removeShoppingListItem(id);
  }

  autoResize(el: HTMLTextAreaElement) {
    // Schedule resize for next frame to avoid synchronous layout thrashing
    requestAnimationFrame(() => {
      const currentHeight = el.style.height;
      el.style.height = 'auto';
      const scrollHeight = el.scrollHeight;
      el.style.height = currentHeight;
      requestAnimationFrame(() => {
        el.style.height = (scrollHeight < 128 ? scrollHeight : 128) + 'px';
      });
    });
  }
}
