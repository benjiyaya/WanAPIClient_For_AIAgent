# Wan 2.7 API Client

TypeScript SDK for the Alibaba Cloud Model Studio (DashScope) API. Covers image generation, video generation, and video editing using Wan 2.7 models. Includes a CLI and an MCP server.

## Quick Start

### Install and build

```bash
npm install
npm run build
```

### Configure

Create a `.env` file in the project root:

```env
ALICLOUD_API_KEY=your-api-key-here
```

Get your API key from: [Alibaba Cloud Model Studio](https://modelstudio.console.alibabacloud.com)

---

## CLI

The `wan` CLI is the primary interface for running generations from the terminal.

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
| `--prompt-extend` | LLM prompt rewriting | varies by command |

Run `wan help` for full option details per command.

---

## MCP Server

Expose all generation capabilities as tools for MCP-compatible clients (Kilo, Claude Desktop, Cursor, Windsurf, etc.). See [MCP-SERVER.md](./MCP-SERVER.md) for full documentation.

### Quick setup

Add to your MCP client config:

```json
{
  "mcpServers": {
    "wan-apiclient": {
      "command": "node",
      "args": ["E:\\Alibaba_WanAI\\Wan2.7APIClient\\dist\\mcp-server.js"],
      "env": {
        "ALICLOUD_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Or run directly:

```bash
npm run mcp
```

### Available MCP Tools

| Tool | Model | Description |
|------|-------|-------------|
| `text_to_image` | wan2.7-image | Generate images from text |
| `image_editing` | wan2.7-image | Edit with 1-4 reference images |
| `interactive_editing` | wan2.7-image | Edit with 0-1 reference images |
| `image_set` | wan2.7-image | Generate related image sets |
| `image_to_video` | wan2.7-i2v | Video from a first-frame image |
| `text_to_video` | wan2.7-t2v | Video from text only |
| `video_style_modification` | wan2.7-videoedit | Restyle a video via prompt |
| `video_edit` | wan2.7-videoedit | Edit video with reference images |

---

## Programmatic Usage

### Image Generation — WanClient

```typescript
import { WanClient, Region } from 'wan-apiclient';

const client = new WanClient({
  apiKey: process.env.ALICLOUD_API_KEY!,
  region: Region.SINGAPORE,
});

// Text-to-image
const result = await client.textToImage({
  prompt: 'A sunset over the ocean, photorealistic',
  size: '1280*720',
  n: 1,
  negativePrompt: 'blurry, low quality',
  promptExtend: true,
  seed: 42,
});

console.log(result.results[0].images[0].url);

// Image editing with references
await client.imageEditing({
  prompt: 'Transform this into an oil painting style',
  referenceImages: [{ url: 'https://example.com/photo.jpg' }],
  size: '1280*1280',
  n: 2,
});

// Interactive editing (0-1 reference images)
await client.interactiveEditing({
  prompt: 'Make this look like a vintage photograph',
  referenceImage: { url: 'https://example.com/photo.jpg' },
  size: '1280*1280',
});

// Image set (tutorials, comics, storyboards)
await client.imageSet({
  prompt: 'A 3-step tutorial for making pour-over coffee',
  maxImages: 3,
  size: '1280*1280',
});
```

### Video Generation — WanVideoClient

```typescript
import { WanVideoClient } from 'wan-apiclient';

const videoClient = new WanVideoClient({
  apiKey: process.env.ALICLOUD_API_KEY!,
  region: Region.SINGAPORE,
});

// Image-to-video
const i2v = await videoClient.imageToVideo({
  prompt: 'The cat starts running across the grass',
  imageUrl: 'https://example.com/cat.png',
  resolution: '720P',
  duration: 5,
});

console.log(i2v.videoUrl);

// Text-to-video
const t2v = await videoClient.textToVideo({
  prompt: 'A kitten running in the moonlight',
  size: '1280*720',
  duration: 5,
});

console.log(t2v.videoUrl);
```

### Video Editing — WanVideoEditClient

```typescript
import { WanVideoEditClient } from 'wan-apiclient';

const editClient = new WanVideoEditClient({
  apiKey: process.env.ALICLOUD_API_KEY!,
  region: Region.SINGAPORE,
});

// Video style modification
await editClient.videoStyleModification({
  prompt: 'Convert the entire scene to claymation style',
  videoUrl: 'https://example.com/input.mp4',
  resolution: '720P',
});

// Video editing with reference images
await editClient.videoEdit({
  prompt: 'Replace the clothes with the outfit in the reference image',
  videoUrl: 'https://example.com/input.mp4',
  referenceImageUrls: ['https://example.com/outfit.png'],
  resolution: '720P',
});
```

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

## API Reference

### Image Sizes

| Size | Resolution | Aspect Ratio | Use Case |
|------|------------|--------------|----------|
| `1280*720` | 1280×720 | 16:9 | Cinematic wide shots |
| `720*1280` | 720×1280 | 9:16 | Portrait / mobile |
| `1280*1280` | 1280×1280 | 1:1 | Square / character grids |
| `1280*960` | 1280×960 | 4:3 | Standard scenes |
| `800*1200` | 800×1200 | 2:3 | Book illustrations |

### Regions

| Region | Endpoint |
|--------|----------|
| Singapore | `https://dashscope-intl.aliyuncs.com/api/v1` |
| Virginia | `https://dashscope-us.aliyuncs.com/api/v1` |
| Beijing | `https://dashscope.aliyuncs.com/api/v1` |

**Important:** API keys are region-specific. Do not mix regions.

### Video Parameters

#### Image-to-Video (wan2.7-i2v)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | required | Scene description |
| `imageUrl` | string | required | URL, base64, or local path |
| `resolution` | string | `720P` | `720P` or `1080P` |
| `duration` | number | 5 | Seconds (5-15) |
| `promptExtend` | boolean | false | LLM prompt rewriting |
| `seed` | number | — | Reproducibility |
| `shotType` | string | — | `single` or `multi` |
| `audio` | boolean | — | Generate audio track |

#### Text-to-Video (wan2.7-t2v)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | required | Scene description |
| `size` | string | `1280*720` | Pixel dimensions |
| `duration` | number | 5 | Seconds (5-15) |
| `promptExtend` | boolean | true | LLM prompt rewriting |
| `seed` | number | — | Reproducibility |

#### Video Editing (wan2.7-videoedit)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | required | Edit description |
| `videoUrl` | string | required | Input video URL |
| `referenceImageUrls` | string[] | — | 1-3 images (videoEdit only) |
| `resolution` | string | `1080P` | `720P` or `1080P` |
| `ratio` | string | — | `16:9`, `9:16`, `1:1`, `4:3`, `3:4` |
| `duration` | number | — | 2-10s, omit to keep input |
| `audioSetting` | string | `auto` | `auto` or `origin` |
| `promptExtend` | boolean | true | LLM prompt rewriting |
| `seed` | number | — | Reproducibility |

---

## Project Structure

```
Wan2.7APIClient/
├── src/
│   ├── cli.ts                # CLI entry point (wan command)
│   ├── client.ts             # WanClient (image generation)
│   ├── types.ts              # Image API types, WanClientConfig, WanApiError
│   ├── index.ts              # Barrel exports
│   ├── main.ts               # Module exports
│   ├── mcp-server.ts         # MCP server (8 tools, stdio transport)
│   ├── video-client.ts       # WanVideoClient
│   ├── video-types.ts        # Video generation types (I2V, T2V)
│   ├── video-edit-client.ts  # WanVideoEditClient
│   └── video-edit-types.ts   # Video editing types
├── dist/                     # Compiled output
├── .env                      # API key (create from .env.example)
├── package.json
├── tsconfig.json
├── SKILL.md                  # Agent skill definition
├── MCP-SERVER.md             # MCP server documentation
└── README.md
```

---

## Timing Expectations

| Operation | Typical Time |
|-----------|-------------|
| Image generation | 10-30 seconds |
| 5s video (I2V/T2V) | 2-5 minutes |
| 10s video | 5-15 minutes |
| 15s video | 15-30 minutes |
| Video style edit | 5-15 minutes |
| Video edit with refs | 5-15 minutes |

The CLI and MCP server poll automatically until video tasks complete. Do not kill the process early.

---

## Important Notes

1. **Image and video URLs expire after 24 hours** — Download and save promptly
2. **Region-specific API keys** — Keys from one region don't work in others
3. **Cost** — You are charged per successful generation
4. **Rate limits** — Check Alibaba Cloud documentation for limits
5. **Local file paths** — `--image` (i2v) and `--ref` (image) accept local paths, auto-converted to base64
6. **Prompt extend** — Defaults to `true` for image/t2v/video-edit, `false` for i2v

---

## Troubleshooting

| Error Code | Description | Solution |
|------------|-------------|----------|
| `InvalidApiKey` | API key is invalid or expired | Check your API key in the console |
| `InvalidParameter` | Invalid request parameters | Check parameter values and ranges |
| `AsyncNotSupported` | Async calls not supported | Enable async mode in request headers |
| `QuotaExceeded` | Rate limit exceeded | Wait and retry, or contact support |
| `TaskFailed` | Video generation task failed | Check the error message for details |
| `Timeout` | Video polling timed out | Increase `maxPollingAttempts` or `pollingInterval` |

---

## License

MIT

## Support

- [Alibaba Cloud Documentation](https://www.alibabacloud.com/help/en/model-studio)
- [Image Generation API](https://www.alibabacloud.com/help/en/model-studio/image-generation-api-reference)
- [Image-to-Video API](https://www.alibabacloud.com/help/en/model-studio/image-to-video-api-reference/)
- [Text-to-Video API](https://www.alibabacloud.com/help/en/model-studio/text-to-video-api-reference)
- [Video Editing API](https://www.alibabacloud.com/help/en/model-studio/wan-video-editing-api-reference)
- [API Error Codes](https://www.alibabacloud.com/help/en/model-studio/error-code)
- [Pricing Information](https://www.alibabacloud.com/help/en/model-studio/model-pricing)
