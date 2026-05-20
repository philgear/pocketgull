import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ILocusEntry {
  id: string;
  patient_id: string;
  room: string;
  locus: string;
  memory_type: string;
  content: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class LociPalaceService {
  private http = inject(HttpClient);

  readonly loci = signal<ILocusEntry[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  async fetchLoci(patientId: string = 'current_patient'): Promise<ILocusEntry[]> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<ILocusEntry[]>(`/api/loci/${patientId}`));
      this.loci.set(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Failed to fetch loci:', err);
      this.error.set(err.message || 'Failed to fetch memory loci');
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async saveLocus(locus: Omit<ILocusEntry, 'id' | 'created_at'> & { id?: string; created_at?: string }): Promise<ILocusEntry | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.http.post<{ success: boolean; entry: ILocusEntry }>(`/api/loci/save`, locus));
      if (res && res.success && res.entry) {
        this.loci.update(current => {
          const filtered = current.filter(item => item.id !== res.entry.id);
          return [res.entry, ...filtered];
        });
        return res.entry;
      }
      return null;
    } catch (err: any) {
      console.error('Failed to save locus:', err);
      this.error.set(err.message || 'Failed to save memory locus');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async deleteLocus(id: string, patientId: string = 'current_patient'): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.http.post<{ success: boolean }>(`/api/loci/delete`, { id, patient_id: patientId }));
      if (res && res.success) {
        this.loci.update(current => current.filter(item => item.id !== id));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to delete locus:', err);
      this.error.set(err.message || 'Failed to delete memory locus');
      return false;
    } finally {
      this.loading.set(false);
    }
  }
}
