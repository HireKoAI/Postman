import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Helper to fetch AWS credentials from local profile via CLI
const getAwsEnv = () => {
  try {
    const profile = process.env.AWS_PROFILE || 'hireko';
    const region = process.env.AWS_REGION || 'ca-central-1';

    console.log(`🔌 Fetching AWS credentials for profile: ${profile}...`);

    // Use CLI to get credentials in a simple KEY=VALUE format
    const output = execSync(`aws configure export-credentials --profile ${profile} --format env-no-export`, { encoding: 'utf-8' });

    const env = {};
    output.split('\n').forEach(line => {
      const match = line.match(/^AWS_(ACCESS_KEY_ID|SECRET_ACCESS_KEY|SESSION_TOKEN)=(.*)$/);
      if (match) {
        env[`import.meta.env.VITE_AWS_${match[1]}`] = JSON.stringify(match[2].trim());
      }
    });

    env['import.meta.env.VITE_AWS_REGION'] = JSON.stringify(region);
    return env;
  } catch (e) {
    console.warn("⚠️ Could not fetch AWS credentials from local profile. Falling back to .env");
    return {};
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: getAwsEnv()
})
