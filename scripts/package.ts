import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const browser = process.argv[2];
if (!['chrome', 'firefox'].includes(browser)) {
  console.error('Uso: tsx scripts/package.ts <chrome|firefox>');
  process.exit(1);
}

const sourceDir = path.join(rootDir, 'dist', browser);
const zipPath = path.join(rootDir, `extension-${browser}.zip`);

async function assertBuildExists() {
  try {
    await access(sourceDir, constants.R_OK);
  } catch {
    console.error(
      `Build não encontrado em ${sourceDir}. Rode npm run build primeiro.`,
    );
    process.exit(1);
  }
}

function runZip() {
  return new Promise<void>((resolve, reject) => {
    const child = spawn('zip', ['-r', zipPath, '.'], {
      cwd: sourceDir,
      stdio: 'inherit',
    });
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`zip saiu com código ${code}`));
      }
    });
  });
}

await assertBuildExists();
await rm(zipPath, { force: true });
await runZip();
// biome-ignore lint/suspicious/noConsoleLog: Logging package generation status
console.log(`Pacote gerado: ${zipPath}`);
