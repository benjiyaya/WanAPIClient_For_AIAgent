/**
 * Alibaba Cloud Model Studio - Wan2.6 API Types
 */

// ============================================================================
// Region Configuration
// ============================================================================

export enum Region {
  SINGAPORE = 'singapore',
  VIRGINIA = 'virginia',
  BEIJING = 'beijing',
}

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS: Record<Region, string> = {
  [Region.SINGAPORE]: 'https://dashscope-intl.aliyuncs.com/api/v1',
  [Region.VIRGINIA]: 'https://dashscope-us.aliyuncs.com/api/v1',
  [Region.BEIJING]: 'https://dashscope.aliyuncs.com/api/v1',
};

// ============================================================================
// Image Input Types
// ============================================================================

export interface ImageInput {
  /** URL of the image (publicly accessible) */
  url?: string;
  /** Base64 encoded image string */
  base64?: string;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  image: string; // URL or base64 string
}

export type MessageContent = TextContent | ImageContent;

export interface Message {
  role: 'user';
  content: MessageContent[];
}

// ============================================================================
// API Parameters
// ============================================================================

export interface GenerationParameters {
  /** Negative prompt - content you don't want in the image */
  negative_prompt?: string;
  
  /** Output image resolution */
  size?: string; // e.g., "1K", "2K", "1280*1280", "800*1200"
  
  /** Enable intelligent prompt rewriting (image editing mode only) */
  prompt_extend?: boolean;
  
  /** Add watermark to images */
  watermark?: boolean;
  
  /** Number of images to generate (image editing mode: 1-4, default: 4) */
  n?: number;
  
  /** Maximum images in interleaved mode (1-5, default: 5) */
  max_images?: number;
  
  /** Enable interleaved text-image output mode */
  enable_interleave?: boolean;
  
  /** Random seed for reproducibility (0-2147483647) */
  seed?: number;
  
  /** Enable streaming output */
  stream?: boolean;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface GenerationRequest {
  model: 'wan2.7-image';
  input: {
    messages: Message[];
  };
  parameters?: GenerationParameters;
}

export interface ImageOutput {
  /** URL of the generated image (expires in 24 hours) */
  image: string;
  type: 'image';
}

export interface TextOutput {
  /** Generated text content */
  text: string;
  type: 'text';
}

export type OutputContent = ImageOutput | TextOutput;

export interface Choice {
  finish_reason: string | null;
  message: {
    role: 'assistant';
    content: OutputContent[];
  };
}

export interface Usage {
  image_count: number;
  size: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface GenerationOutput {
  choices: Choice[];
  finished: boolean;
}

export interface SyncGenerationResponse {
  output: GenerationOutput;
  usage: Usage;
  request_id: string;
}

export interface AsyncTaskResponse {
  output: {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN';
  };
  request_id: string;
}

export interface TaskQueryResponse {
  output: {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'UNKNOWN';
    submit_time?: string;
    scheduled_time?: string;
    end_time?: string;
    finished: boolean;
    choices?: Choice[];
  };
  usage?: Usage;
  request_id: string;
  code?: string;
  message?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  request_id: string;
}

export class WanApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public requestId?: string
  ) {
    super(`[${code}] ${message}`);
    this.name = 'WanApiError';
  }
}

// ============================================================================
// Client Configuration
// ============================================================================

export interface WanClientConfig {
  /** Alibaba Cloud API Key */
  apiKey: string;
  
  /** Region to use (default: Singapore) */
  region?: Region;
  
  /** Custom endpoint URL (overrides region setting) */
  endpoint?: string;
  
  /** Request timeout in milliseconds (default: 120000) */
  timeout?: number;
  
  /** Maximum polling attempts for async tasks (default: 60) */
  maxPollingAttempts?: number;
  
  /** Polling interval in milliseconds (default: 5000) */
  pollingInterval?: number;
}

// ============================================================================
// High-Level API Function Types
// ============================================================================

export interface TextToImageOptions {
  /** The prompt describing the desired image */
  prompt: string;
  
  /** Optional negative prompt */
  negativePrompt?: string;
  
  /** Output resolution (default: "1K") */
  size?: string;
  
  /** Number of images to generate (1-4, default: 1 for testing) */
  n?: number;
  
  /** Enable prompt extension (default: true) */
  promptExtend?: boolean;
  
  /** Add watermark (default: false) */
  watermark?: boolean;
  
  /** Random seed for reproducibility */
  seed?: number;
}

export interface ImageEditingOptions {
  /** The editing instruction */
  prompt: string;
  
  /** Reference images (1-4 images) */
  referenceImages: ImageInput[];
  
  /** Optional negative prompt */
  negativePrompt?: string;
  
  /** Output resolution (default: "1K") */
  size?: string;
  
  /** Number of images to generate (1-4, default: 1 for testing) */
  n?: number;
  
  /** Enable prompt extension (default: true) */
  promptExtend?: boolean;
  
  /** Add watermark (default: false) */
  watermark?: boolean;
  
  /** Random seed for reproducibility */
  seed?: number;
}

export interface InteractiveEditingOptions {
  /** The editing instruction */
  prompt: string;
  
  /** Single reference image (optional for pure text-to-image) */
  referenceImage?: ImageInput;
  
  /** Output resolution (default: "1K") */
  size?: string;
  
  /** Add watermark (default: false) */
  watermark?: boolean;
  
  /** Random seed for reproducibility */
  seed?: number;
}

export interface ImageSetOptions {
  /** Description of the image set to generate */
  prompt: string;
  
  /** Maximum number of images in the set (1-5, default: 3) */
  maxImages?: number;
  
  /** Output resolution (default: "1280*1280") */
  size?: string;
  
  /** Add watermark (default: false) */
  watermark?: boolean;
  
  /** Random seed for reproducibility */
  seed?: number;
}

export interface GeneratedImage {
  /** URL of the generated image */
  url: string;
  
  /** Type is always 'image' */
  type: 'image';
}

export interface GeneratedContent {
  /** Generated text (can be empty) */
  text: string;
  
  /** Array of generated images */
  images: GeneratedImage[];
}

export interface GenerationResult {
  /** Request ID for tracking */
  requestId: string;
  
  /** Whether the generation was successful */
  success: boolean;
  
  /** Array of generated content (can be multiple sets) */
  results: GeneratedContent[];
  
  /** Usage statistics */
  usage?: Usage;
  
  /** Error information if failed */
  error?: {
    code: string;
    message: string;
  };
}
