import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PythonBridgeService {
  startBiosignalStream(sessionId: string): void {
    console.log('[Mock PythonBridgeService] Starting biosignal stream for session:', sessionId);
  }

  stopBiosignalStream(): void {
    console.log('[Mock PythonBridgeService] Stopping biosignal stream');
  }
}
