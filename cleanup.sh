#!/bin/bash
# Reorganize repository diagnostics and clean up git history

echo "Starting repository cleanup..."

# 1. Create target directory
mkdir -p tools/diagnostics

# 2. Consolidate adk-test.ts
# Write the consolidated content to tools/diagnostics/adk-test.ts
cat << 'EOF' > tools/diagnostics/adk-test.ts
import { LlmAgent, ParallelAgent, InMemoryRunner, EventType, Gemini } from '@google/adk';

// Simulate environment for test if not present
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA-fake-key-just-for-syntax-pass';

async function testSingleAgent() {
  console.log('\n--- Testing Single Agent (Ephemeral Run) ---');
  const model = new Gemini({ model: 'gemini-2.5-flash', apiKey: process.env.GEMINI_API_KEY });
  const agent = new LlmAgent({
    name: 'agent1',
    model,
    instruction: 'Reply with the word ONE and nothing else.',
  });

  const runner = new InMemoryRunner({ agent });
  const events = runner.runEphemeral({
    userId: 'test_user',
    newMessage: { role: 'user', parts: [{ text: 'Go' }] }
  });

  try {
    for await (const event of events) {
      console.log('Got event of type:', event.type);
      if (event.type === EventType.MODEL_RESPONSE) {
        console.log('Response content:', JSON.stringify(event.content, null, 2));
      }
    }
  } catch (e: any) {
    console.log('Got API error (expected if key is invalid):', e.message);
  }
}

async function testParallelAgents() {
  console.log('\n--- Testing Parallel Agents ---');
  const model = new Gemini({ model: 'gemini-2.5-flash', apiKey: process.env.GEMINI_API_KEY });
  const agent1 = new LlmAgent({ name: 'Summ', model, instruction: 'Say ONE.' });
  const agent2 = new LlmAgent({ name: 'Proto', model, instruction: 'Say TWO.' });

  const parallel = new ParallelAgent({ name: 'Orchestrator', agents: [agent1, agent2] });

  const runner = new InMemoryRunner({ agent: parallel });
  const events = runner.runEphemeral({ userId: 'u', newMessage: { role: 'user', parts: [{ text: 'Go' }] } });

  try {
    for await (const event of events) {
      if (event.type === EventType.CONTENT) {
         console.log('CONTENT EVENT author:', (event as any).author, 'text:', (event as any).content?.parts?.[0]?.text);
      }
    }
  } catch (e: any) {
    console.log('Got API error (expected if key is invalid):', e.message);
  }
}

async function main() {
  await testSingleAgent();
  await testParallelAgents();
}

main().catch(console.error);
EOF

# 3. Move diagnostic scripts from root to tools/diagnostics/
# Check and move root-level test scripts if they exist
for file in test-api.js test-cse.js test-cse2.js test-raw-ws.mjs test-ws.mjs; do
  if [ -f "$file" ]; then
    echo "Moving root-level script: $file -> tools/diagnostics/"
    mv "$file" tools/diagnostics/
  fi
done

# 4. Move diagnostic and screenshot files from scripts/sandbox to tools/diagnostics/
if [ -d "scripts/sandbox" ]; then
  echo "Moving sandbox files..."
  # Move files we want to preserve
  for file in scripts/sandbox/puppeteer-test.js \
              scripts/sandbox/test-browser.js \
              scripts/sandbox/test-check-state.cjs \
              scripts/sandbox/test-check-state.png \
              scripts/sandbox/test-console.cjs \
              scripts/sandbox/test-debug-btn.cjs \
              scripts/sandbox/test-debug-btn.png \
              scripts/sandbox/test-force-state.cjs \
              scripts/sandbox/test-force-state.png \
              scripts/sandbox/test-inline-chat.js \
              scripts/sandbox/test-intake-form.cjs \
              scripts/sandbox/test-l5-model.js \
              scripts/sandbox/test-mobile-scroll.js \
              scripts/sandbox/test-mobile-scroll.mjs \
              scripts/sandbox/test-ng-state.cjs \
              scripts/sandbox/test-ng-state.png \
              scripts/sandbox/test-page.js \
              scripts/sandbox/test-redirect.cjs \
              scripts/sandbox/test-redirect.js \
              scripts/sandbox/test-voice-click.cjs \
              scripts/sandbox/test-watch.mjs; do
    if [ -f "$file" ]; then
      mv "$file" tools/diagnostics/
    fi
  done

  # 5. Delete historical duplicates and runtime logs
  echo "Removing historical duplicates and logs..."
  rm -f scripts/sandbox/adk-test.ts
  rm -f scripts/sandbox/adk-test2.ts
  rm -f scripts/sandbox/adk-test3.ts
  rm -f scripts/sandbox/adk-test4.ts
  rm -f scripts/sandbox/test-watch-2.mjs
  rm -f scripts/sandbox/test-watch-3.mjs
  rm -f scripts/sandbox/test-watch-overflow.mjs
  rm -f scripts/sandbox/watch-3-log.txt
  rm -f scripts/sandbox/watch-log.txt

  # Clean up scripts/sandbox if it's empty
  rmdir scripts/sandbox 2>/dev/null || true
  rmdir scripts 2>/dev/null || true
fi

# 6. Ensure we delete untracked garbage in the root
rm -f server.pid watch-log.txt watch-3-log.txt

echo "Cleanup completed successfully!"
