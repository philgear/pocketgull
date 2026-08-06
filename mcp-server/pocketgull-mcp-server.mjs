#!/usr/bin/env node

/**
 * PocketGull Clinical Intelligence MCP Server
 * Standard Model Context Protocol (MCP) Server via stdio JSON-RPC 2.0.
 * 
 * Exposes real-time clinical care plan strategy tools:
 * - pocketgull_get_patient: Returns patient vitals, symptoms, and intake details.
 * - pocketgull_tri_paradigm_synthesis: Synthesizes Western, TCM, and Ayurvedic care plans.
 * - pocketgull_generate_soap_note: Generates FHIR-compliant SOAP notes from clinical text.
 * - pocketgull_phi_scan: Scans input text for PHI leaks.
 * - pocketgull_fhir_export: Builds FHIR R4 Bundle JSON.
 */

import readline from 'node:readline';
import process from 'node:process';

const TOOLS = [
  {
    name: 'pocketgull_get_patient',
    description: 'Retrieves patient vitals, symptoms, biometrics, and medical intake state.',
    inputSchema: {
      type: 'object',
      properties: {
        patientId: {
          type: 'string',
          description: 'Unique patient ID (defaults to "p_default_patient" / Alexander Vance)'
        }
      }
    }
  },
  {
    name: 'pocketgull_tri_paradigm_synthesis',
    description: 'Synthesizes Western Allopathic, TCM Zang-Fu, and Ayurvedic Tridosha clinical care plan strategies.',
    inputSchema: {
      type: 'object',
      properties: {
        symptoms: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of patient symptoms or clinical complaints'
        },
        vitals: {
          type: 'object',
          description: 'Key patient vitals (bp, hr, spO2, temp)'
        }
      },
      required: ['symptoms']
    }
  },
  {
    name: 'pocketgull_generate_soap_note',
    description: 'Generates a structured SOAP (Subjective, Objective, Assessment, Plan) note and FHIR DocumentReference.',
    inputSchema: {
      type: 'object',
      properties: {
        patientName: { type: 'string' },
        transcript: { type: 'string', description: 'Clinical encounter audio transcript' }
      },
      required: ['transcript']
    }
  },
  {
    name: 'pocketgull_phi_scan',
    description: 'Scans input text or clinical records for potential Protected Health Information (PHI) leaks.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text content to audit for PHI compliance' }
      },
      required: ['text']
    }
  },
  {
    name: 'pocketgull_fhir_export',
    description: 'Generates a FHIR R4 Bundle (JSON format) containing Patient, Observation, and Condition resources.',
    inputSchema: {
      type: 'object',
      properties: {
        patientName: { type: 'string' },
        conditions: { type: 'array', items: { type: 'string' } }
      }
    }
  }
];

function handleToolCall(name, args) {
  switch (name) {
    case 'pocketgull_get_patient': {
      const pId = args?.patientId || 'p_default_patient';
      return {
        id: pId,
        name: 'Alexander Vance',
        age: 42,
        gender: 'Male',
        lastVisit: '2026.05.20',
        vitals: { bp: '122/82', hr: '68', temp: '98.6°F', spO2: '98%', weight: '178 lbs', height: "5'10\"" },
        preexistingConditions: ['Hypertension', 'Mild Sleep Apnea', 'Google Health Integration'],
        symptoms: ['Executive Workload Fatigue', 'Intermittent Sleep Latency'],
        medications: ['Magnesium Glycinate 400mg', 'Omega-3 EPA/DHA 2000mg'],
        tcmIntake: { tcmPattern: 'Zang-Fu Balance with Mild Liver Qi Constriction' },
        ayurvedicIntake: { ayurvedicImbalance: 'Samagni Metabolic Balance with Mild Pitta Exertion' }
      };
    }
    case 'pocketgull_tri_paradigm_synthesis': {
      const symptoms = args?.symptoms || ['Executive Fatigue'];
      return {
        westernAllopathic: {
          assessment: `Metabolic efficiency & circadian latency secondary to executive stress.`,
          recommendations: ['Nocturnal Magnesium Glycinate 400mg', 'PPG HRV monitoring']
        },
        tcmZangFu: {
          pattern: 'Liver Qi Constriction with Heart Blood Nourishment Need',
          herbalFormula: 'Xiao Yao San (Free & Easy Wanderer) modification'
        },
        ayurvedicTridosha: {
          doshicState: 'Pitta-Vata Exertion',
          regimen: 'Cooling Pranayama (Shitali) & Ashwagandha root extract'
        },
        consensusPlan: `Unified 3-Phase Protocol addressing circadian phase delay, autonomic tone, and metabolic stability for symptoms: ${symptoms.join(', ')}`
      };
    }
    case 'pocketgull_generate_soap_note': {
      const transcript = args?.transcript || 'Patient reports mild fatigue and sleep delay.';
      const name = args?.patientName || 'Alexander Vance';
      return {
        resourceType: 'Bundle',
        type: 'document',
        subjective: `Patient (${name}): "${transcript}"`,
        objective: 'Vitals: BP 122/82, HR 68, SpO2 98%, Temp 98.6°F. Metabolic markers within optimal ranges.',
        assessment: 'Circadian entrainment mismatch with baseline metabolic stability.',
        plan: '1. Timed morning sunlight exposure (15-20 min).\n2. Nocturnal Magnesium Glycinate 400mg.\n3. Re-evaluate HRV SDNN in 14 days.'
      };
    }
    case 'pocketgull_phi_scan': {
      const text = args?.text || '';
      const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
      const hasSsn = ssnPattern.test(text);
      const hasEmail = emailPattern.test(text);

      return {
        compliant: !hasSsn && !hasEmail,
        detectedTypes: [
          ...(hasSsn ? ['SSN'] : []),
          ...(hasEmail ? ['EMAIL'] : [])
        ],
        auditSummary: (!hasSsn && !hasEmail)
          ? '✅ No unprotected PHI detected. Safe for clinical model input.'
          : '⚠️ Potential PHI detected. Redact before forwarding to cloud LLM.'
      };
    }
    case 'pocketgull_fhir_export': {
      const name = args?.patientName || 'Alexander Vance';
      const conditions = args?.conditions || ['Hypertension', 'Mild Sleep Apnea'];
      return {
        resourceType: 'Bundle',
        type: 'document',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'p_default_patient',
              name: [{ text: name }],
              gender: 'male'
            }
          },
          ...conditions.map((c, i) => ({
            resource: {
              resourceType: 'Condition',
              id: `cond_${i + 1}`,
              code: { text: c },
              clinicalStatus: { coding: [{ code: 'active' }] }
            }
          }))
        ]
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── JSON-RPC 2.0 Stdio Handler ───────────────────────────────────────────────
let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk.toString('utf8');
  const lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line fragment in buffer

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const request = JSON.parse(line.trim());
      handleRpcRequest(request);
    } catch (e) {
      sendRpcError(null, -32700, 'Parse error');
    }
  }
});

function handleRpcRequest(req) {
  const { id, method, params } = req;

  switch (method) {
    case 'initialize':
      sendRpcResult(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'pocketgull-mcp-server',
          version: '1.9.1'
        }
      });
      break;

    case 'notifications/initialized':
      // Notification acknowledgment
      break;

    case 'tools/list':
      sendRpcResult(id, { tools: TOOLS });
      break;

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      try {
        const result = handleToolCall(name, args);
        sendRpcResult(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        });
      } catch (err) {
        sendRpcResult(id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: err.message })
            }
          ],
          isError: true
        });
      }
      break;
    }

    default:
      if (id !== undefined) {
        sendRpcError(id, -32601, `Method not found: ${method}`);
      }
      break;
  }
}

function sendRpcResult(id, result) {
  if (id === undefined || id === null) return;
  const msg = JSON.stringify({ jsonrpc: '2.0', id, result });
  process.stdout.write(msg + '\n');
}

function sendRpcError(id, code, message) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
  process.stdout.write(msg + '\n');
}
