import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadEnv, requireEnv } from './lib/env.mjs';

loadEnv();

const dryRun = process.argv.includes('--dry-run');
const cloudName = requireEnv('CLOUDINARY_CLOUD_NAME');
const apiKey = requireEnv('CLOUDINARY_API_KEY');
const apiSecret = requireEnv('CLOUDINARY_API_SECRET');
const root = process.cwd();
const outputPath = path.join(root, 'src/data/cloudinary-image-map.json');
const includeRoots = [
  'src/assets/images',
  'public/media',
  'public/videos',
];
const excludedParts = new Set(['node_modules', 'dist', 'build', '.git', 'unused-assets-backup']);
const extensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.mov']);

const folderFor = (relativePath) => {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized.includes('/products/')) return 'bisile/products';
  if (normalized.includes('/hair/')) return 'bisile/hair';
  if (normalized.includes('/hero/') || normalized.includes('/videos/') || normalized.includes('/backgrounds/')) return 'bisile/hero';
  if (normalized.includes('/carousel/')) return 'bisile/categories';
  if (normalized.includes('/brand/')) return 'bisile/support';
  if (normalized.includes('/general/') || normalized.includes('/media/')) return 'bisile/general';
  return 'bisile/uploads';
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativeParts = path.relative(root, fullPath).split(path.sep);
    if (relativeParts.some((part) => excludedParts.has(part))) continue;
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (extensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
};

const sign = (params) => {
  const signatureBase = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return crypto.createHash('sha1').update(`${signatureBase}${apiSecret}`).digest('hex');
};

const upload = async (filePath, relativePath) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = folderFor(relativePath);
  const publicId = path.basename(relativePath, path.extname(relativePath)).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  const params = { folder, public_id: publicId, timestamp };
  const signature = sign(params);
  const bytes = await fs.readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([bytes]), path.basename(filePath));
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('public_id', publicId);
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: form,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || `Cloudinary upload failed for ${relativePath}`);
  return payload.secure_url;
};

const currentMap = JSON.parse(await fs.readFile(outputPath, 'utf8').catch(() => '{}'));
const files = (await Promise.all(includeRoots.map((dir) => walk(path.join(root, dir))))).flat();
const nextMap = { ...currentMap };

console.log(`${dryRun ? 'Dry run:' : 'Uploading'} ${files.length} assets to Cloudinary.`);

for (const file of files) {
  const relativePath = path.relative(root, file).replaceAll('\\', '/');
  if (nextMap[relativePath]) continue;
  if (dryRun) {
    console.log(`[dry-run] ${relativePath} -> ${folderFor(relativePath)}`);
    continue;
  }
  const secureUrl = await upload(file, relativePath);
  nextMap[relativePath] = secureUrl;
  console.log(`${relativePath} -> ${secureUrl}`);
}

if (!dryRun) {
  await fs.writeFile(outputPath, `${JSON.stringify(nextMap, null, 2)}\n`);
  console.log(`Wrote Cloudinary map to ${path.relative(root, outputPath)}.`);
}
