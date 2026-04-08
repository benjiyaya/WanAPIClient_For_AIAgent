#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { config } from 'dotenv';
import * as path from 'path';

import { WanClient } from './client';
import { WanVideoClient } from './video-client';
import { WanVideoEditClient } from './video-edit-client';
import { Region } from './types';

config({ path: path.resolve(process.cwd(), '.env') });

function getApiKey(): string {
  const key = process.env.ALICLOUD_API_KEY || process.env.Alicloud_API_Key;
  if (!key) throw new Error('ALICLOUD_API_KEY not set in environment or .env');
  return key;
}

function resolveRegion(r?: string): Region {
  const map: Record<string, Region> = {
    singapore: Region.SINGAPORE,
    virginia: Region.VIRGINIA,
    beijing: Region.BEIJING,
  };
  return map[r || 'singapore'] || Region.SINGAPORE;
}

const IMAGE_SIZES = [
  '1280*720',
  '720*1280',
  '1280*1280',
  '1280*960',
  '800*1200',
] as const;

const server = new McpServer({
  name: 'wan-apiclient',
  version: '2.0.0',
});

// ─── Tool 1: text_to_image ──────────────────────────────────────────────────

server.tool(
  'text_to_image',
  'Generate images from a text prompt using the wan2.7-image model',
  {
    prompt: z.string().describe('Text prompt describing the desired image'),
    size: z.enum(IMAGE_SIZES).default('1280*1280').describe('Output resolution'),
    n: z.number().int().min(1).max(4).default(1).describe('Number of images to generate (1-4)'),
    negativePrompt: z.string().optional().describe('Content to exclude from generation'),
    promptExtend: z.boolean().default(true).describe('Enable LLM prompt rewriting for better results'),
    watermark: z.boolean().default(false).describe('Add AI-generated watermark'),
    seed: z.number().int().optional().describe('Random seed for reproducibility'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanClient({ apiKey: getApiKey(), region: resolveRegion(args.region) });
    const result = await client.textToImage({
      prompt: args.prompt,
      size: args.size,
      n: args.n,
      negativePrompt: args.negativePrompt,
      promptExtend: args.promptExtend,
      watermark: args.watermark,
      seed: args.seed,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Tool 2: image_editing ──────────────────────────────────────────────────

server.tool(
  'image_editing',
  'Edit images using 1-4 reference images and a text prompt (wan2.7-image)',
  {
    prompt: z.string().describe('Editing instruction'),
    referenceImages: z.array(z.object({
      url: z.string().optional(),
      base64: z.string().optional(),
    })).min(1).max(4).describe('1-4 reference images (each with url or base64)'),
    size: z.enum(IMAGE_SIZES).default('1280*1280').describe('Output resolution'),
    n: z.number().int().min(1).max(4).default(1).describe('Number of output images'),
    negativePrompt: z.string().optional().describe('Content to exclude'),
    promptExtend: z.boolean().default(true).describe('Enable LLM prompt rewriting'),
    watermark: z.boolean().default(false).describe('Add watermark'),
    seed: z.number().int().optional().describe('Random seed'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanClient({ apiKey: getApiKey(), region: resolveRegion(args.region) });
    const result = await client.imageEditing({
      prompt: args.prompt,
      referenceImages: args.referenceImages,
      size: args.size,
      n: args.n,
      negativePrompt: args.negativePrompt,
      promptExtend: args.promptExtend,
      watermark: args.watermark,
      seed: args.seed,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Tool 3: interactive_editing ────────────────────────────────────────────

server.tool(
  'interactive_editing',
  'Edit an image with 0-1 reference images and a text prompt (wan2.7-image)',
  {
    prompt: z.string().describe('Editing instruction'),
    referenceImage: z.object({
      url: z.string().optional(),
      base64: z.string().optional(),
    }).optional().describe('Optional single reference image'),
    size: z.enum(IMAGE_SIZES).default('1280*1280').describe('Output resolution'),
    watermark: z.boolean().default(false).describe('Add watermark'),
    seed: z.number().int().optional().describe('Random seed'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanClient({ apiKey: getApiKey(), region: resolveRegion(args.region) });
    const result = await client.interactiveEditing({
      prompt: args.prompt,
      referenceImage: args.referenceImage,
      size: args.size,
      watermark: args.watermark,
      seed: args.seed,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Tool 4: image_set ──────────────────────────────────────────────────────

server.tool(
  'image_set',
  'Generate a set of related images (tutorials, comics, storyboards) using wan2.7-image',
  {
    prompt: z.string().describe('Description of the image set to generate'),
    maxImages: z.number().int().min(1).max(5).default(3).describe('Maximum number of images (1-5)'),
    size: z.enum(IMAGE_SIZES).default('1280*1280').describe('Output resolution'),
    watermark: z.boolean().default(false).describe('Add watermark'),
    seed: z.number().int().optional().describe('Random seed'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanClient({ apiKey: getApiKey(), region: resolveRegion(args.region) });
    const result = await client.imageSet({
      prompt: args.prompt,
      maxImages: args.maxImages,
      size: args.size,
      watermark: args.watermark,
      seed: args.seed,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Tool 5: image_to_video ─────────────────────────────────────────────────

server.tool(
  'image_to_video',
  'Generate a video from a first-frame image and text prompt (wan2.7-i2v). Video generation is asynchronous and may take 2-30 minutes depending on duration.',
  {
    prompt: z.string().describe('Text prompt describing the desired video motion'),
    imageUrl: z.string().describe('First-frame image: public URL, base64 data URL, or local file path'),
    model: z.string().default('wan2.7-i2v').describe('Model name'),
    resolution: z.enum(['720P', '1080P']).default('720P').describe('Output resolution'),
    duration: z.number().int().min(5).max(15).default(5).describe('Duration in seconds'),
    negativePrompt: z.string().optional().describe('Content to exclude'),
    promptExtend: z.boolean().default(false).describe('Enable LLM prompt rewriting (default false for I2V)'),
    watermark: z.boolean().default(false).describe('Add watermark'),
    seed: z.number().int().optional().describe('Random seed'),
    shotType: z.enum(['single', 'multi']).optional().describe('Shot type'),
    audio: z.boolean().optional().describe('Generate audio track'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanVideoClient({
      apiKey: getApiKey(),
      region: resolveRegion(args.region),
      videoTimeout: 600000,
      pollingInterval: 15000,
      maxPollingAttempts: 200,
    });
    const result = await client.imageToVideo({
      prompt: args.prompt,
      imageUrl: args.imageUrl,
      model: args.model,
      resolution: args.resolution,
      duration: args.duration,
      negativePrompt: args.negativePrompt,
      promptExtend: args.promptExtend,
      watermark: args.watermark,
      seed: args.seed,
      shotType: args.shotType,
      audio: args.audio,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Tool 6: text_to_video ──────────────────────────────────────────────────

server.tool(
  'text_to_video',
  'Generate a video from a text prompt only (wan2.7-t2v). Video generation is asynchronous and may take 2-30 minutes depending on duration.',
  {
    prompt: z.string().describe('Text prompt describing the desired video'),
    model: z.string().default('wan2.7-t2v').describe('Model name'),
    size: z.string().default('1280*720').describe('Video pixel dimensions (e.g. 1280*720, 1920*1080)'),
    duration: z.number().int().min(5).max(15).default(5).describe('Duration in seconds'),
    negativePrompt: z.string().optional().describe('Content to exclude'),
    promptExtend: z.boolean().default(true).describe('Enable LLM prompt rewriting'),
    watermark: z.boolean().default(false).describe('Add watermark'),
    seed: z.number().int().optional().describe('Random seed'),
    shotType: z.enum(['single', 'multi']).optional().describe('Shot type'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanVideoClient({
      apiKey: getApiKey(),
      region: resolveRegion(args.region),
      videoTimeout: 600000,
      pollingInterval: 15000,
      maxPollingAttempts: 200,
    });
    const result = await client.textToVideo({
      prompt: args.prompt,
      model: args.model,
      size: args.size,
      duration: args.duration,
      negativePrompt: args.negativePrompt,
      promptExtend: args.promptExtend,
      watermark: args.watermark,
      seed: args.seed,
      shotType: args.shotType,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Tool 7: video_style_modification ───────────────────────────────────────

server.tool(
  'video_style_modification',
  'Change the visual style of a video using a text prompt (wan2.7-videoedit). No reference images needed. Async — may take several minutes.',
  {
    prompt: z.string().describe('Description of the desired style change (e.g. "Convert to claymation style")'),
    videoUrl: z.string().describe('Public URL of the input video (MP4/MOV, 2-10s, up to 100MB)'),
    model: z.string().default('wan2.7-videoedit').describe('Model name'),
    resolution: z.enum(['720P', '1080P']).default('1080P').describe('Output resolution'),
    ratio: z.enum(['16:9', '9:16', '1:1', '4:3', '3:4']).optional().describe('Output aspect ratio (omit to match input)'),
    duration: z.number().int().min(2).max(10).optional().describe('Output duration in seconds (2-10). Omit to keep input duration.'),
    audioSetting: z.enum(['auto', 'origin']).default('auto').describe('Audio setting'),
    negativePrompt: z.string().optional().describe('Content to exclude'),
    promptExtend: z.boolean().default(true).describe('Enable LLM prompt rewriting'),
    watermark: z.boolean().default(false).describe('Add watermark'),
    seed: z.number().int().optional().describe('Random seed'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanVideoEditClient({
      apiKey: getApiKey(),
      region: resolveRegion(args.region),
      videoEditTimeout: 600000,
      pollingInterval: 15000,
      maxPollingAttempts: 200,
    });
    const result = await client.videoStyleModification({
      prompt: args.prompt,
      videoUrl: args.videoUrl,
      model: args.model,
      resolution: args.resolution,
      ratio: args.ratio,
      duration: args.duration,
      audioSetting: args.audioSetting,
      negativePrompt: args.negativePrompt,
      promptExtend: args.promptExtend,
      watermark: args.watermark,
      seed: args.seed,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Tool 8: video_edit ─────────────────────────────────────────────────────

server.tool(
  'video_edit',
  'Edit a video using 1-3 reference images and a text prompt (wan2.7-videoedit). Async — may take several minutes.',
  {
    prompt: z.string().describe('Description of the edit (e.g. "Replace clothes with the outfit in the reference image")'),
    videoUrl: z.string().describe('Public URL of the input video (MP4/MOV, 2-10s, up to 100MB)'),
    referenceImageUrls: z.array(z.string()).min(1).max(3).describe('1-3 reference image URLs'),
    model: z.string().default('wan2.7-videoedit').describe('Model name'),
    resolution: z.enum(['720P', '1080P']).default('1080P').describe('Output resolution'),
    ratio: z.enum(['16:9', '9:16', '1:1', '4:3', '3:4']).optional().describe('Output aspect ratio'),
    duration: z.number().int().min(2).max(10).optional().describe('Output duration in seconds (2-10)'),
    audioSetting: z.enum(['auto', 'origin']).default('auto').describe('Audio setting'),
    negativePrompt: z.string().optional().describe('Content to exclude'),
    promptExtend: z.boolean().default(true).describe('Enable LLM prompt rewriting'),
    watermark: z.boolean().default(false).describe('Add watermark'),
    seed: z.number().int().optional().describe('Random seed'),
    region: z.enum(['singapore', 'virginia', 'beijing']).default('singapore').describe('API region'),
  },
  async (args) => {
    const client = new WanVideoEditClient({
      apiKey: getApiKey(),
      region: resolveRegion(args.region),
      videoEditTimeout: 600000,
      pollingInterval: 15000,
      maxPollingAttempts: 200,
    });
    const result = await client.videoEdit({
      prompt: args.prompt,
      videoUrl: args.videoUrl,
      referenceImageUrls: args.referenceImageUrls,
      model: args.model,
      resolution: args.resolution,
      ratio: args.ratio,
      duration: args.duration,
      audioSetting: args.audioSetting,
      negativePrompt: args.negativePrompt,
      promptExtend: args.promptExtend,
      watermark: args.watermark,
      seed: args.seed,
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
);

// ─── Start ──────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
