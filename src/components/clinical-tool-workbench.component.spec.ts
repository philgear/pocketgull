import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalToolWorkbenchComponent } from './clinical-tool-workbench.component';
import { DoubleFlipStateMachineService } from '../services/double-flip-state-machine.service';
import { BioHapticFeedbackService } from '../services/bio-haptic-feedback.service';

describe('ClinicalToolWorkbenchComponent Signal & Double-Flip Behavioral Suite', () => {
  let component: ClinicalToolWorkbenchComponent;
  let stateMachine: DoubleFlipStateMachineService;

  beforeEach(() => {
    stateMachine = new DoubleFlipStateMachineService();
    const injector = Injector.create({
      providers: [
        { provide: DoubleFlipStateMachineService, useValue: stateMachine },
        { provide: BioHapticFeedbackService, useClass: BioHapticFeedbackService }
      ]
    });

    component = runInInjectionContext(injector, () => new ClinicalToolWorkbenchComponent());
  });

  it('should initialize all 8 workbench tools as operational', () => {
    expect(component).toBeTruthy();
    expect(component.tools().length).toBe(8);
    expect(component.operationalCount()).toBe(8);
  });

  it('should flip card on double-click safety interlock confirmation', () => {
    const toolId = 'tool_double_flip';
    const initialFlipped = component.tools().find(t => t.id === toolId)?.isFlipped;
    expect(initialFlipped).toBe(false);

    // Click 1 -> PENDING_SECOND_CLICK
    component.onCardDblClick(toolId);
    expect(component.tools().find(t => t.id === toolId)?.isFlipped).toBe(false);

    // Click 2 within 300ms window -> CONFIRMED_ACTION -> Flipped!
    component.onCardDblClick(toolId);
    expect(component.tools().find(t => t.id === toolId)?.isFlipped).toBe(true);
  });

  it('should run self-diagnostic suite on all tools', async () => {
    component.runAllDiagnostics();
    expect(component.tools().every(t => t.status === 'TESTING')).toBe(true);

    await new Promise<void>((resolve) => setTimeout(resolve, 700));
    expect(component.tools().every(t => t.status === 'PASS')).toBe(true);
  });
});
