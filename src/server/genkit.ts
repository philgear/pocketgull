import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

// 1. Generate Metrics Flow
export const generateMetricsFlow = ai.defineFlow(
  {
    name: 'generateMetricsFlow',
    inputSchema: z.string().describe('Clinical report text'),
    outputSchema: z.object({
        complexity: z.number().min(0).max(10),
        stability: z.number().min(0).max(10),
        certainty: z.number().min(0).max(10)
    }),
  },
  async (reportText) => {
    const prompt = `Analyze the following clinical report and patient data. 
    Extract three key metrics on a scale of 0 to 10:
    1. Clinical Complexity (0 = Simple/Routine, 10 = Highly Complex/Multimorbid)
    2. Clinical Stability (0 = Unstable/Acute, 10 = Stable/Compensated)
    3. Global Certainty (0 = Speculative/Needs Data, 10 = Definitive/Clear)

    Report:
    ${reportText.substring(0, 3000)}

    Return ONLY a JSON object with this exact structure:
    {"complexity": number, "stability": number, "certainty": number}`;

    const response = await ai.generate({
      prompt,
      config: {
        temperature: 0,
        responseMimeType: 'application/json'
      }
    });

    const data = JSON.parse(response.text);
    return data;
  }
);

// 2. Detect Clinical Changes Flow
export const detectClinicalChangesFlow = ai.defineFlow(
  {
    name: 'detectClinicalChangesFlow',
    inputSchema: z.object({
      oldData: z.string(),
      newData: z.string()
    }),
    outputSchema: z.boolean(),
  },
  async ({ oldData, newData }) => {
    const prompt = `Compare these two clinical snapshots and determine if the difference is CLINICALLY SIGNIFICANT (e.g., new symptoms, medication changes, vital sign shifts, or new diagnoses). 
    If the changes are only cosmetic (typos, formatting, minor phrasing), respond with "FALSE". 
    If the changes are clinically meaningful, respond with "TRUE".
    
    OLD DATA: "${oldData.substring(0, 1000)}"
    NEW DATA: "${newData.substring(0, 1000)}"
    
    SIGNIFICANT? (TRUE/FALSE):`;

    const response = await ai.generate({
      prompt,
      config: { temperature: 0 }
    });

    return response.text.toUpperCase().includes('TRUE');
  }
);

// 3. Translate Reading Level Flow
export const translateReadingLevelFlow = ai.defineFlow(
    {
      name: 'translateReadingLevelFlow',
      inputSchema: z.object({
        text: z.string(),
        level: z.enum(['simplified', 'dyslexia', 'child'])
      }),
      outputSchema: z.string(),
    },
    async ({ text, level }) => {
      let systemInstruction = '';
      if (level === 'simplified') {
          systemInstruction = `You are an expert clinical copywriter. Your task is to rewrite the provided medical text to improve its Flesch Reading Ease score and lower its Flesch-Kincaid Grade level (target: Grade 6-8). 
          
CRITICAL RULES:
1. Preserve ALL clinical facts, diagnoses, medications, and dosages exactly.
2. Use shorter sentences.
3. Replace complex medical jargon with simpler terms where possible, but keep the original term in parentheses if it's important (e.g., "high blood pressure (hypertension)").
4. Use active voice.
5. Use bullet points for lists.
6. Return ONLY the rewritten markdown text, with no introductory or concluding remarks.
7. Begin your output with "### [START CARE PLAN]" and end it with "### [END CARE PLAN]".`;
      } else if (level === 'dyslexia') {
          systemInstruction = `You are an expert in accessible communication. Your task is to rewrite the provided medical text to be Dyslexia-friendly and highly readable.

CRITICAL RULES:
1. Preserve ALL clinical facts, diagnoses, medications, and dosages exactly.
2. Structure the text with frequent line breaks and very short paragraphs (1-2 sentences max).
3. Use plain, everyday language. (Target very high Flesch Reading Ease).
4. Use **bold** text to highlight key points instead of italics or underlining.
5. Provide clear, step-by-step instructions using bullet points or numbered lists.
6. Avoid medical jargon; explain concepts simply.
7. Return ONLY the rewritten markdown text, with no introductory or concluding remarks.
8. Begin your output with "### [START CARE PLAN]" and end it with "### [END CARE PLAN]".`;
      } else if (level === 'child') {
          systemInstruction = `You are an expert pediatric communicator and child life specialist. Your task is to rewrite the provided medical text so it is easily understandable, comforting, and engaging for a child (target age: 8-12 years old).

CRITICAL RULES:
1. Explain medical concepts using simple, everyday analogies (e.g., "white blood cells are like tiny superheroes").
2. Focus on what the child will experience, how they will feel, and what they can do to help.
3. Keep the tone encouraging, warm, and not scary.
4. Preserve the core meaning of diagnoses and treatments, but omit overly complex dosage specifics unless relevant to the child's actions.
5. Use short sentences and simple formatting.
6. Return ONLY the rewritten markdown text, with no introductory or concluding remarks.
7. Begin your output with "### [START CARE PLAN]" and end it with "### [END CARE PLAN]".`;
      }
  
      const prompt = `Please rewrite the following care plan text according to your system instructions:\n\n<clinical_text>\n${text}\n</clinical_text>`;
  
      const response = await ai.generate({
        prompt,
        system: systemInstruction,
        config: {
          temperature: 0.2
        }
      });
  
      return response.text;
    }
);

// 4. Analyze Translation Flow
export const analyzeTranslationFlow = ai.defineFlow(
    {
      name: 'analyzeTranslationFlow',
      inputSchema: z.object({
        original: z.string(),
        translated: z.string()
      }),
      outputSchema: z.string(),
    },
    async ({ original, translated }) => {
      const prompt = `Analyze the following translated/adjusted clinical text against the original text.
Provide a brief critique (2-3 sentences) on:
1. Did it maintain clinical accuracy?
2. Is the tone appropriate for the target audience?
3. Were any important details lost?

ORIGINAL TEXT:
${original}

TRANSLATED TEXT:
${translated}

CRITIQUE:`;

      const response = await ai.generate({
        prompt,
        config: { temperature: 0.2 }
      });
      return response.text;
    }
);
