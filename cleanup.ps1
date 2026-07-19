# Reorganize repository diagnostics and clean up git history on Windows
Write-Host "Starting repository cleanup..."

# 1. Create target directory
$diagPath = "tools\diagnostics"
if (!(Test-Path $diagPath)) { New-Item -ItemType Directory -Force -Path $diagPath }

# 2. Consolidate adk-test.ts
$adkTestContent = @'
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
'@
Set-Content -Path (Join-Path $diagPath "adk-test.ts") -Value $adkTestContent -Force

# 3. Move diagnostic scripts from root to tools/diagnostics/
$rootScripts = @("test-api.js", "test-cse.js", "test-cse2.js", "test-raw-ws.mjs", "test-ws.mjs")
foreach ($file in $rootScripts) {
    if (Test-Path $file) {
        Write-Host "Moving root-level script: $file -> tools/diagnostics/"
        Move-Item -Path $file -Destination $diagPath -Force
    }
}

# 4. Move diagnostic and screenshot files from scripts/sandbox to tools/diagnostics/
if (Test-Path "scripts\sandbox") {
    Write-Host "Moving sandbox files..."
    $sandboxFiles = @(
        "puppeteer-test.js", "test-browser.js", "test-check-state.cjs", "test-check-state.png",
        "test-console.cjs", "test-debug-btn.cjs", "test-debug-btn.png", "test-force-state.cjs",
        "test-force-state.png", "test-inline-chat.js", "test-intake-form.cjs", "test-l5-model.js",
        "test-mobile-scroll.js", "test-mobile-scroll.mjs", "test-ng-state.cjs", "test-ng-state.png",
        "test-page.js", "test-redirect.cjs", "test-redirect.js", "test-voice-click.cjs", "test-watch.mjs"
    )
    foreach ($file in $sandboxFiles) {
        $p = "scripts\sandbox\$file"
        if (Test-Path $p) { Move-Item -Path $p -Destination $diagPath -Force }
    }

    # 5. Delete historical duplicates and runtime logs
    Write-Host "Removing historical duplicates and logs..."
    $duplicates = @(
        "adk-test.ts", "adk-test2.ts", "adk-test3.ts", "adk-test4.ts",
        "test-watch-2.mjs", "test-watch-3.mjs", "test-watch-overflow.mjs",
        "watch-3-log.txt", "watch-log.txt"
    )
    foreach ($file in $duplicates) {
        $p = "scripts\sandbox\$file"
        if (Test-Path $p) { Remove-Item -Path $p -Force }
    }

    # Clean up sandbox directory if empty
    if ((Get-ChildItem "scripts\sandbox").Count -eq 0) { Remove-Item "scripts\sandbox" -Force }
    if (Test-Path "scripts") {
        if ((Get-ChildItem "scripts").Count -eq 0) { Remove-Item "scripts" -Force }
    }
}

# 6. Ensure we delete untracked garbage in the root
$rootLogs = @("server.pid", "watch-log.txt", "watch-3-log.txt")
foreach ($file in $rootLogs) {
    if (Test-Path $file) { Remove-Item $file -Force }
}

Write-Host "Cleanup completed successfully!"
