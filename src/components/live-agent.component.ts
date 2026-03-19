import { Component } from '@angular/core';

@Component({
  selector: 'app-live-agent',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg shadow-sm transition-all hover:shadow-md">
      <div class="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 rounded-t-lg">
        <h2 class="text-sm font-semibold text-gray-800 dark:text-zinc-200 uppercase tracking-widest">Live AI Agent</h2>
        <span class="px-2 py-0.5 text-[10px] font-semibold text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 rounded-full border border-green-200 dark:border-green-800">Online</span>
      </div>
      <div class="flex-1 p-4 overflow-y-auto w-full">
        <!-- Chat messages will go here -->
      </div>
      <div class="p-4 bg-gray-50/50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 rounded-b-lg">
        <input
          type="text"
          placeholder="Type your message..."
          class="w-full px-4 py-2 text-sm text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 dark:focus:ring-green-600/50 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500"
        />
      </div>
    </div>
  `,
})
export class LiveAgentComponent {}
