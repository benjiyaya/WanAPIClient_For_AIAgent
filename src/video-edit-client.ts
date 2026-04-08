/**
 * Alibaba Cloud Model Studio - Wan 2.7 Video Editing Client
 *
 * Model: wan2.7-videoedit
 * Endpoint: POST .../services/aigc/video-generation/video-synthesis
 *
 * Two capabilities:
 *   1. videoStyleModification — change style of a video via prompt
 *   2. videoEdit — edit a video using reference images + prompt
 *
 * See: https://www.alibabacloud.com/help/en/model-studio/wan-video-editing-api-reference
 */

import { WanVideoClient } from './video-client';
import { WanApiError, WanClientConfig } from './types';
import {
  VideoTaskCreationResponse,
  VideoTaskStatus,
  VideoGenerationResult,
} from './video-types';
import {
  VideoEditRequest,
  VideoEditMediaItem,
  VideoStyleModificationOptions,
  VideoEditOptions,
} from './video-edit-types';

const VIDEO_SYNTHESIS_PATH = '/services/aigc/video-generation/video-synthesis';
const DEFAULT_MODEL = 'wan2.7-videoedit';

export class WanVideoEditClient extends WanVideoClient {
  private editTimeout: number;

  constructor(config: WanClientConfig & {
    videoTimeout?: number;
    videoEditTimeout?: number;
  }) {
    super(config);
    this.editTimeout = config.videoEditTimeout || config.videoTimeout || 600000;
  }

  /**
   * Video style modification.
   *
   * Takes a video and a prompt describing the desired style change.
   * No reference images needed.
   *
   * @example
   * ```typescript
   * const result = await client.videoStyleModification({
   *   prompt: 'Convert the entire scene to a claymation style',
   *   videoUrl: 'https://example.com/input.mp4',
   *   resolution: '720P',
   * });
   * console.log(result.videoUrl);
   * ```
   */
  async videoStyleModification(options: VideoStyleModificationOptions): Promise<VideoGenerationResult> {
    if (!options.videoUrl) {
      throw new WanApiError('InvalidInput', 'videoUrl is required');
    }

    const media: VideoEditMediaItem[] = [
      { type: 'video', url: options.videoUrl },
    ];

    const request: VideoEditRequest = {
      model: options.model || DEFAULT_MODEL,
      input: {
        prompt: options.prompt,
        ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
        media,
      },
      parameters: this.buildParams(options),
    };

    return this.executeEditTask(request, options.onProgress);
  }

  /**
   * Video editing with reference images.
   *
   * Takes a video, 1-3 reference images, and a prompt describing the edit.
   *
   * @example
   * ```typescript
   * const result = await client.videoEdit({
   *   prompt: 'Replace the clothes with the outfit in the reference image',
   *   videoUrl: 'https://example.com/input.mp4',
   *   referenceImageUrls: ['https://example.com/outfit.png'],
   *   resolution: '720P',
   * });
   * console.log(result.videoUrl);
   * ```
   */
  async videoEdit(options: VideoEditOptions): Promise<VideoGenerationResult> {
    if (!options.videoUrl) {
      throw new WanApiError('InvalidInput', 'videoUrl is required');
    }
    if (!options.referenceImageUrls?.length) {
      throw new WanApiError('InvalidInput', 'At least one reference image is required');
    }
    if (options.referenceImageUrls.length > 3) {
      throw new WanApiError('InvalidInput', 'Maximum 3 reference images allowed');
    }

    const media: VideoEditMediaItem[] = [
      { type: 'video', url: options.videoUrl },
      ...options.referenceImageUrls.map((url): VideoEditMediaItem => ({
        type: 'reference_image',
        url,
      })),
    ];

    const request: VideoEditRequest = {
      model: options.model || DEFAULT_MODEL,
      input: {
        prompt: options.prompt,
        ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
        media,
      },
      parameters: this.buildParams(options),
    };

    return this.executeEditTask(request, options.onProgress);
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private buildParams(
    options: VideoStyleModificationOptions | VideoEditOptions,
  ): VideoEditRequest['parameters'] {
    return {
      resolution: options.resolution || '1080P',
      prompt_extend: options.promptExtend !== false,
      watermark: options.watermark || false,
      ...(options.ratio && { ratio: options.ratio }),
      ...(options.duration != null && { duration: options.duration }),
      ...(options.audioSetting && { audio_setting: options.audioSetting }),
      ...(options.seed != null && { seed: options.seed }),
    };
  }

  private async executeEditTask(
    request: VideoEditRequest,
    onProgress?: (status: VideoTaskStatus, taskId: string) => void,
  ): Promise<VideoGenerationResult> {
    try {
      const taskId = await this.createEditTask(request);
      const result = await this.waitForVideoTask(taskId, onProgress);
      return {
        requestId: result.request_id,
        taskId: result.output.task_id,
        success: result.output.task_status === 'SUCCEEDED',
        videoUrl: result.output.video_url || '',
        origPrompt: result.output.orig_prompt,
        usage: result.usage,
      };
    } catch (error) {
      if (error instanceof WanApiError) throw error;
      throw this.extractError(error);
    }
  }

  private async createEditTask(request: VideoEditRequest): Promise<string> {
    const response = await this.client.post<VideoTaskCreationResponse>(
      VIDEO_SYNTHESIS_PATH,
      request,
      {
        headers: { 'X-DashScope-Async': 'enable' },
        timeout: this.editTimeout,
      },
    );

    const { task_id, task_status } = response.data.output;
    if (task_status === 'PENDING' || task_status === 'RUNNING') {
      return task_id;
    }

    throw new WanApiError(
      'TaskCreationFailed',
      `Video edit task creation returned status: ${task_status}`,
    );
  }
}

export default WanVideoEditClient;
