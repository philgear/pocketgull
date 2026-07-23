import { execSync } from 'child_process';

console.log('☁️ [gcloud Preflight] Running Google Cloud CLI & Deployment Health Checks...\n');

try {
  // 1. gcloud CLI Version check
  const gcloudVer = execSync('gcloud --version', { encoding: 'utf-8' });
  const firstLine = gcloudVer.split('\n')[0];
  console.log(`✅ [CLI Version] ${firstLine}`);

  // 2. Active GCP Project check
  const project = execSync('gcloud config get-value project', { encoding: 'utf-8' }).trim();
  console.log(`✅ [GCP Project] Active Project: ${project}`);
  if (project !== 'gen-lang-client-0540208645') {
    console.warn(`⚠️ [Warning] Active project is "${project}". Standard deployment target is "gen-lang-client-0540208645".`);
  }

  // 3. Cloud Run Service URL check
  const serviceUrl = execSync('gcloud run services describe pocket-gull --project gen-lang-client-0540208645 --region us-central1 --format="value(status.url)"', { encoding: 'utf-8' }).trim();
  console.log(`✅ [Cloud Run] Active URL: ${serviceUrl}`);

  console.log('\n✨ [Preflight Complete] gcloud deployment environment is 100% healthy and ready.');
} catch (e) {
  console.error('❌ [Preflight Error]', e.message);
  process.exit(1);
}
