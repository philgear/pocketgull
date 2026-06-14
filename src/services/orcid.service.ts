import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface IOrcidWork {
  title: string;
  url?: string;
  type?: string;
  year?: string;
}

export interface IOrcidProfile {
  orcidId: string;
  name: string;
  keywords: string[];
  works: IOrcidWork[];
  urls: { name: string; url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrcidService {
  private http = inject(HttpClient);

  readonly orcidId = signal<string | null>(null);
  readonly orcidProfile = signal<IOrcidProfile | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed helper to check if connected
  readonly isConnected = computed(() => !!this.orcidId());

  constructor() {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('orcid_id');
      if (savedId) {
        this.orcidId.set(savedId);
        this.fetchProfile(savedId);
      }
    }
  }

  /**
   * Connects an ORCID iD and fetches the public record
   */
  async connectOrcid(id: string): Promise<boolean> {
    const cleanId = id.trim().replace(/https?:\/\/orcid\.org\//, '');
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(cleanId)) {
      this.error.set('Invalid ORCID iD format. Expected: 0000-0002-1825-0097');
      return false;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const data = await this.http.get<any>(`/api/orcid/${cleanId}`).toPromise();
      const parsed = this.parseOrcidData(cleanId, data);
      
      this.orcidId.set(cleanId);
      this.orcidProfile.set(parsed);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('orcid_id', cleanId);
      }
      return true;
    } catch (err: any) {
      console.error('Failed to load ORCID profile:', err);
      this.error.set(err.error?.error || 'Failed to fetch profile from ORCID.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Disconnects ORCID connection
   */
  disconnect() {
    this.orcidId.set(null);
    this.orcidProfile.set(null);
    this.error.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orcid_id');
    }
  }

  private async fetchProfile(id: string) {
    try {
      const data = await this.http.get<any>(`/api/orcid/${id}`).toPromise();
      const parsed = this.parseOrcidData(id, data);
      this.orcidProfile.set(parsed);
    } catch (err: any) {
      console.error('Failed to auto-refresh ORCID profile:', err);
      this.error.set('Failed to load saved ORCID profile.');
    }
  }

  /**
   * Parse the ORCID JSON record response into a clean clinical context model
   */
  private parseOrcidData(orcidId: string, raw: any): IOrcidProfile {
    const person = raw?.person;
    const givenNames = person?.name?.['given-names']?.value || '';
    const familyName = person?.name?.['family-name']?.value || '';
    const name = [givenNames, familyName].filter(Boolean).join(' ') || 'Unknown Researcher';

    // Parse Keywords
    const keywordsRaw = person?.keywords?.keyword || [];
    const keywords = keywordsRaw.map((k: any) => k.content).filter(Boolean);

    // Parse URLs
    const urlsRaw = person?.['researcher-urls']?.['researcher-url'] || [];
    const urls = urlsRaw.map((u: any) => ({
      name: u['url-name'] || 'Website',
      url: u.url?.value || ''
    })).filter((u: any) => !!u.url);

    // Parse Works
    const worksRaw = raw?.['activities-summary']?.works?.group || [];
    const works: IOrcidWork[] = [];

    for (const group of worksRaw) {
      const summary = group['work-summary']?.[0];
      if (summary) {
        const title = summary.title?.title?.value || 'Untitled Work';
        const url = summary.url?.value || '';
        const type = summary.type || '';
        const year = summary['publication-date']?.year?.value || '';
        works.push({ title, url, type, year });
      }
    }

    return { orcidId, name, keywords, works, urls };
  }
}
