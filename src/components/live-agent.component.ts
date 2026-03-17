import { Component } from '@angular/core';

@Component({
  selector: 'app-live-agent',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col h-full bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <div class="flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-700 rounded-t-lg">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Live AI Agent</h2>
        <span class="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">Online</span>
      </div>
      <div class="flex-1 p-4 overflow-y-auto">
        <!-- Chat messages will go here -->
      </div>
      <div class="p-4 bg-gray-200 dark:bg-gray-700 rounded-b-lg">
        <input
          type="text"
          placeholder="Type your message..."
          class="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  `,
})
export class LiveAgentComponent {}
