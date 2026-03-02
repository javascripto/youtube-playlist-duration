import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BuildOptions, build as esbuildBuild, context } from 'esbuild';
import { build as viteBuild } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');
const optionsBuildDir = path.join(rootDir, '.options-dist');
const popupBuildDir = path.join(rootDir, '.popup-dist');

const watchMode = process.argv.includes('--watch');
const browsers = ['chrome', 'firefox'] as const;

const entryPoints = [
  path.join(srcDir, 'background', 'index.ts'),
  path.join(srcDir, 'content', 'index.ts'),
];

async function copyStatic(
  targetDir: string,
  browser: (typeof browsers)[number],
) {
  await cp(optionsBuildDir, path.join(targetDir, 'options'), {
    recursive: true,
  });
  await cp(popupBuildDir, path.join(targetDir, 'popup'), {
    recursive: true,
  });

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
  await buildOptionsUi();
  await buildPopupUi();
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
    await Promise.all(builds.map(config => esbuildBuild(config)));
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

async function buildOptionsUi() {
  await viteBuild({
    configFile: path.join(rootDir, 'vite.options.config.ts'),
    mode: watchMode ? 'development' : 'production',
    logLevel: 'info',
  });
}

async function buildPopupUi() {
  await viteBuild({
    configFile: path.join(rootDir, 'vite.popup.config.ts'),
    mode: watchMode ? 'development' : 'production',
    logLevel: 'info',
  });
}
