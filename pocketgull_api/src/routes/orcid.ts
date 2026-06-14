import { Router } from 'express';

export const orcidRouter = Router();

orcidRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params['id'];
    if (!id) {
      res.status(400).json({ error: 'ORCID iD is required' });
      return;
    }
    
    // Clean and validate format
    const cleanId = id.trim().replace(/https?:\/\/orcid\.org\//, '');
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(cleanId)) {
      res.status(400).json({ error: 'Invalid ORCID iD format. Expected: 0000-0002-1825-0097' });
      return;
    }

    // Mock Developer Fallback Profile for Phil Gear
    if (cleanId === '0009-0008-1372-5381') {
      console.log('[ORCID Proxy] Serving standalone mock profile for developer: Phil Gear');
      res.json({
        person: {
          name: {
            'given-names': { value: 'Phil' },
            'family-name': { value: 'Gear' }
          },
          keywords: {
            keyword: [
              { content: 'Software' },
              { content: 'Clinical Intelligence' },
              { content: 'Care Consultation' }
            ]
          },
          'researcher-urls': {
            'researcher-url': [
              {
                'url-name': 'InsightSpark',
                url: { value: 'https://github.com/philgear/InsightSpark' }
              }
            ]
          }
        },
        'activities-summary': {
          works: {
            group: [
              {
                'work-summary': [
                  {
                    title: {
                      title: { value: 'Pivot & Pulse' }
                    },
                    url: { value: 'https://github.com/philgear/InsightSpark' },
                    type: 'software',
                    'publication-date': {
                      year: { value: '2026' }
                    }
                  }
                ]
              },
              {
                'work-summary': [
                  {
                    title: {
                      title: { value: 'PocketGull Care Consultation Protocol' }
                    },
                    type: 'research-tool',
                    'publication-date': {
                      year: { value: '2026' }
                    }
                  }
                ]
              }
            ]
          }
        }
      });
      return;
    }

    const orcidUrl = `https://pub.orcid.org/v3.0/${cleanId}/record`;
    const response = await fetch(orcidUrl, {
      headers: {
        'Accept': 'application/vnd.orcid+json, application/json'
      }
    });

    if (!response.ok) {
      console.error(`ORCID API returned status ${response.status}`);
      if (response.status === 404) {
        res.status(404).json({ error: 'ORCID profile not found. Please verify the ID.' });
        return;
      }
      res.status(response.status).json({ error: `ORCID API returned error: ${response.statusText || 'Unknown Error'}` });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('ORCID Proxy Error:', err);
    res.status(500).json({ error: 'Failed to fetch profile from ORCID.' });
  }
});
