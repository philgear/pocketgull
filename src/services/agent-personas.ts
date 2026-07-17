import { AnalysisLens } from './clinical-intelligence.service';

/**
 * Visual identity for each Gull Squadron agent.
 * @see DESIGN.md §7 — Avian Personas
 */
export interface IAgentPersona {
    /** Display name — e.g. 'Gulliver' */
    name: string;
    /** Short role title for badge display */
    role: string;
    /** Emoji icon for compact contexts */
    emoji: string;
    /** Signature tagline — italicized in UI */
    tagline: string;
    /** Hex accent color for theming */
    accentColor: string;
    /** Tailwind color class suffix — e.g. 'blue-500' */
    accentTailwind: string;
    /** Path to origami avatar image (relative to assets root) */
    avatarPath: string;
}

/**
 * The four diagnostic agents of the Gull Squadron.
 * Each maps to one or more AnalysisLens values.
 */
export const AGENT_PERSONAS: Record<string, IAgentPersona> = {
    gulliver: {
        name: 'Gulliver',
        role: 'Overview & Chart Synthesis',
        emoji: '🔭',
        tagline: 'I see the whole ocean from up here.',
        accentColor: '#1C6AFF',
        accentTailwind: 'blue-500',
        avatarPath: 'assets/images/agents/gulliver.png',
    },
    swoop: {
        name: 'Swoop',
        role: 'Interventions & Precision Dosing',
        emoji: '⚡',
        tagline: 'Spotted. Locked. Delivering.',
        accentColor: '#059669',
        accentTailwind: 'emerald-600',
        avatarPath: 'assets/images/agents/swoop.png',
    },
    sentinel: {
        name: 'Sentinel',
        role: 'Recovery Vigilance & Trends',
        emoji: '🔦',
        tagline: 'I never blink. I never look away.',
        accentColor: '#D97706',
        accentTailwind: 'amber-600',
        avatarPath: 'assets/images/agents/sentinel.png',
    },
    scribes: {
        name: 'Scribes',
        role: 'Patient Translation & Education',
        emoji: '📖',
        tagline: 'Let me explain that in a way that actually helps.',
        accentColor: '#7C3AED',
        accentTailwind: 'violet-600',
        avatarPath: 'assets/images/agents/scribes.png',
    },
};

/**
 * Returns the full visual persona for a given diagnostic lens.
 * Centralizes the lens → agent mapping formerly split across
 * getAgentNameForLens() and getAgentRoleForLens().
 */
export function getPersonaForLens(lens: AnalysisLens): IAgentPersona {
    switch (lens) {
        case 'Summary Overview':
            return AGENT_PERSONAS['gulliver'];
        case 'Functional Protocols':
        case 'Nutrition':
        case 'Precision Nutrients':
        case 'Treatment Matrix':
            return AGENT_PERSONAS['swoop'];
        case 'Monitoring & Follow-up':
            return AGENT_PERSONAS['sentinel'];
        case 'Patient Education':
            return AGENT_PERSONAS['scribes'];
        default:
            return AGENT_PERSONAS['gulliver'];
    }
}
