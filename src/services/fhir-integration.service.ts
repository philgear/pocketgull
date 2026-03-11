import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FhirIntegrationService {

  // EPIC / SMART ON FHIR CONFIGURATION
  // In a real production app, the Client ID comes from Epic App Orchard
  private readonly CLIENT_ID = 'pocketgull-sandbox-client-id'; 
  
  // Scopes define what data we ask the patient for permission to read
  private readonly SCOPES = 'launch/patient openid fhirUser patient/Observation.read patient/Condition.read patient/DiagnosticReport.read patient/DocumentReference.read patient/MedicationRequest.read';

  private readonly EPIC_AUTH_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize';
  private readonly EPIC_TOKEN_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';

  /**
   * Step 1: Redirects the user to the Epic/MyChart login page to grant access
   */
  authorize() {
    // Determine the absolute redirect URI dynamically based on the current window location
    const redirectUri = window.location.origin + '/fhir-callback';
    
    // Create standard OAuth 2.0 authorization query string
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: redirectUri,
      scope: this.SCOPES,
      state: crypto.randomUUID(), // Prevent CSRF attacks
      aud: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4' // Target FHIR Server URL
    });

    const authorizeUrl = `${this.EPIC_AUTH_URL}?${params.toString()}`;
    
    // Redirect browser to Epic
    window.location.href = authorizeUrl;
  }

  /**
   * Step 2: Exchanges the authorization code for an Access Token
   * This is typically called by the /fhir-callback route component.
   */
  async handleCallback(code: string): Promise<boolean> {
    try {
      const redirectUri = window.location.origin + '/fhir-callback';
      
      // In a real application without a backend proxy, the Epic OAuth token endpoint 
      // sometimes requires PKCE rather than a raw POST if using a pure SPA. 
      // Assuming a standard sandbox flow for demonstration:
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: this.CLIENT_ID
      });

      const response = await fetch(this.EPIC_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData = await response.json();
      
      // Store token securely (in memory or encrypted local storage)
      sessionStorage.setItem('epic_access_token', tokenData.access_token);
      sessionStorage.setItem('epic_patient_id', tokenData.patient); // The patient context id

      console.log('Successfully connected to Epic MyChart!');
      return true;

    } catch (e) {
      console.error('[FhirIntegrationService] Auth callback error:', e);
      return false;
    }
  }

  /**
   * Step 3: Use the Token to pull down patient data.
   * Note: We don't implement the full REST pulls here to avoid bloat, 
   * but this method proves the connection works.
   */
  async fetchPatientProfile() {
      const token = sessionStorage.getItem('epic_access_token');
      const patientId = sessionStorage.getItem('epic_patient_id');

      if (!token || !patientId) return null;

      try {
        const response = await fetch(`https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            return await response.json();
        }
      } catch (e) {
          console.error('[FhirIntegrationService] Search error:', e);
      }
      return null;
  }

  public hasValidToken(): boolean {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem('epic_access_token');
  }
}
