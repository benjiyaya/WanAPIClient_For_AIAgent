/**
 * Alibaba Cloud Model Studio - Video Generation Client
 *
 * Wraps the DashScope video-synthesis endpoint for:
 *   - Image-to-Video (I2V) generation
 *   - Text-to-Video (T2V) generation
 *
 * All operations are asynchronous (create task → poll for result).
 *
 * API docs:
 *   https://www.alibabacloud.com/help/en/model-studio/image-to-video-api-reference/
 *   https://www.alibabacloud.com/help/en/model-studio/text-to-video-api-reference
 */

import * as fs from 'fs';
import * as path from 'path';
import { WanClient } from './client';
import { WanApiError, WanClientConfig } from './types';
import {
  VideoSynthesisRequest,
  VideoSynthesisInput,
  VideoSynthesisParameters,
  VideoTaskCreationResponse,
  VideoTaskQueryResponse,
  VideoTaskStatus,
  VideoGenerationResult,
  ImageToVideoOptions,
  TextToVideoOptions,
} from './video-types';

const VIDEO_SYNTHESIS_PATH = '/services/aigc/video-generation/video-synthesis';

const DEFAULT_I2V_MODEL = 'wan2.7-i2v';
const DEFAULT_T2V_MODEL = 'wan2.7-t2v';

export class WanVideoClient extends WanClient {
  private videoTimeout: number;
  private videoPollingInterval: number;
  private videoMaxPollingAttempts: number;

  constructor(config: WanClientConfig & {
    videoTimeout?: number;
  }) {
    super(config);
    this.videoTimeout = config.videoTimeout || 300000;
    this.videoPollingInterval = config.pollingInterval || 15000;
    this.videoMaxPollingAttempts = config.maxPollingAttempts || 80;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Image-to-Video generation.
   *
   * Accepts a first-frame image (public URL, base64 data URL, or local file
   * path) and a text prompt, returning the URL of the generated video.
   *
   * @example
   * ```typescript
   * const result = await client.imageToVideo({
   *   prompt: 'A cat running on the grass',
   *   imageUrl: 'https://example.com/cat.png',
   *   resolution: '720P',
   *   duration: 5,
   * });
   * console.log(result.videoUrl);
   * ```
   */
  async imageToVideo(options: ImageToVideoOptions): Promise<VideoGenerationResult> {
    const imgUrl = this.resolveImageUrl(options.imageUrl);
    const model = options.model || DEFAULT_I2V_MODEL;
    const isWan27 = model.startsWith('wan2.7');

    const input: VideoSynthesisInput = {
      prompt: options.prompt,
      ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
    };

    if (isWan27) {
      input.media = [{ type: 'first_frame', url: imgUrl }];
    } else {
      input.img_url = imgUrl;
      if (options.audioUrl) input.audio_url = options.audioUrl;
    }

    const request: VideoSynthesisRequest = {
      model,
      input,
      parameters: {
        resolution: options.resolution || '720P',
        duration: options.duration ?? 5,
        prompt_extend: options.promptExtend !== false,
        watermark: options.watermark || false,
        ...(options.seed != null && { seed: options.seed }),
        ...(options.shotType && { shot_type: options.shotType }),
        ...(options.audio != null && { audio: options.audio }),
      },
    };

    return this.executeVideoTask(request, options.onProgress);
  }

  /**
   * Text-to-Video generation.
   *
   * Generates a video from a text prompt alone (no input image).
   *
   * @example
   * ```typescript
   * const result = await client.textToVideo({
   *   prompt: 'A kitten running in the moonlight',
   *   size: '1280*720',
   *   duration: 5,
   * });
   * console.log(result.videoUrl);
   * ```
   */
  async textToVideo(options: TextToVideoOptions): Promise<VideoGenerationResult> {
    const request: VideoSynthesisRequest = {
      model: options.model || DEFAULT_T2V_MODEL,
      input: {
        prompt: options.prompt,
        ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
        ...(options.audioUrl && { audio_url: options.audioUrl }),
      },
      parameters: {
        size: options.size || '1280*720',
        duration: options.duration ?? 5,
        prompt_extend: options.promptExtend !== false,
        watermark: options.watermark || false,
        ...(options.seed != null && { seed: options.seed }),
        ...(options.shotType && { shot_type: options.shotType }),
      },
    };

    return this.executeVideoTask(request, options.onProgress);
  }

  /**
   * Backward-compatible alias for imageToVideo.
   * Adapts the old VideoFromFirstFrameOptions shape.
   */
  async videoFromFirstFrame(
    options: ImageToVideoOptions & { firstFrame?: { url?: string; base64?: string } },
    onProgress?: (status: string, progress?: number) => void,
  ): Promise<VideoGenerationResult> {
    const imageUrl =
      options.imageUrl ||
      options.firstFrame?.url ||
      options.firstFrame?.base64 ||
      '';

    const wrappedProgress = onProgress
      ? (status: VideoTaskStatus, _taskId: string) => onProgress(status, undefined)
      : options.onProgress;

    return this.imageToVideo({
      ...options,
      imageUrl,
      onProgress: wrappedProgress,
    });
  }

  /**
   * Query an existing video task.
   */
  async queryVideoTask(taskId: string): Promise<VideoTaskQueryResponse> {
    try {
      const response = await this.client.get<VideoTaskQueryResponse>(
        `/tasks/${taskId}`,
        { timeout: this.videoTimeout },
      );
      return response.data;
    } catch (error) {
      throw this.extractError(error);
    }
  }

  /**
   * Poll until a video task reaches a terminal state.
   */
  async waitForVideoTask(
    taskId: string,
    onProgress?: (status: VideoTaskStatus, taskId: string) => void,
  ): Promise<VideoTaskQueryResponse> {
    let attempts = 0;

    while (attempts < this.videoMaxPollingAttempts) {
      const result = await this.queryVideoTask(taskId);
      const status = result.output.task_status;

      if (onProgress) onProgress(status, taskId);

      if (status === 'SUCCEEDED') return result;

      if (status === 'FAILED') {
        const msg =
          result.output.message || result.message || 'Unknown error';
        throw new WanApiError('TaskFailed', `Video generation failed: ${msg}`);
      }
      if (status === 'CANCELED') {
        throw new WanApiError('TaskCanceled', 'Video generation was canceled');
      }

      await this.sleep(this.videoPollingInterval);
      attempts++;
    }

    const totalSec = (this.videoMaxPollingAttempts * this.videoPollingInterval) / 1000;
    throw new WanApiError('Timeout', `Video task polling timed out after ${totalSec}s`);
  }

  /**
   * Quick connectivity test — makes a minimal I2V request that will fail
   * with InvalidParameter (not auth error) if the key is valid.
   */
  async testVideo(): Promise<boolean> {
    try {
      await this.queryVideoTask('test-nonexistent-task');
      return true;
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Submit a video-synthesis task and poll to completion.
   */
  private async executeVideoTask(
    request: VideoSynthesisRequest,
    onProgress?: (status: VideoTaskStatus, taskId: string) => void,
  ): Promise<VideoGenerationResult> {
    try {
      const taskId = await this.createVideoTask(request);
      const result = await this.waitForVideoTask(taskId, onProgress);
      return this.normalizeResult(result);
    } catch (error) {
      if (error instanceof WanApiError) throw error;
      throw this.extractError(error);
    }
  }

  /**
   * POST to video-synthesis with X-DashScope-Async header.
   */
  private async createVideoTask(request: VideoSynthesisRequest): Promise<string> {
    const response = await this.client.post<VideoTaskCreationResponse>(
      VIDEO_SYNTHESIS_PATH,
      request,
      {
        headers: { 'X-DashScope-Async': 'enable' },
        timeout: this.videoTimeout,
      },
    );

    const { task_id, task_status } = response.data.output;
    if (task_status === 'PENDING' || task_status === 'RUNNING') {
      return task_id;
    }

    throw new WanApiError(
      'TaskCreationFailed',
      `Task creation returned status: ${task_status}`,
    );
  }

  /**
   * Convert a VideoTaskQueryResponse into the normalized result shape.
   */
  private normalizeResult(raw: VideoTaskQueryResponse): VideoGenerationResult {
    return {
      requestId: raw.request_id,
      taskId: raw.output.task_id,
      success: raw.output.task_status === 'SUCCEEDED',
      videoUrl: raw.output.video_url || '',
      origPrompt: raw.output.orig_prompt,
      actualPrompt: raw.output.actual_prompt,
      usage: raw.usage,
    };
  }

  /**
   * Resolve an image reference to a value the API accepts.
   *
   * - http(s) URLs pass through unchanged.
   * - data: URLs (base64) pass through unchanged.
   * - Anything else is treated as a local file path and converted to a base64
   *   data URL.
   */
  protected resolveImageUrl(input: string): string {
    if (!input) return '';
    if (input.startsWith('http://') || input.startsWith('https://')) return input;
    if (input.startsWith('data:')) return input;

    // Treat as local file path
    const resolved = path.resolve(input);
    if (!fs.existsSync(resolved)) {
      throw new WanApiError('InvalidInput', `Image file not found: ${resolved}`);
    }

    const ext = path.extname(resolved).toLowerCase().replace('.', '');
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      bmp: 'image/bmp',
      webp: 'image/webp',
    };
    const mime = mimeMap[ext] || 'image/png';
    const b64 = fs.readFileSync(resolved).toString('base64');
    return `data:${mime};base64,${b64}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default WanVideoClient;
