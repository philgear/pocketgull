import { Router } from 'express';

export const pubmedRouter = Router();

pubmedRouter.get('/search', async (req, res) => {
  try {
    const term = req.query['term'] as string;
    if (!term) {
      res.status(400).json({ error: 'Term is required' });
      return;
    }
    const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=15`;
    const response = await fetch(eSearchUrl);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('PubMed Search Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

pubmedRouter.get('/summary', async (req, res) => {
  try {
    const id = req.query['id'] as string;
    if (!id) {
      res.status(400).json({ error: 'ID is required' });
      return;
    }
    const eSummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`;
    const response = await fetch(eSummaryUrl);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.error('PubMed Summary Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});
