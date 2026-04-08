/**
 * Alibaba Cloud Model Studio - Wan 2.7 Video Editing API Types
 *
 * Model: wan2.7-videoedit
 * Endpoint: POST .../services/aigc/video-generation/video-synthesis
 *
 * Capabilities:
 *   - Video style modification (video + prompt)
 *   - Video editing with reference images (video + images + prompt)
 *
 * See: https://www.alibabacloud.com/help/en/model-studio/wan-video-editing-api-reference
 */

import { VideoTaskStatus, VideoUsage, VideoTaskQueryResponse } from './video-types';

// ============================================================================
// Media input types
// ============================================================================

export type VideoEditMediaType = 'video' | 'reference_image';

export interface VideoEditMediaItem {
  /** 'video' (required, exactly one) or 'reference_image' (optional, up to 3) */
  type: VideoEditMediaType;
  /** Public URL of the media asset */
  url: string;
}

// ============================================================================
// Request types
// ============================================================================

export interface VideoEditRequestInput {
  /** Text prompt describing the edit */
  prompt?: string;
  /** Negative prompt — content to exclude */
  negative_prompt?: string;
  /** Media array: one video (required) + up to 3 reference images (optional) */
  media: VideoEditMediaItem[];
}

export interface VideoEditRequestParameters {
  /** Resolution tier: '720P' | '1080P' (default: '1080P') */
  resolution?: string;
  /** Output aspect ratio. Omit to match input video. */
  ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  /** Duration in seconds (2-10). 0 or omit = keep input video duration. */
  duration?: number;
  /** Audio setting: 'auto' | 'origin' (default: 'auto') */
  audio_setting?: 'auto' | 'origin';
  /** Enable LLM prompt rewriting (default: true) */
  prompt_extend?: boolean;
  /** Add "AI Generated" watermark (default: false) */
  watermark?: boolean;
  /** Random seed [0, 2147483647] */
  seed?: number;
}

export interface VideoEditRequest {
  model: string;
  input: VideoEditRequestInput;
  parameters?: VideoEditRequestParameters;
}

// ============================================================================
// High-level options
// ============================================================================

export interface VideoStyleModificationOptions {
  /** Prompt describing the style change (e.g. "Convert to claymation style") */
  prompt: string;
  /** Public URL of the input video (MP4/MOV, 2-10s, up to 100 MB) */
  videoUrl: string;
  /** Negative prompt */
  negativePrompt?: string;
  /** Model override (default: 'wan2.7-videoedit') */
  model?: string;
  /** Resolution: '720P' | '1080P' (default: '1080P') */
  resolution?: string;
  /** Output aspect ratio — omit to match input */
  ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  /** Output duration in seconds (2-10). Omit to keep input duration. */
  duration?: number;
  /** Audio: 'auto' | 'origin' (default: 'auto') */
  audioSetting?: 'auto' | 'origin';
  /** Enable prompt rewriting (default: true) */
  promptExtend?: boolean;
  /** Add watermark (default: false) */
  watermark?: boolean;
  /** Random seed */
  seed?: number;
  /** Progress callback */
  onProgress?: (status: VideoTaskStatus, taskId: string) => void;
}

export interface VideoEditOptions {
  /** Prompt describing the edit (e.g. "Replace clothes with the outfit in the image") */
  prompt: string;
  /** Public URL of the input video (MP4/MOV, 2-10s, up to 100 MB) */
  videoUrl: string;
  /** 1-3 reference image URLs used for the edit */
  referenceImageUrls: string[];
  /** Negative prompt */
  negativePrompt?: string;
  /** Model override (default: 'wan2.7-videoedit') */
  model?: string;
  /** Resolution: '720P' | '1080P' (default: '1080P') */
  resolution?: string;
  /** Output aspect ratio — omit to match input */
  ratio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
  /** Output duration in seconds (2-10). Omit to keep input duration. */
  duration?: number;
  /** Audio: 'auto' | 'origin' (default: 'auto') */
  audioSetting?: 'auto' | 'origin';
  /** Enable prompt rewriting (default: true) */
  promptExtend?: boolean;
  /** Add watermark (default: false) */
  watermark?: boolean;
  /** Random seed */
  seed?: number;
  /** Progress callback */
  onProgress?: (status: VideoTaskStatus, taskId: string) => void;
}

// ============================================================================
// Re-exports
// ============================================================================

export type { VideoTaskQueryResponse as VideoEditQueryResponse };
export type { VideoUsage as VideoEditUsage };
