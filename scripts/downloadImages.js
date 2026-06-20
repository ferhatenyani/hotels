const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'restaurant-interior',
  'hotel-pool',
  'jetski',
  'beach',
  'spa',
  'hotel-room',
  'hotel-activities',
];

const IMAGES_PER_CATEGORY = 5;
const OUTPUT_ROOT = path.join(__dirname, '..', 'public', 'images');
const MAX_REDIRECTS = 10;
const REQUEST_TIMEOUT_MS = 30000;

function buildUrl(category) {
  const keyword = encodeURIComponent(category);
  return `https://source.unsplash.com/featured/?${keyword}`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function pickClient(url) {
  return url.startsWith('https:') ? https : http;
}

function fetchImage(url, destination, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    if (redirectsLeft < 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const client = pickClient(url);
    const request = client.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Node.js downloader) hotel-project/1.0',
          Accept: 'image/*,*/*;q=0.8',
        },
      },
      (response) => {
        const status = response.statusCode || 0;

        if (status >= 300 && status < 400 && response.headers.location) {
          response.resume();
          const next = new URL(response.headers.location, url).toString();
          fetchImage(next, destination, redirectsLeft - 1).then(
            resolve,
            reject,
          );
          return;
        }

        if (status !== 200) {
          response.resume();
          reject(new Error(`HTTP ${status} for ${url}`));
          return;
        }

        const fileStream = fs.createWriteStream(destination);
        response.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(() => resolve()));
        fileStream.on('error', (err) => {
          fs.unlink(destination, () => reject(err));
        });
      },
    );

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });
    request.on('error', reject);
  });
}

async function downloadCategory(category, summary) {
  const categoryDir = path.join(OUTPUT_ROOT, category);
  ensureDir(categoryDir);
  summary[category] = 0;

  for (let i = 1; i <= IMAGES_PER_CATEGORY; i++) {
    const filename = `${category}-${i}.jpg`;
    const destination = path.join(categoryDir, filename);
    const url = buildUrl(category);

    try {
      await fetchImage(url, destination);
      summary[category] += 1;
      console.log(`[OK]   ${category}/${filename}`);
    } catch (err) {
      console.error(`[FAIL] ${category}/${filename} -> ${err.message}`);
    }
  }
}

async function main() {
  ensureDir(OUTPUT_ROOT);
  const summary = {};

  console.log(`Downloading ${IMAGES_PER_CATEGORY} images for each of ${CATEGORIES.length} categories...`);
  console.log(`Output directory: ${OUTPUT_ROOT}\n`);

  for (const category of CATEGORIES) {
    console.log(`--- ${category} ---`);
    await downloadCategory(category, summary);
  }

  console.log('\n=== Download summary ===');
  let total = 0;
  for (const category of CATEGORIES) {
    const count = summary[category] || 0;
    total += count;
    console.log(`${category}: ${count}/${IMAGES_PER_CATEGORY}`);
  }
  console.log(`Total: ${total}/${CATEGORIES.length * IMAGES_PER_CATEGORY}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
