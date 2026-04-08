#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { WanClient } from './client';
import { WanVideoClient } from './video-client';
import { WanVideoEditClient } from './video-edit-client';
import { Region } from './types';

config({ path: path.resolve(process.cwd(), '.env') });

// ---------------------------------------------------------------------------
// Arg parsing (zero dependencies)
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { command: string; flags: Record<string, string | string[]> } {
  const command = argv[0] || 'help';
  const flags: Record<string, string | string[]> = {};

  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      if (key in flags) {
        const existing = flags[key];
        flags[key] = Array.isArray(existing) ? [...existing, val] : [existing as string, val];
      } else {
        flags[key] = val;
      }
    }
  }
  return { command, flags };
}

function flag(flags: Record<string, string | string[]>, key: string): string | undefined {
  const v = flags[key];
  return Array.isArray(v) ? v[0] : v;
}

function flagAll(flags: Record<string, string | string[]>, key: string): string[] {
  const v = flags[key];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function flagBool(flags: Record<string, string | string[]>, key: string, fallback: boolean): boolean {
  const v = flag(flags, key);
  if (v === undefined) return fallback;
  return v !== 'false' && v !== '0';
}

function flagInt(flags: Record<string, string | string[]>, key: string): number | undefined {
  const v = flag(flags, key);
  return v !== undefined ? parseInt(v, 10) : undefined;
}

function requireFlag(val: string | undefined, name: string): string {
  if (!val) {
    console.error(`Missing required flag: --${name}`);
    process.exit(1);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function getApiKey(): string {
  const key = process.env.ALICLOUD_API_KEY || process.env.Alicloud_API_Key;
  if (!key) {
    console.error('Missing API key. Set ALICLOUD_API_KEY in .env or environment.');
    process.exit(1);
  }
  return key;
}

function getRegion(flags: Record<string, string | string[]>): Region {
  const r = flag(flags, 'region') || 'singapore';
  const map: Record<string, Region> = { singapore: Region.SINGAPORE, virginia: Region.VIRGINIA, beijing: Region.BEIJING };
  return map[r] || Region.SINGAPORE;
}

async function download(url: string, dest: string): Promise<void> {
  const axios = (await import('axios')).default;
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(resp.data));
  const mb = (resp.data.byteLength / 1024 / 1024).toFixed(1);
  console.log(`Saved ${dest} (${mb} MB)`);
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function progressLog(start: number) {
  return (status: string, taskId: string) => {
    const sec = ((Date.now() - start) / 1000).toFixed(0);
    console.log(`  [${sec}s] ${taskId}: ${status}`);
  };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function cmdImage(flags: Record<string, string | string[]>) {
  const prompt = requireFlag(flag(flags, 'prompt'), 'prompt');
  const size = flag(flags, 'size') || '1280*1280';
  const n = flagInt(flags, 'n') || 1;
  const out = flag(flags, 'out') || `./outputs/image-${timestamp()}.png`;
  const refs = flagAll(flags, 'ref');

  const client = new WanClient({ apiKey: getApiKey(), region: getRegion(flags) });

  console.log(`Generating image (${size}, n=${n})...`);

  let result;
  if (refs.length > 0) {
    result = await client.imageEditing({
      prompt,
      referenceImages: refs.map(r => r.startsWith('http') ? { url: r } : { url: `data:image/png;base64,${fs.readFileSync(path.resolve(r)).toString('base64')}` }),
      size,
      n,
      negativePrompt: flag(flags, 'negative'),
      promptExtend: flagBool(flags, 'prompt-extend', true),
      watermark: flagBool(flags, 'watermark', false),
      seed: flagInt(flags, 'seed'),
    });
  } else {
    result = await client.textToImage({
      prompt,
      size,
      n,
      negativePrompt: flag(flags, 'negative'),
      promptExtend: flagBool(flags, 'prompt-extend', true),
      watermark: flagBool(flags, 'watermark', false),
      seed: flagInt(flags, 'seed'),
    });
  }

  if (!result.success || result.results.length === 0) {
    console.error('Generation failed:', result.error);
    process.exit(1);
  }

  for (let i = 0; i < result.results.length; i++) {
    for (let j = 0; j < result.results[i].images.length; j++) {
      const imgUrl = result.results[i].images[j].url;
      const dest = result.results[i].images.length === 1 && result.results.length === 1
        ? out
        : out.replace(/\.png$/, `-${i + 1}-${j + 1}.png`);
      await download(imgUrl, dest);
    }
  }
}

async function cmdI2V(flags: Record<string, string | string[]>) {
  const prompt = requireFlag(flag(flags, 'prompt'), 'prompt');
  const image = requireFlag(flag(flags, 'image'), 'image');
  const duration = flagInt(flags, 'duration') || 5;
  const resolution = flag(flags, 'resolution') || '720P';
  const model = flag(flags, 'model') || 'wan2.7-i2v';
  const out = flag(flags, 'out') || `./outputs/i2v-${timestamp()}.mp4`;

  const client = new WanVideoClient({
    apiKey: getApiKey(),
    region: getRegion(flags),
    videoTimeout: 600000,
    pollingInterval: 15000,
    maxPollingAttempts: 200,
  });

  console.log(`I2V: ${model}, ${resolution}, ${duration}s`);
  console.log(`Image: ${image}`);
  console.log(`Prompt: ${prompt}`);
  console.log('');

  const start = Date.now();
  const result = await client.imageToVideo({
    prompt,
    imageUrl: image,
    model,
    resolution,
    duration,
    promptExtend: flagBool(flags, 'prompt-extend', false),
    watermark: flagBool(flags, 'watermark', false),
    seed: flagInt(flags, 'seed'),
    onProgress: progressLog(start),
  });

  const sec = ((Date.now() - start) / 1000).toFixed(0);
  console.log(`\nCompleted in ${sec}s | Task: ${result.taskId}`);

  if (result.success && result.videoUrl) {
    await download(result.videoUrl, out);
  } else {
    console.error('Generation failed.');
    process.exit(1);
  }
}

async function cmdT2V(flags: Record<string, string | string[]>) {
  const prompt = requireFlag(flag(flags, 'prompt'), 'prompt');
  const duration = flagInt(flags, 'duration') || 5;
  const size = flag(flags, 'size') || '1280*720';
  const model = flag(flags, 'model') || 'wan2.7-t2v';
  const out = flag(flags, 'out') || `./outputs/t2v-${timestamp()}.mp4`;

  const client = new WanVideoClient({
    apiKey: getApiKey(),
    region: getRegion(flags),
    videoTimeout: 600000,
    pollingInterval: 15000,
    maxPollingAttempts: 200,
  });

  console.log(`T2V: ${model}, ${size}, ${duration}s`);
  console.log(`Prompt: ${prompt}`);
  console.log('');

  const start = Date.now();
  const result = await client.textToVideo({
    prompt,
    model,
    size,
    duration,
    promptExtend: flagBool(flags, 'prompt-extend', true),
    watermark: flagBool(flags, 'watermark', false),
    seed: flagInt(flags, 'seed'),
    onProgress: progressLog(start),
  });

  const sec = ((Date.now() - start) / 1000).toFixed(0);
  console.log(`\nCompleted in ${sec}s | Task: ${result.taskId}`);

  if (result.success && result.videoUrl) {
    await download(result.videoUrl, out);
  } else {
    console.error('Generation failed.');
    process.exit(1);
  }
}

async function cmdVideoStyle(flags: Record<string, string | string[]>) {
  const prompt = requireFlag(flag(flags, 'prompt'), 'prompt');
  const video = requireFlag(flag(flags, 'video'), 'video');
  const resolution = flag(flags, 'resolution') || '1080P';
  const out = flag(flags, 'out') || `./outputs/video-style-${timestamp()}.mp4`;

  const client = new WanVideoEditClient({
    apiKey: getApiKey(),
    region: getRegion(flags),
    videoEditTimeout: 600000,
    pollingInterval: 15000,
    maxPollingAttempts: 200,
  });

  console.log(`Video Style: wan2.7-videoedit, ${resolution}`);
  console.log(`Video: ${video}`);
  console.log(`Prompt: ${prompt}`);
  console.log('');

  const start = Date.now();
  const result = await client.videoStyleModification({
    prompt,
    videoUrl: video,
    resolution,
    negativePrompt: flag(flags, 'negative'),
    ratio: flag(flags, 'ratio') as any,
    duration: flagInt(flags, 'duration'),
    audioSetting: flag(flags, 'audio') as any,
    promptExtend: flagBool(flags, 'prompt-extend', true),
    watermark: flagBool(flags, 'watermark', false),
    seed: flagInt(flags, 'seed'),
    onProgress: progressLog(start),
  });

  const sec = ((Date.now() - start) / 1000).toFixed(0);
  console.log(`\nCompleted in ${sec}s | Task: ${result.taskId}`);

  if (result.success && result.videoUrl) {
    await download(result.videoUrl, out);
  } else {
    console.error('Generation failed.');
    process.exit(1);
  }
}

async function cmdVideoEdit(flags: Record<string, string | string[]>) {
  const prompt = requireFlag(flag(flags, 'prompt'), 'prompt');
  const video = requireFlag(flag(flags, 'video'), 'video');
  const refs = flagAll(flags, 'ref');
  if (refs.length === 0) {
    console.error('Missing required flag: --ref (at least one reference image)');
    process.exit(1);
  }
  const resolution = flag(flags, 'resolution') || '1080P';
  const out = flag(flags, 'out') || `./outputs/video-edit-${timestamp()}.mp4`;

  const client = new WanVideoEditClient({
    apiKey: getApiKey(),
    region: getRegion(flags),
    videoEditTimeout: 600000,
    pollingInterval: 15000,
    maxPollingAttempts: 200,
  });

  console.log(`Video Edit: wan2.7-videoedit, ${resolution}`);
  console.log(`Video: ${video}`);
  console.log(`Refs:  ${refs.join(', ')}`);
  console.log(`Prompt: ${prompt}`);
  console.log('');

  const start = Date.now();
  const result = await client.videoEdit({
    prompt,
    videoUrl: video,
    referenceImageUrls: refs,
    resolution,
    negativePrompt: flag(flags, 'negative'),
    ratio: flag(flags, 'ratio') as any,
    duration: flagInt(flags, 'duration'),
    audioSetting: flag(flags, 'audio') as any,
    promptExtend: flagBool(flags, 'prompt-extend', true),
    watermark: flagBool(flags, 'watermark', false),
    seed: flagInt(flags, 'seed'),
    onProgress: progressLog(start),
  });

  const sec = ((Date.now() - start) / 1000).toFixed(0);
  console.log(`\nCompleted in ${sec}s | Task: ${result.taskId}`);

  if (result.success && result.videoUrl) {
    await download(result.videoUrl, out);
  } else {
    console.error('Generation failed.');
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
wan - Alibaba Cloud Model Studio CLI (Wan 2.7)

Usage: wan <command> [options]

Commands:
  image         Text-to-image or image editing (wan2.7-image)
  i2v           Image-to-video (wan2.7-i2v)
  t2v           Text-to-video (wan2.7-t2v)
  video-style   Video style modification (wan2.7-videoedit)
  video-edit    Video editing with reference images (wan2.7-videoedit)
  help          Show this help

Common options:
  --prompt      Text prompt (required for all commands)
  --out         Output file path (auto-generated if omitted)
  --region      API region: singapore | virginia | beijing (default: singapore)
  --seed        Random seed for reproducibility
  --watermark   Add watermark (default: false)
  --prompt-extend  Enable LLM prompt rewriting (default varies by command)

image:
  --ref         Reference image (repeatable, up to 4). Omit for text-to-image.
  --size        Output size e.g. 1280*720 (default: 1280*1280)
  --n           Number of images (default: 1)
  --negative    Negative prompt

i2v:
  --image       Input image path or URL (required)
  --model       Model name (default: wan2.7-i2v)
  --resolution  720P | 1080P (default: 720P)
  --duration    Duration in seconds (default: 5)

t2v:
  --model       Model name (default: wan2.7-t2v)
  --size        Video size e.g. 1280*720 (default: 1280*720)
  --duration    Duration in seconds (default: 5)

video-style:
  --video       Input video URL (required)
  --resolution  720P | 1080P (default: 1080P)
  --ratio       Output ratio: 16:9, 9:16, 1:1, 4:3, 3:4
  --duration    Output duration 2-10s (omit to keep input duration)
  --audio       Audio setting: auto | origin (default: auto)
  --negative    Negative prompt

video-edit:
  --video       Input video URL (required)
  --ref         Reference image URL (required, repeatable, up to 3)
  --resolution  720P | 1080P (default: 1080P)
  --ratio       Output ratio: 16:9, 9:16, 1:1, 4:3, 3:4
  --duration    Output duration 2-10s (omit to keep input duration)
  --audio       Audio setting: auto | origin (default: auto)
  --negative    Negative prompt

Examples:
  wan image --prompt "A sunset over Seoul" --size 1280*720 --out sunset.png
  wan image --prompt "Oil painting style" --ref photo.jpg --out painting.png
  wan i2v --image scene.png --prompt "He walks forward confidently" --duration 15
  wan t2v --prompt "A kitten in the moonlight" --duration 10
  wan video-style --video https://example.com/clip.mp4 --prompt "Claymation style"
  wan video-edit --video https://example.com/clip.mp4 --ref outfit.png --prompt "Change clothes"
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { command, flags: f } = parseArgs(process.argv.slice(2));

  try {
    switch (command) {
      case 'image':       await cmdImage(f); break;
      case 'i2v':         await cmdI2V(f); break;
      case 't2v':         await cmdT2V(f); break;
      case 'video-style': await cmdVideoStyle(f); break;
      case 'video-edit':  await cmdVideoEdit(f); break;
      case 'help': case '--help': case '-h':
        printHelp(); break;
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (err: any) {
    console.error(`\nError: ${err.message || err}`);
    process.exit(1);
  }
}

main();
