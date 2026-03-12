import { join } from 'path';
import fs from 'fs';

const rootDir = process.cwd();

for (const envFile of ['.env.local', '.env']) {
  try {
    const localEnv = fs.readFileSync(join(rootDir, envFile), 'utf8');
    const match = localEnv.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
    if (match) {
      console.log(`[Secrets] Manual load success: ${envFile}`);
      console.log('KEY:', match[1].trim());
    }
  } catch (e) { console.error(e) }
}
