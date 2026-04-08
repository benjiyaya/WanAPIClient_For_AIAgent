# WanAPIClient

TypeScript SDK for the Alibaba Cloud Model Studio (DashScope) API. Covers image generation, video generation, and video editing using Wan 2.7 / 2.6 models.

Use this skill when you need to generate images, create videos from images or text, or edit videos using the Alibaba Cloud Model Studio API.

---

## Prerequisites

- Node.js v18+
- Alibaba Cloud Model Studio API key
- `.env` file at project root: `ALICLOUD_API_KEY=your-api-key`

```bash
cd .openclaw/workspace/WanAPIClient
npm install
npm run build
```

---

## CLI

The `wan` CLI is the primary interface. All commands use the client classes from `./src` directly.

```bash
npm run wan -- <command> [options]
# or after npm link:
wan <command> [options]
```

### Commands

```bash
# Text-to-image
wan image --prompt "A sunset over Seoul" --size 1280*720 --out sunset.png

# Image editing with references
wan image --prompt "Oil painting style" --ref photo.jpg --out painting.png

# Image-to-video (wan2.7-i2v)
wan i2v --image scene.png --prompt "He walks forward" --duration 15 --resolution 720P

# Text-to-video (wan2.7-t2v)
wan t2v --prompt "A kitten in the moonlight" --duration 10 --size 1280*720

# Video style modification (wan2.7-videoedit)
wan video-style --video https://example.com/clip.mp4 --prompt "Claymation style"

# Video editing with reference images (wan2.7-videoedit)
wan video-edit --video https://example.com/clip.mp4 --ref outfit.png --prompt "Change clothes"
```

### Common Options

| Flag | Description | Default |
|------|-------------|---------|
| `--prompt` | Text prompt (required) | — |
| `--out` | Output file path | auto-generated |
| `--region` | singapore, virginia, beijing | singapore |
| `--seed` | Random seed | — |
| `--watermark` | Add watermark | false |
| `--prompt-extend` | LLM prompt rewriting | varies |

Run `wan help` for full option details per command.

---

## Architecture

Three client classes, each extending the previous:

```
WanClient (Image)
  └── WanVideoClient (I2V, T2V)
        └── WanVideoEditClient (Video Style, Video Edit)
```

| Client | Model | Endpoint |
|--------|-------|----------|
| `WanClient` | `wan2.7-image` | `/services/aigc/multimodal-generation/generation` |
| `WanVideoClient` | `wan2.7-i2v` / `wan2.7-t2v` | `/services/aigc/video-generation/video-synthesis` |
| `WanVideoEditClient` | `wan2.7-videoedit` | `/services/aigc/video-generation/video-synthesis` |

Image calls are synchronous. Video calls are asynchronous (submit task, poll for result).

---

## Source Files

```
src/
├── cli.ts                # CLI entry point (wan command)
├── client.ts             # WanClient (image generation)
├── types.ts              # Image API types, WanClientConfig, WanApiError
├── index.ts              # Barrel exports
├── video-types.ts        # Video generation types (I2V, T2V)
├── video-client.ts       # WanVideoClient
├── video-edit-types.ts   # Video editing types (wan2.7-videoedit)
└── video-edit-client.ts  # WanVideoEditClient
```

---

## 1. Image Generation — `WanClient`

Model: `wan2.7-image`

### Initialization

```typescript
import WanClient from 'wan-apiclient';

const client = new WanClient({
  apiKey: process.env.ALICLOUD_API_KEY!,
  region: 'singapore', // 'singapore' | 'virginia' | 'beijing'
});
```

### textToImage

Generate images from a text prompt.

```typescript
const result = await client.textToImage({
  prompt: 'A sunset over the ocean, photorealistic',
  size: '1280*720',       // default '1280*1280'
  n: 1,                   // number of images (1-4)
  negativePrompt: 'blurry, low quality',
  promptExtend: true,     // LLM prompt rewriting (default true)
  watermark: false,
  seed: 42,
});

console.log(result.results[0].images[0].url);
```

### imageEditing

Edit images using 1-4 reference images + a text prompt.

```typescript
const result = await client.imageEditing({
  prompt: 'Transform this into an oil painting style',
  referenceImages: [
    { url: 'https://example.com/photo.jpg' },
    { base64: 'data:image/png;base64,...' },
  ],
  size: '1280*1280',
  n: 2,
});
```

### interactiveEditing

Edit with 0-1 reference images. Good for single-image transforms.

```typescript
const result = await client.interactiveEditing({
  prompt: 'Make this look like a vintage photograph',
  referenceImage: { url: 'https://example.com/photo.jpg' },
  size: '1280*1280',
});
```

### imageSet

Generate a set of related images (tutorials, comics, storyboards).

```typescript
const result = await client.imageSet({
  prompt: 'A 3-step tutorial for making pour-over coffee',
  maxImages: 3,     // 1-5 (default 3)
  size: '1280*1280',
});

// result.results[0].images => array of generated images
// result.results[0].text   => any generated text
```

### Resolution Options

| Size | Aspect | Use Case |
|------|--------|----------|
| `1280*720` | 16:9 | Cinematic wide shots |
| `720*1280` | 9:16 | Portrait / mobile |
| `1280*1280` | 1:1 | Square / character grids |
| `1280*960` | 4:3 | Standard scenes |
| `800*1200` | 2:3 | Book illustrations |

---

## 2. Video Generation — `WanVideoClient`

Default models: `wan2.7-i2v` (I2V), `wan2.7-t2v` (T2V).

### Initialization

```typescript
import { WanVideoClient } from 'wan-apiclient';

const videoClient = new WanVideoClient({
  apiKey: process.env.ALICLOUD_API_KEY!,
  region: 'singapore',
  videoTimeout: 300000,      // task submission timeout (default 5min)
  pollingInterval: 15000,    // poll every 15s (default)
  maxPollingAttempts: 80,    // max polls (default)
});
```

### imageToVideo

Generate a video from a first-frame image + prompt. Accepts public URLs, base64, or local file paths (auto-converted to base64).

```typescript
const result = await videoClient.imageToVideo({
  prompt: 'The cat starts running across the grass',
  imageUrl: 'https://example.com/cat.png', // or './local/cat.png'
  model: 'wan2.7-i2v',       // optional override
  resolution: '720P',        // '720P' | '1080P'
  duration: 5,               // seconds
  promptExtend: true,
  seed: 42,
  onProgress: (status, taskId) => {
    console.log(`[${taskId}] ${status}`);
  },
});

console.log(result.videoUrl);
```

### textToVideo

Generate a video from text only.

```typescript
const result = await videoClient.textToVideo({
  prompt: 'A kitten running in the moonlight',
  model: 'wan2.7-t2v',       // optional override
  size: '1280*720',           // pixel dimensions
  duration: 5,
  onProgress: (status, taskId) => {
    console.log(`[${taskId}] ${status}`);
  },
});

console.log(result.videoUrl);
```

### I2V Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `prompt` | string | required | Scene description |
| `imageUrl` | string | required | URL, base64, or local path |
| `model` | string | `wan2.7-i2v` | Model override |
| `resolution` | string | `720P` | `720P` or `1080P` |
| `duration` | number | 5 | Seconds |
| `negativePrompt` | string | — | Content to exclude |
| `promptExtend` | boolean | true | LLM prompt rewriting |
| `seed` | number | — | Reproducibility |
| `shotType` | string | — | `single` or `multi` |
| `audio` | boolean | — | Generate audio track |

### T2V Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `prompt` | string | required | Scene description |
| `model` | string | `wan2.7-t2v` | Model override |
| `size` | string | `1280*720` | Pixel dimensions |
| `duration` | number | 5 | Seconds |
| `negativePrompt` | string | — | Content to exclude |
| `promptExtend` | boolean | true | LLM prompt rewriting |
| `seed` | number | — | Reproducibility |

### VideoGenerationResult

```typescript
{
  requestId: string;
  taskId: string;
  success: boolean;
  videoUrl: string;       // download URL (expires)
  origPrompt?: string;
  actualPrompt?: string;  // after prompt rewriting
  usage?: { video_count, video_duration, image_count };
}
```

---

## 3. Video Editing — `WanVideoEditClient`

Model: `wan2.7-videoedit`. Uses a `media` array to pass one video + optional reference images.

### Initialization

```typescript
import { WanVideoEditClient } from 'wan-apiclient';

const editClient = new WanVideoEditClient({
  apiKey: process.env.ALICLOUD_API_KEY!,
  region: 'singapore',
  videoEditTimeout: 600000,  // default 10min
});
```

### videoStyleModification

Change the style of a video using a text prompt. No reference images needed.

```typescript
const result = await editClient.videoStyleModification({
  prompt: 'Convert the entire scene to claymation style',
  videoUrl: 'https://example.com/input.mp4',
  resolution: '720P',         // '720P' | '1080P' (default '1080P')
  ratio: '16:9',              // optional, omit to match input
  duration: 5,                // 2-10s, omit to keep input duration
  audioSetting: 'auto',       // 'auto' | 'origin'
  negativePrompt: 'blurry',
  onProgress: (status, taskId) => {
    console.log(`[${taskId}] ${status}`);
  },
});

console.log(result.videoUrl);
```

### videoEdit

Edit a video using 1-3 reference images + a text prompt.

```typescript
const result = await editClient.videoEdit({
  prompt: 'Replace the clothes with the outfit in the reference image',
  videoUrl: 'https://example.com/input.mp4',
  referenceImageUrls: [
    'https://example.com/outfit.png',
  ],
  resolution: '720P',
  onProgress: (status, taskId) => {
    console.log(`[${taskId}] ${status}`);
  },
});

console.log(result.videoUrl);
```

### Video Edit Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `prompt` | string | required | Edit description |
| `videoUrl` | string | required | Input video (MP4/MOV, 2-10s, up to 100MB) |
| `referenceImageUrls` | string[] | — | 1-3 images (videoEdit only) |
| `model` | string | `wan2.7-videoedit` | Override |
| `resolution` | string | `1080P` | `720P` or `1080P` |
| `ratio` | string | — | `16:9`, `9:16`, `1:1`, `4:3`, `3:4` |
| `duration` | number | — | 2-10s, omit to keep input duration |
| `audioSetting` | string | `auto` | `auto` or `origin` |
| `negativePrompt` | string | — | Content to exclude |
| `promptExtend` | boolean | true | LLM prompt rewriting |
| `seed` | number | — | Reproducibility |

---

## Shared Config

All three clients accept `WanClientConfig`:

```typescript
interface WanClientConfig {
  apiKey: string;                    // required
  region?: 'singapore' | 'virginia' | 'beijing';  // default 'singapore'
  endpoint?: string;                 // custom URL (overrides region)
  timeout?: number;                  // request timeout ms (default 120000)
  maxPollingAttempts?: number;       // async polling limit (default 60)
  pollingInterval?: number;          // poll interval ms (default 5000)
}
```

API endpoints by region:

| Region | Endpoint |
|--------|----------|
| Singapore | `https://dashscope-intl.aliyuncs.com/api/v1` |
| Virginia | `https://dashscope-us.aliyuncs.com/api/v1` |
| Beijing | `https://dashscope.aliyuncs.com/api/v1` |

---

## Error Handling

All methods throw `WanApiError`:

```typescript
try {
  const result = await client.textToImage({ prompt: 'test' });
} catch (err) {
  if (err instanceof WanApiError) {
    console.error(err.code);      // e.g. 'InvalidParameter', 'Throttling'
    console.error(err.message);
    console.error(err.requestId);
  }
}
```

---

## Usage

Prefer the CLI over writing standalone scripts:

```bash
# Generate an image
npm run wan -- image --prompt "Seoul skyline at sunrise" --size 1280*720 --out skyline.png

# Image-to-video from a local file
npm run wan -- i2v --image ./outputs/scene.png --prompt "Camera pushes in slowly" --duration 15

# Text-to-video
npm run wan -- t2v --prompt "A kitten playing in moonlight" --duration 10 --out kitten.mp4
```

For programmatic use, import the client classes directly:

```typescript
import { WanVideoClient } from './src/video-client';
```

---

## Notes

- **Video commands are long-running.** The CLI polls automatically until the task completes — do not kill the process early. Typical wait times:
  - 5s video: 2-5 minutes
  - 10s video: 5-15 minutes
  - 15s video: 15-30 minutes
  - Progress is printed every 15 seconds: `[120s] task-id: RUNNING`
- **Image commands are fast.** Typically 10-30 seconds.
- Image/video URLs in API responses expire after 24 hours. The CLI downloads automatically.
- Local file paths passed to `--image` (i2v) are auto-converted to base64 data URLs.
- The `--prompt-extend` flag uses an LLM to rewrite your prompt for better results. Defaults to `true` for image/t2v/video-edit, `false` for i2v. Set explicitly to override.

---

## API Documentation

- [Image Generation](https://www.alibabacloud.com/help/en/model-studio/image-generation-api-reference)
- [Image-to-Video](https://www.alibabacloud.com/help/en/model-studio/image-to-video-api-reference/)
- [Text-to-Video](https://www.alibabacloud.com/help/en/model-studio/text-to-video-api-reference)
- [Video Editing (wan2.7-videoedit)](https://www.alibabacloud.com/help/en/model-studio/wan-video-editing-api-reference)
