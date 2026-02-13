import { execSync } from 'child_process';

try {
  console.log('Running npm install to regenerate package-lock.json...');
  const output = execSync('npm install --legacy-peer-deps', {
    cwd: '/vercel/share/v0-project',
    stdio: 'pipe',
    encoding: 'utf-8',
    timeout: 120000,
  });
  console.log(output);
  console.log('Successfully regenerated package-lock.json');
} catch (error) {
  console.error('Error running npm install:', error.stdout || error.message);
  process.exit(1);
}
