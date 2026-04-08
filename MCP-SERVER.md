# WanAPIClient — MCP Server

Model Context Protocol (MCP) server that exposes all Alibaba Cloud Model Studio (DashScope) Wan 2.7 image and video generation capabilities as tools for MCP-compatible clients (Kilo, Claude Desktop, Cursor, Windsurf, etc.).

---

## Prerequisites

- Node.js v18+
- Alibaba Cloud Model Studio API key
- Built project (`npm run build`)

---

## Quick Start

### 1. Install and build

```bash
cd E:\Alibaba_WanAI\Wan2.7APIClient
npm install
npm run build
```

### 2. Set your API key

Create a `.env` file in the project root:

```
ALICLOUD_API_KEY=sk-your-api-key-here
```

Or pass it via the `env` field in your MCP client config (see below).

### 3. Configure your MCP client

Add the server to your MCP client configuration. The entry point is `dist/mcp-server.js`.

#### Kilo (`kilo.json`)

```json
{
  "mcpServers": {
    "wan-apiclient": {
      "command": "node",
      "args": ["E:\\Alibaba_WanAI\\Wan2.7APIClient\\dist\\mcp-server.js"],
      "env": {
        "ALICLOUD_API_KEY": "sk-your-api-key-here"
      }
    }
  }
}
```

#### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "wan-apiclient": {
      "command": "node",
      "args": ["E:\\Alibaba_WanAI\\Wan2.7APIClient\\dist\\mcp-server.js"],
      "env": {
        "ALICLOUD_API_KEY": "sk-your-api-key-here"
      }
    }
  }
}
```

#### Cursor / Windsurf (`.cursor/mcp.json` or equivalent)

```json
{
  "mcpServers": {
    "wan-apiclient": {
      "command": "node",
      "args": ["E:\\Alibaba_WanAI\\Wan2.7APIClient\\dist\\mcp-server.js"],
      "env": {
        "ALICLOUD_API_KEY": "sk-your-api-key-here"
      }
    }
  }
}
```

> **Tip:** If you have a `.env` file in the project root with `ALICLOUD_API_KEY`, you can omit the `env` block — the server reads it automatically using dotenv.

### 4. Restart your MCP client

After adding the config, restart the client so it discovers the new server and tools.

---

## Available Tools

The server exposes 8 tools, organized by model capability:

### Image Generation (wan2.7-image)

| # | Tool Name | Description |
|---|-----------|-------------|
| 1 | `text_to_image` | Generate images from a text prompt |
| 2 | `image_editing` | Edit images using 1-4 reference images + prompt |
| 3 | `interactive_editing` | Edit with 0-1 reference images + prompt |
| 4 | `image_set` | Generate a set of related images (tutorials, comics) |

### Video Generation (wan2.7-i2v / wan2.7-t2v)

| # | Tool Name | Description |
|---|-----------|-------------|
| 5 | `image_to_video` | Generate video from a first-frame image + prompt |
| 6 | `text_to_video` | Generate video from a text prompt only |

### Video Editing (wan2.7-videoedit)

| # | Tool Name | Description |
|---|-----------|-------------|
| 7 | `video_style_modification` | Restyle a video using a text prompt |
| 8 | `video_edit` | Edit a video with 1-3 reference images + prompt |

---

## Tool Parameters

### Common Parameters

Every tool accepts these optional parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `region` | `"singapore"` \| `"virginia"` \| `"beijing"` | `"singapore"` | API region endpoint |
| `seed` | integer | — | Random seed for reproducibility |
| `negativePrompt` | string | — | Content to exclude from generation |
| `promptExtend` | boolean | varies | Enable LLM prompt rewriting for better results |
| `watermark` | boolean | `false` | Add "AI Generated" watermark |

---

### `text_to_image`

Generate images from a text prompt.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Text prompt describing the desired image |
| `size` | enum | No | `"1280*1280"` | Output resolution |
| `n` | integer | No | `1` | Number of images (1-4) |

**Size options:** `1280*720` (16:9), `720*1280` (9:16), `1280*1280` (1:1), `1280*960` (4:3), `800*1200` (2:3)

**Example prompt for your AI assistant:**

> "Generate an image of a sunset over Seoul using the text_to_image tool with size 1280*720"

---

### `image_editing`

Edit images using 1-4 reference images and a text prompt.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Editing instruction |
| `referenceImages` | array | Yes | — | 1-4 images, each with `url` or `base64` |
| `size` | enum | No | `"1280*1280"` | Output resolution |
| `n` | integer | No | `1` | Number of output images (1-4) |

**Example:**

> "Use the image_editing tool with prompt 'Transform into an oil painting style' and reference image url 'https://example.com/photo.jpg'"

---

### `interactive_editing`

Edit with 0-1 reference images. Good for single-image transforms.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Editing instruction |
| `referenceImage` | object | No | — | Single reference image with `url` or `base64` |
| `size` | enum | No | `"1280*1280"` | Output resolution |

---

### `image_set`

Generate a set of related images (tutorials, comics, storyboards).

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Description of the image set |
| `maxImages` | integer | No | `3` | Number of images (1-5) |
| `size` | enum | No | `"1280*1280"` | Output resolution |

---

### `image_to_video`

Generate a video from a first-frame image and text prompt. **Asynchronous — takes 2-30 minutes depending on duration.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Text prompt describing the desired video motion |
| `imageUrl` | string | Yes | — | First-frame image: URL, base64, or local file path |
| `model` | string | No | `"wan2.7-i2v"` | Model name |
| `resolution` | `"720P"` \| `"1080P"` | No | `"720P"` | Output resolution |
| `duration` | integer | No | `5` | Duration in seconds (5-15) |
| `shotType` | `"single"` \| `"multi"` | No | — | Shot type |
| `audio` | boolean | No | — | Generate audio track |

**Example:**

> "Generate a 10-second video from this image using image_to_video with prompt 'Camera slowly pushes in' and imageUrl 'https://example.com/scene.png', duration 10, resolution 720P"

---

### `text_to_video`

Generate a video from a text prompt only. **Asynchronous — takes 2-30 minutes.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Text prompt describing the desired video |
| `model` | string | No | `"wan2.7-t2v"` | Model name |
| `size` | string | No | `"1280*720"` | Video pixel dimensions |
| `duration` | integer | No | `5` | Duration in seconds (5-15) |
| `shotType` | `"single"` \| `"multi"` | No | — | Shot type |

**Example:**

> "Create a 5-second video of a kitten playing in moonlight using text_to_video"

---

### `video_style_modification`

Change the visual style of a video. No reference images needed. **Asynchronous — may take several minutes.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Description of the style change |
| `videoUrl` | string | Yes | — | Input video URL (MP4/MOV, 2-10s, up to 100MB) |
| `resolution` | `"720P"` \| `"1080P"` | No | `"1080P"` | Output resolution |
| `ratio` | enum | No | — | Aspect ratio: `16:9`, `9:16`, `1:1`, `4:3`, `3:4` |
| `duration` | integer | No | — | Output duration (2-10s). Omit to keep input. |
| `audioSetting` | `"auto"` \| `"origin"` | No | `"auto"` | Audio behavior |

---

### `video_edit`

Edit a video with 1-3 reference images. **Asynchronous — may take several minutes.**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | — | Description of the edit |
| `videoUrl` | string | Yes | — | Input video URL |
| `referenceImageUrls` | string[] | Yes | — | 1-3 reference image URLs |
| `resolution` | `"720P"` \| `"1080P"` | No | `"1080P"` | Output resolution |
| `ratio` | enum | No | — | Aspect ratio: `16:9`, `9:16`, `1:1`, `4:3`, `3:4` |
| `duration` | integer | No | — | Output duration (2-10s) |
| `audioSetting` | `"auto"` \| `"origin"` | No | `"auto"` | Audio behavior |

---

## Response Format

All tools return a JSON result. Examples:

### Image response

```json
{
  "requestId": "req-abc123",
  "success": true,
  "results": [
    {
      "text": "",
      "images": [
        {
          "url": "https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/...",
          "type": "image"
        }
      ]
    }
  ],
  "usage": {
    "image_count": 1,
    "size": "1280*720"
  }
}
```

### Video response

```json
{
  "requestId": "req-xyz789",
  "taskId": "task-def456",
  "success": true,
  "videoUrl": "https://dashscope-result-bj.oss-cn-beijing.aliyuncs.com/...",
  "origPrompt": "A kitten playing in moonlight",
  "actualPrompt": "A fluffy kitten playfully batting at moondust sparkles..."
}
```

> **Note:** Image and video URLs expire after 24 hours. Download them promptly if you need to keep the files.

---

## Region Endpoints

| Region | Endpoint |
|--------|----------|
| `singapore` | `https://dashscope-intl.aliyuncs.com/api/v1` |
| `virginia` | `https://dashscope-us.aliyuncs.com/api/v1` |
| `beijing` | `https://dashscope.aliyuncs.com/api/v1` |

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

The MCP server polls automatically until video tasks complete — the tool call will block until the result is ready. Ensure your MCP client has sufficient timeout settings for video operations.

---

## Running Manually

For testing or debugging, you can start the server directly:

```bash
# Using npm script
npm run mcp

# Or directly
node dist/mcp-server.js
```

The server communicates over stdio (stdin/stdout) using the MCP JSON-RPC protocol. It is not an HTTP server.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "ALICLOUD_API_KEY not set" | Add the key to `.env` or the `env` block in your MCP client config |
| Tool call times out on video | Increase your MCP client's tool timeout (video generation can take 30+ minutes) |
| "InvalidParameter" errors | Check that required parameters are provided and enum values are valid |
| Server not appearing in client | Restart the MCP client after config changes; verify the path to `dist/mcp-server.js` is correct |
| Build errors | Run `npm install && npm run build` to ensure dependencies and compiled output are up to date |

---

## Architecture

```
MCP Client (Kilo, Claude Desktop, Cursor, etc.)
    │
    │  stdio (JSON-RPC)
    ▼
src/mcp-server.ts          ← MCP server entry point
    │
    ├── WanClient           ← Image generation (wan2.7-image)
    ├── WanVideoClient      ← Video generation (wan2.7-i2v, wan2.7-t2v)
    └── WanVideoEditClient  ← Video editing (wan2.7-videoedit)
```

The MCP server reuses the same client classes as the CLI. Each tool handler instantiates the appropriate client, calls the method, and returns the JSON result.
