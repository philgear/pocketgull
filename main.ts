
import { bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './src/app.component';
import { AI_CONFIG, AiProviderConfig } from './src/services/ai-provider.types';
import { IntelligenceProviderToken } from './src/services/ai/intelligence.provider.token';
import { PubGemmaProvider } from './src/services/ai/pubgemma.provider';
import { NanoProvider } from './src/services/ai/nano.provider';
import { HybridProvider } from './src/services/ai/hybrid.provider';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './src/environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    {
      provide: AI_CONFIG,
      useFactory: () => ({
        apiKey: (window as any).GEMINI_API_KEY || '',
        defaultModel: { modelId: 'gemini-2.5-flash', temperature: 0.1 },
        verificationModel: { modelId: 'gemini-2.5-flash', temperature: 0.0 }
      } as AiProviderConfig)
    },
    {
      provide: IntelligenceProviderToken,
      useClass: HybridProvider
    }, provideClientHydration(withEventReplay()), provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
