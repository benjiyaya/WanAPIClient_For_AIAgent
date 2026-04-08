/**
 * Alibaba Cloud Model Studio - Video Generation API Types
 *
 * Types for the DashScope video-synthesis endpoint:
 *   POST .../services/aigc/video-generation/video-synthesis
 *
 * Covers Image-to-Video (I2V) and Text-to-Video (T2V) models.
 * See: https://www.alibabacloud.com/help/en/model-studio/image-to-video-api-reference/
 *      https://www.alibabacloud.com/help/en/model-studio/text-to-video-api-reference
 */

// ============================================================================
// API Request Types
// ============================================================================

export interface VideoMediaItem {
  type: 'image' | 'video' | 'first_frame' | 'last_frame' | 'driving_audio' | 'first_clip' | 'reference_image';
  url: string;
}

export interface VideoSynthesisInput {
  /** Text prompt describing the desired video content */
  prompt?: string;
  /** Negative prompt — content to exclude */
  negative_prompt?: string;
  /** First-frame image URL or base64 data URL (wan2.6 and earlier) */
  img_url?: string;
  /** Media array with image/video items (wan2.7+) */
  media?: VideoMediaItem[];
  /** Audio file URL for audio-driven generation (wan2.5/2.6 only) */
  audio_url?: string;
}

export interface VideoSynthesisParameters {
  /** Resolution tier for I2V: '720P' | '1080P' (model-dependent defaults) */
  resolution?: string;
  /** Pixel-exact size for T2V: e.g. '1280*720', '1920*1080' */
  size?: string;
  /** Video duration in seconds */
  duration?: number;
  /** Enable LLM prompt rewriting (default: true) */
  prompt_extend?: boolean;
  /** Add "AI Generated" watermark (default: false) */
  watermark?: boolean;
  /** Random seed for reproducibility [0, 2147483647] */
  seed?: number;
  /** Shot type (wan2.6 only, requires prompt_extend=true) */
  shot_type?: 'single' | 'multi';
  /** Generate audio track — wan2.6-i2v-flash only (default: true) */
  audio?: boolean;
}

export interface VideoSynthesisRequest {
  model: string;
  input: VideoSynthesisInput;
  parameters?: VideoSynthesisParameters;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface VideoTaskCreationResponse {
  output: {
    task_id: string;
    task_status: VideoTaskStatus;
  };
  request_id: string;
  code?: string;
  message?: string;
}

export type VideoTaskStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED'
  | 'UNKNOWN';

export interface VideoTaskQueryResponse {
  output: {
    task_id: string;
    task_status: VideoTaskStatus;
    video_url?: string;
    orig_prompt?: string;
    actual_prompt?: string;
    submit_time?: string;
    scheduled_time?: string;
    end_time?: string;
    code?: string;
    message?: string;
  };
  usage?: VideoUsage;
  request_id: string;
  code?: string;
  message?: string;
}

export interface VideoUsage {
  video_count: number;
  duration: number;
  input_video_duration?: number;
  output_video_duration?: number;
  SR?: number;
  audio?: boolean;
}

// ============================================================================
// High-Level Options
// ============================================================================

export interface ImageToVideoOptions {
  /** Text prompt describing the desired video */
  prompt: string;
  /** First-frame image: public URL or base64 data URL */
  imageUrl: string;
  /** Model name (default: 'wan2.6-i2v-flash') */
  model?: string;
  /** Negative prompt */
  negativePrompt?: string;
  /** Audio file URL */
  audioUrl?: string;
  /** Resolution tier: '720P' | '1080P' (default: '720P') */
  resolution?: string;
  /** Duration in seconds (default: 5) */
  duration?: number;
  /** Enable prompt rewriting (default: true) */
  promptExtend?: boolean;
  /** Add watermark (default: false) */
  watermark?: boolean;
  /** Random seed */
  seed?: number;
  /** Shot type: 'single' | 'multi' (wan2.6 only) */
  shotType?: 'single' | 'multi';
  /** Generate audio — wan2.6-i2v-flash only */
  audio?: boolean;
  /** Progress callback invoked on each poll */
  onProgress?: (status: VideoTaskStatus, taskId: string) => void;
}

export interface TextToVideoOptions {
  /** Text prompt describing the desired video */
  prompt: string;
  /** Model name (default: 'wan2.6-t2v') */
  model?: string;
  /** Negative prompt */
  negativePrompt?: string;
  /** Audio file URL */
  audioUrl?: string;
  /** Video size: e.g. '1280*720', '1920*1080' (default: '1280*720') */
  size?: string;
  /** Duration in seconds (default: 5) */
  duration?: number;
  /** Enable prompt rewriting (default: true) */
  promptExtend?: boolean;
  /** Add watermark (default: false) */
  watermark?: boolean;
  /** Random seed */
  seed?: number;
  /** Shot type: 'single' | 'multi' (wan2.6 only) */
  shotType?: 'single' | 'multi';
  /** Progress callback invoked on each poll */
  onProgress?: (status: VideoTaskStatus, taskId: string) => void;
}

// ============================================================================
// Normalized Result
// ============================================================================

export interface VideoGenerationResult {
  requestId: string;
  taskId: string;
  success: boolean;
  videoUrl: string;
  origPrompt?: string;
  actualPrompt?: string;
  usage?: VideoUsage;
}

// ============================================================================
// Backward-compat re-exports used by existing scripts
// ============================================================================

/** @deprecated Use ImageToVideoOptions instead */
export type VideoFromFirstFrameOptions = ImageToVideoOptions;
/** @deprecated Use ImageToVideoOptions with a lastFrame field instead — not supported by current API */
export interface VideoFromFirstAndLastFramesOptions extends ImageToVideoOptions {
  lastFrame?: { url?: string; base64?: string };
}
/** @deprecated Use TextToVideoOptions or VACE video_extension instead */
export interface VideoContinuationOptions extends TextToVideoOptions {
  video?: { url?: string; base64?: string };
}

export interface VideoInput {
  url?: string;
  base64?: string;
}

export { VideoTaskQueryResponse as VideoQueryResponse };
