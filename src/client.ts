/**
 * Alibaba Cloud Model Studio - Wan 2.7 Image API Client
 *
 * Provides high-level methods for:
 *   - Text-to-image generation
 *   - Image editing with multiple reference images
 *   - Interactive editing
 *   - Image set generation (tutorials, comics, etc.)
 *
 * Supports both synchronous and asynchronous API calls.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  WanClientConfig,
  Region,
  API_ENDPOINTS,
  GenerationRequest,
  SyncGenerationResponse,
  AsyncTaskResponse,
  TaskQueryResponse,
  Message,
  TextContent,
  ImageContent,
  ImageInput,
  TextToImageOptions,
  ImageEditingOptions,
  InteractiveEditingOptions,
  ImageSetOptions,
  GenerationResult,
  GeneratedContent,
  WanApiError,
} from './types';

export class WanClient {
  protected client: AxiosInstance;
  protected config: Required<WanClientConfig>;
  private baseUrl: string;

  constructor(config: WanClientConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.config = {
      region: config.region || Region.SINGAPORE,
      endpoint: config.endpoint || API_ENDPOINTS[config.region || Region.SINGAPORE],
      timeout: config.timeout || 120000,
      maxPollingAttempts: config.maxPollingAttempts || 60,
      pollingInterval: config.pollingInterval || 5000,
      ...config,
    };

    this.baseUrl = this.config.endpoint;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });
  }

  private createTextContent(text: string): TextContent {
    return { type: 'text', text };
  }

  private createImageContent(image: ImageInput): ImageContent {
    return {
      type: 'image',
      image: image.url || image.base64 || '',
    };
  }

  private buildMessages(prompt: string, referenceImages?: ImageInput[]): Message[] {
    const content: (TextContent | ImageContent)[] = [
      this.createTextContent(prompt),
    ];

    if (referenceImages && referenceImages.length > 0) {
      for (const img of referenceImages) {
        content.push(this.createImageContent(img));
      }
    }

    return [{ role: 'user', content }];
  }

  private extractResults(response: SyncGenerationResponse): GenerationResult {
    const results: GeneratedContent[] = [];

    if (response.output.choices && response.output.choices.length > 0) {
      for (const choice of response.output.choices) {
        const generatedContent: GeneratedContent = {
          text: '',
          images: [],
        };

        for (const item of choice.message.content) {
          if (item.type === 'text') {
            generatedContent.text += item.text;
          } else if (item.type === 'image') {
            generatedContent.images.push({
              url: item.image,
              type: 'image',
            });
          }
        }

        results.push(generatedContent);
      }
    }

    return {
      requestId: response.request_id,
      success: true,
      results,
      usage: response.usage,
    };
  }

  protected extractError(error: unknown): WanApiError {
    if (error instanceof AxiosError && error.response?.data) {
      const data = error.response.data;
      return new WanApiError(
        data.code || 'UnknownError',
        data.message || 'An unknown error occurred',
        data.request_id
      );
    }
    return new WanApiError('NetworkError', String(error));
  }

  // ============================================================================
  // High-Level API Methods
  // ============================================================================

  async textToImage(options: TextToImageOptions): Promise<GenerationResult> {
    try {
      const messages = this.buildMessages(options.prompt);

      const request: GenerationRequest = {
        model: 'wan2.7-image',
        input: { messages },
        parameters: {
          negative_prompt: options.negativePrompt,
          size: options.size || '1280*1280',
          prompt_extend: options.promptExtend !== false,
          watermark: options.watermark || false,
          n: options.n || 1,
          enable_interleave: true,
          stream: true,
          seed: options.seed,
        },
      };

      const response = await this.client.post<SyncGenerationResponse>(
        '/services/aigc/multimodal-generation/generation',
        request
      );

      return this.extractResults(response.data);
    } catch (error) {
      throw this.extractError(error);
    }
  }

  async imageEditing(options: ImageEditingOptions): Promise<GenerationResult> {
    try {
      if (!options.referenceImages || options.referenceImages.length === 0) {
        throw new WanApiError('InvalidInput', 'At least one reference image is required for image editing');
      }

      if (options.referenceImages.length > 4) {
        throw new WanApiError('InvalidInput', 'Maximum 4 reference images allowed');
      }

      const messages = this.buildMessages(options.prompt, options.referenceImages);

      const request: GenerationRequest = {
        model: 'wan2.7-image',
        input: { messages },
        parameters: {
          negative_prompt: options.negativePrompt,
          size: options.size || '1280*1280',
          prompt_extend: options.promptExtend !== false,
          watermark: options.watermark || false,
          n: options.n || 1,
          enable_interleave: false,
          seed: options.seed,
        },
      };

      const response = await this.client.post<SyncGenerationResponse>(
        '/services/aigc/multimodal-generation/generation',
        request
      );

      return this.extractResults(response.data);
    } catch (error) {
      if (error instanceof WanApiError) throw error;
      throw this.extractError(error);
    }
  }

  async interactiveEditing(options: InteractiveEditingOptions): Promise<GenerationResult> {
    try {
      const referenceImages = options.referenceImage ? [options.referenceImage] : undefined;

      const messages = this.buildMessages(options.prompt, referenceImages);

      const request: GenerationRequest = {
        model: 'wan2.7-image',
        input: { messages },
        parameters: {
          size: options.size || '1280*1280',
          watermark: options.watermark || false,
          enable_interleave: true,
          stream: true,
          seed: options.seed,
        },
      };

      const response = await this.client.post<SyncGenerationResponse>(
        '/services/aigc/multimodal-generation/generation',
        request
      );

      return this.extractResults(response.data);
    } catch (error) {
      throw this.extractError(error);
    }
  }

  async imageSet(options: ImageSetOptions): Promise<GenerationResult> {
    try {
      const messages = this.buildMessages(options.prompt);

      const request: GenerationRequest = {
        model: 'wan2.7-image',
        input: { messages },
        parameters: {
          size: options.size || '1280*1280',
          watermark: options.watermark || false,
          enable_interleave: true,
          max_images: options.maxImages || 3,
          stream: true,
          seed: options.seed,
        },
      };

      const response = await this.client.post<SyncGenerationResponse>(
        '/services/aigc/multimodal-generation/generation',
        request
      );

      return this.extractResults(response.data);
    } catch (error) {
      throw this.extractError(error);
    }
  }

  // ============================================================================
  // Low-Level API Methods
  // ============================================================================

  async createAsyncTask(request: GenerationRequest): Promise<string> {
    try {
      const response = await this.client.post<AsyncTaskResponse>(
        '/services/aigc/image-generation/generation',
        request,
        {
          headers: {
            'X-DashScope-Async': 'enable',
          },
        }
      );

      if (response.data.output.task_status === 'PENDING') {
        return response.data.output.task_id;
      }

      throw new WanApiError(
        'TaskCreationFailed',
        `Task creation failed with status: ${response.data.output.task_status}`
      );
    } catch (error) {
      throw this.extractError(error);
    }
  }

  async queryTask(taskId: string): Promise<TaskQueryResponse> {
    try {
      const response = await this.client.get<TaskQueryResponse>(
        `/tasks/${taskId}`
      );

      return response.data;
    } catch (error) {
      throw this.extractError(error);
    }
  }

  async waitForTask(
    taskId: string,
    onProgress?: (status: string) => void
  ): Promise<TaskQueryResponse> {
    let attempts = 0;

    while (attempts < this.config.maxPollingAttempts) {
      const result = await this.queryTask(taskId);

      if (onProgress) {
        onProgress(result.output.task_status);
      }

      if (result.output.task_status === 'SUCCEEDED') {
        return result;
      }

      if (result.output.task_status === 'FAILED' || result.output.task_status === 'CANCELED') {
        throw new WanApiError(
          'TaskFailed',
          `Task ${result.output.task_status}: ${result.message || 'Unknown error'}`
        );
      }

      await new Promise(resolve =>
        setTimeout(resolve, this.config.pollingInterval)
      );

      attempts++;
    }

    throw new WanApiError(
      'Timeout',
      `Task polling timed out after ${this.config.maxPollingAttempts} attempts`
    );
  }

  async call<T = any>(
    path: string,
    request: GenerationRequest,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(path, request, {
        headers: options?.headers,
      });
      return response.data;
    } catch (error) {
      throw this.extractError(error);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getRegion(): Region {
    return this.config.region;
  }

  async test(): Promise<boolean> {
    try {
      await this.textToImage({
        prompt: 'test',
        n: 1,
        size: '1K',
      });
      return true;
    } catch {
      return false;
    }
  }
}
