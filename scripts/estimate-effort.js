/**
 * COCOMO II Effort Estimation Script
 * Based on the Constructive Cost Model II (Reference Manual 2000.0)
 */

import sloc from 'sloc';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically calculate KSLOC
function getDynamicKsloc() {
    let totalSloc = 0;
    const srcDir = path.join(__dirname, '..', 'src');
    
    function walk(dir) {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(function(file) {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) { 
                results = results.concat(walk(file));
            } else { 
                if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css')) {
                   results.push(file);
                }
            }
        });
        return results;
    }

    const files = walk(srcDir);
    files.forEach(file => {
        const code = fs.readFileSync(file, 'utf8');
        const ext = path.extname(file).substring(1);
        try {
            const stats = sloc(code, ext);
            if (stats && stats.source) {
                totalSloc += stats.source;
            }
        } catch(e) { /* ignore files sloc can't parse */ }
    });

    return totalSloc / 1000;
}

const KSLOC = getDynamicKsloc();

// Post-Architecture Scale Factors (SF)
// Range: Very Low (6.2) to Extra High (0.0) - simplified for this project
const scaleFactors = {
    prec: 3.72, // Precedentedness: Nominal (New project area but existing tech)
    flex: 3.04, // Development Flexibility: Nominal
    resl: 4.24, // Architecture/Risk Resolution: Nominal
    team: 2.19, // Team Cohesion: High (Solo/Small tight team)
    pmat: 4.68, // Process Maturity: Nominal
};

// Post-Architecture Cost Drivers (EM - Effort Multipliers)
// Range: Very Low to Extra High
const effortMultipliers = {
    rely: 1.10, // Required Software Reliability: High (Medical app)
    data: 1.14, // Data Base Size: High (Patient records/Gemini context)
    cplx: 1.17, // Product Complexity: High (AI/Three.js integration)
    ruse: 1.07, // Developed for Reusability: Nominal
    docu: 1.00, // Documentation Match to Life-Cycle: Nominal

    // Platform Factors
    time: 1.11, // Execution Time Constraint: High (Real-time AI voice)
    pvol: 0.87, // Platform Volatility: Low (Standard Web stack)

    // Personnel Factors
    acap: 0.71, // Analyst Capability: Extra High (Advanced agentic usage)
    pcap: 0.76, // Programmer Capability: Extra High
    pcon: 0.81, // Personnel Continuity: Very High
    aexp: 0.88, // Applications Experience: High
    pexp: 0.91, // Platform Experience: High
    lexp: 0.95, // Language Experience: High

    // Project Factors
    site: 0.80, // Multi-site Development: Extra High (Colocated/Solo)
    sced: 1.00, // Required Development Schedule: Nominal
};

function calculateEffort() {
    const B = 0.91 + 0.01 * Object.values(scaleFactors).reduce((a, b) => a + b, 0);
    const EAF = Object.values(effortMultipliers).reduce((a, b) => a * b, 1);

    const PM = 2.94 * EAF * Math.pow(KSLOC, B);

    // Schedule estimation (TDEV)
    const SCED_Percentage = (effortMultipliers.sced - 1) * 100; // Simplified
    const TDEV = 3.67 * Math.pow(PM, (0.28 + 0.1 * (B - 0.91)));

    return {
        ksloc: KSLOC,
        exponent_B: B.toFixed(4),
        eaf: EAF.toFixed(4),
        effort_pm: PM.toFixed(2),
        schedule_tdev: TDEV.toFixed(2),
    };
}

const results = calculateEffort();

console.log('--- COCOMO II Estimation Results ---');
console.log(`Project Size: ${results.ksloc} KSLOC`);
console.log(`Exponent B: ${results.exponent_B}`);
console.log(`Effort Adjustment Factor (EAF): ${results.eaf}`);
console.log(`Estimated Effort: ${results.effort_pm} Person-Months`);
console.log(`Estimated Schedule: ${results.schedule_tdev} Calendar Months`);
console.log('-----------------------------------');
