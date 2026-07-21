/// Agent Personas — Gull Squadron visual identity registry.
///
/// Flutter parity with Angular `agent-personas.ts` (89 lines).
/// Maps diagnostic analysis lenses to the four diagnostic agents
/// (Gulliver, Swoop, Sentinel, Scribes) with their visual identity.
library;

class AgentPersona {
  final String name;
  final String role;
  final String emoji;
  final String tagline;
  final String accentHex;
  final String avatarPath;

  const AgentPersona({
    required this.name,
    required this.role,
    required this.emoji,
    required this.tagline,
    required this.accentHex,
    required this.avatarPath,
  });
}

/// The four diagnostic agents of the Gull Squadron.
const agentPersonas = <String, AgentPersona>{
  'gulliver': AgentPersona(
    name: 'Gulliver',
    role: 'Overview & Chart Synthesis',
    emoji: '🔭',
    tagline: 'I see the whole ocean from up here.',
    accentHex: '#1C6AFF',
    avatarPath: 'assets/images/agents/gulliver.png',
  ),
  'swoop': AgentPersona(
    name: 'Swoop',
    role: 'Interventions & Precision Dosing',
    emoji: '⚡',
    tagline: 'Spotted. Locked. Delivering.',
    accentHex: '#059669',
    avatarPath: 'assets/images/agents/swoop.png',
  ),
  'sentinel': AgentPersona(
    name: 'Sentinel',
    role: 'Recovery Vigilance & Trends',
    emoji: '🔦',
    tagline: 'I never blink. I never look away.',
    accentHex: '#D97706',
    avatarPath: 'assets/images/agents/sentinel.png',
  ),
  'scribes': AgentPersona(
    name: 'Scribes',
    role: 'Patient Translation & Education',
    emoji: '📖',
    tagline: 'Let me explain that in a way that actually helps.',
    accentHex: '#7C3AED',
    avatarPath: 'assets/images/agents/scribes.png',
  ),
};

/// Returns the full visual persona for a given diagnostic lens.
AgentPersona getPersonaForLens(String lens) {
  switch (lens) {
    case 'Summary Overview':
      return agentPersonas['gulliver']!;
    case 'Functional Protocols':
    case 'Nutrition':
    case 'Precision Nutrients':
    case 'Treatment Matrix':
      return agentPersonas['swoop']!;
    case 'Monitoring & Follow-up':
      return agentPersonas['sentinel']!;
    case 'Patient Education':
      return agentPersonas['scribes']!;
    default:
      return agentPersonas['gulliver']!;
  }
}
