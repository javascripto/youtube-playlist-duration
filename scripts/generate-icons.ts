import { mkdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourceSvgPath = path.join(rootDir, 'src', 'icons', 'icon.svg');
const outputDir = path.join(rootDir, '.icons-dist');
const iconSizes = [16, 32, 48, 96, 128, 256, 512] as const;

export async function generateIcons(): Promise<void> {
  const svgContent = await readFile(sourceSvgPath, 'utf8');

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await copyFile(sourceSvgPath, path.join(outputDir, 'icon.svg'));

  for (const size of iconSizes) {
    const resvg = new Resvg(svgContent, {
      fitTo: {
        mode: 'width',
        value: size,
      },
    });
    const pngBuffer = resvg.render().asPng();
    await writeFile(path.join(outputDir, `icon-${size}.png`), pngBuffer);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  generateIcons().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
