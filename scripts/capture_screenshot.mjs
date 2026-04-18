import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const DEFAULT_URL = 'http://127.0.0.1:8000';
const DEFAULT_WAIT_MS = 1500;
const DEFAULT_VIEWPORT = { width: 1440, height: 1024 };

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    out: null,
    fullPage: true,
    waitMs: DEFAULT_WAIT_MS,
    selector: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--url' && argv[i + 1]) {
      options.url = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--out' && argv[i + 1]) {
      options.out = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--wait' && argv[i + 1]) {
      options.waitMs = Number.parseInt(argv[i + 1], 10);
      i += 1;
      continue;
    }

    if (arg === '--selector' && argv[i + 1]) {
      options.selector = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--viewport' && argv[i + 2]) {
      options.viewport = {
        width: Number.parseInt(argv[i + 1], 10),
        height: Number.parseInt(argv[i + 2], 10),
      };
      i += 2;
      continue;
    }

    if (arg === '--no-full-page') {
      options.fullPage = false;
    }
  }

  return options;
}

function buildOutputPath(explicitPath) {
  if (explicitPath) {
    return path.resolve(explicitPath);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.resolve('output', 'screenshots', `screenshot-${stamp}.png`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const outputPath = buildOutputPath(options.out);
  const viewport = options.viewport ?? DEFAULT_VIEWPORT;

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport });

    await page.goto(options.url, { waitUntil: 'domcontentloaded' });

    if (options.selector) {
      await page.locator(options.selector).waitFor({ state: 'visible', timeout: 10000 });
    } else {
      await page.waitForLoadState('networkidle').catch(() => {});
    }

    if (Number.isFinite(options.waitMs) && options.waitMs > 0) {
      await page.waitForTimeout(options.waitMs);
    }

    await page.screenshot({
      path: outputPath,
      fullPage: options.fullPage,
    });

    console.log(`Saved screenshot to ${outputPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('Failed to capture screenshot.');
  console.error(error);
  process.exitCode = 1;
});
