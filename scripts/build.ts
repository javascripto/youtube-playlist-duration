import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BuildOptions, build, context } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

const watchMode = process.argv.includes('--watch');
const browsers = ['chrome', 'firefox'] as const;

const entryPoints = [
  path.join(srcDir, 'background', 'index.ts'),
  path.join(srcDir, 'content', 'index.ts'),
  path.join(srcDir, 'popup', 'index.ts'),
];

async function copyStatic(
  targetDir: string,
  browser: (typeof browsers)[number],
) {
  await cp(
    path.join(srcDir, 'popup', 'index.html'),
    path.join(targetDir, 'popup', 'index.html'),
  );
  await cp(
    path.join(srcDir, 'popup', 'styles.css'),
    path.join(targetDir, 'popup', 'styles.css'),
  );
  await cp(
    path.join(srcDir, 'options', 'index.html'),
    path.join(targetDir, 'options', 'index.html'),
  );

  const manifest = await readFile(
    path.join(srcDir, `manifest.${browser}.json`),
    'utf8',
  );
  await writeFile(path.join(targetDir, 'manifest.json'), manifest, 'utf8');
}

async function setupDist() {
  if (!watchMode) {
    await rm(distDir, { recursive: true, force: true });
  }

  await mkdir(distDir, { recursive: true });
  for (const browser of browsers) {
    await mkdir(path.join(distDir, browser, 'background'), { recursive: true });
    await mkdir(path.join(distDir, browser, 'content'), { recursive: true });
    await mkdir(path.join(distDir, browser, 'popup'), { recursive: true });
    await mkdir(path.join(distDir, browser, 'options'), { recursive: true });
    await copyStatic(path.join(distDir, browser), browser);
  }
}

async function run() {
  await setupDist();

  const builds = browsers.map<BuildOptions>(browser => ({
    entryPoints,
    outbase: srcDir,
    outdir: path.join(distDir, browser),
    bundle: true,
    format: 'esm',
    target: 'es2022',
    logLevel: 'info',
  }));

  if (!watchMode) {
    await Promise.all(builds.map(config => build(config)));
    // biome-ignore lint/suspicious/noConsoleLog: Logging build completion status
    console.log('Build concluído em dist/chrome e dist/firefox');
    return;
  }

  const contexts = await Promise.all(builds.map(config => context(config)));
  await Promise.all(contexts.map(ctx => ctx.watch()));
  // biome-ignore lint/suspicious/noConsoleLog: Logging watch mode status
  console.log('Watch mode ativo');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
