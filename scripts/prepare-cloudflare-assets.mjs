import fs from 'node:fs/promises';
import path from 'node:path';

const maxAssetBytes = 25 * 1024 * 1024;
const distRoot = path.resolve('dist');
const imageMap = JSON.parse(await fs.readFile('src/data/cloudinary-image-map.json', 'utf8'));
const oversized = [];

const inspect = async (directory) => {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(absolutePath);
    } else if (entry.isFile()) {
      const { size } = await fs.stat(absolutePath);
      if (size > maxAssetBytes) {
        const relativePath = path.relative(distRoot, absolutePath).replaceAll('\\', '/');
        oversized.push({ absolutePath, relativePath, cloudinaryUrl: imageMap[`public/${relativePath}`] });
      }
    }
  }
};

await inspect(distRoot);

const unmapped = oversized.filter(({ cloudinaryUrl }) =>
  !cloudinaryUrl?.startsWith('https://res.cloudinary.com/') || !cloudinaryUrl.includes('/upload/')
);
if (unmapped.length) {
  throw new Error(`Cloudflare assets exceed 25 MiB without a Cloudinary mapping:\n${unmapped.map(({ relativePath }) => `- ${relativePath}`).join('\n')}`);
}

for (const { absolutePath, relativePath } of oversized) {
  await fs.rm(absolutePath);
  console.log(`Serving ${relativePath} from Cloudinary; omitted from dist.`);
}
