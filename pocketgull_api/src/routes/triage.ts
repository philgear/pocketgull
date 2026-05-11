import { Router } from 'express';

export const triageRouter = Router();

interface Vitals {
  hr: string;
  bp: string;
  spO2: string;
  temp: string;
}

interface TriageResult {
  triageScore: number;
  kaizenColor: 'red' | 'yellow' | 'green' | 'blue';
  activeTimerSeconds: number | null;
  reasoning: string[];
  recommendedGuidelines?: { id: string; title: string; }[];
}

function parseNumeric(val: string): number | null {
  const match = val.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function calculateTriage(vitals: Vitals, conditions?: string[]): Promise<TriageResult> {
  return new Promise(async (resolve) => {
    let score = 0;
  let color: 'red' | 'yellow' | 'green' | 'blue' = 'green';
  let timer: number | null = null;
  const reasoning: string[] = [];

  const hr = parseNumeric(vitals.hr);
  const spO2 = parseNumeric(vitals.spO2);
  const bpString = vitals.bp || '';
  const systolicMatch = bpString.match(/^(\d+)/);
  const systolic = systolicMatch ? parseInt(systolicMatch[1], 10) : null;

  // Decision Rails (Deterministic Rules Engine)
  if (hr !== null) {
    if (hr > 130 || hr < 40) {
      score += 5;
      color = 'red';
      reasoning.push(`Critical Heart Rate: ${hr} bpm`);
    } else if (hr > 110 || hr < 50) {
      score += 2;
      color = (color as string) === 'red' ? 'red' : 'yellow';
      reasoning.push(`Abnormal Heart Rate: ${hr} bpm`);
    }
  }

  if (spO2 !== null) {
    if (spO2 <= 91) {
      score += 5;
      color = 'red';
      reasoning.push(`Critical Hypoxia: ${spO2}%`);
    } else if (spO2 <= 94) {
      score += 2;
      color = (color as string) === 'red' ? 'red' : 'yellow';
      reasoning.push(`Mild Hypoxia: ${spO2}%`);
    }
  }

  if (systolic !== null) {
    if (systolic > 200 || systolic < 90) {
      score += 5;
      color = 'red';
      reasoning.push(`Critical Blood Pressure: ${systolic} mmHg systolic`);
    } else if (systolic > 160 || systolic < 100) {
      score += 2;
      color = (color as string) === 'red' ? 'red' : 'yellow';
      reasoning.push(`Abnormal Blood Pressure: ${systolic} mmHg systolic`);
    }
  }

  // Timer Assignment Logic
  if (color === 'red') {
    // Golden Hour Protocol (3600 seconds)
    timer = 3600;
  }

  if (score === 0) {
    reasoning.push('Vitals are within normal limits.');
  }

  let recommendedGuidelines: { id: string; title: string; }[] | undefined = undefined;

  // Auto-inject PubMed Guidelines for Critical Patients
  if (color === 'red' && conditions && conditions.length > 0) {
    try {
      const query = encodeURIComponent(`${conditions.join('+')}+emergency+protocol`);
      const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=3`;
      const searchRes = await fetch(eSearchUrl);
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult?.idlist || [];
      
      if (ids.length > 0) {
        const eSummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
        const summaryRes = await fetch(eSummaryUrl);
        const summaryData = await summaryRes.json();
        
        recommendedGuidelines = ids.map((id: string) => ({
          id,
          title: summaryData.result?.[id]?.title || 'Clinical Guideline'
        }));
      }
    } catch (err) {
      console.error('[Triage Engine] Failed to fetch PubMed guidelines:', err);
    }
  }

  resolve({
    triageScore: score,
    kaizenColor: color,
    activeTimerSeconds: timer,
    reasoning,
    recommendedGuidelines
  });
  });
}

triageRouter.post('/calculate', async (req, res) => {
  try {
    const { vitals, preexistingConditions } = req.body;
    
    if (!vitals) {
      return res.status(400).json({ error: 'Vitals payload is required' });
    }

    const result = await calculateTriage(vitals, preexistingConditions);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Triage Engine] Error calculating score:', error);
    return res.status(500).json({ error: 'Failed to calculate triage score' });
  }
});
