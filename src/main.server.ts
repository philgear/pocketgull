import { provideHttpClient, withFetch } from '@angular/common/http';
import { BootstrapContext, bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideServerRendering } from '@angular/platform-server';
import { provideZonelessChangeDetection, ApplicationConfig } from '@angular/core';
import { AI_CONFIG, AiProviderConfig } from './services/ai-provider.types';
import { IntelligenceProviderToken } from './services/ai/intelligence.provider.token';
import { PubGemmaProvider } from './services/ai/pubgemma.provider';
import { NanoProvider } from './services/ai/nano.provider';
import { HybridProvider } from './services/ai/hybrid.provider';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        provideZonelessChangeDetection(),
        provideHttpClient(withFetch()),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
        {
            provide: AI_CONFIG,
            useFactory: () => ({
                apiKey: process.env['GEMINI_API_KEY'] || '',
                defaultModel: { modelId: 'gemini-2.5-flash', temperature: 0.1 },
                verificationModel: { modelId: 'gemini-2.5-flash', temperature: 0.0 }
            } as AiProviderConfig)
        },
        {
            provide: IntelligenceProviderToken,
            useClass: HybridProvider
        },
        provideClientHydration(withEventReplay())
    ]
};

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(AppComponent, serverConfig, context);

export default bootstrap;
