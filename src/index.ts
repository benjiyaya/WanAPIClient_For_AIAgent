/**
 * Alibaba Cloud Model Studio - WanAPIClient
 *
 * Barrel exports for all clients and types.
 */

// Image Client
import { WanClient } from './client';
export { WanClient } from './client';
export default WanClient;
export { WanClientConfig, Region, API_ENDPOINTS } from './types';

// Video Client
export { WanVideoClient } from './video-client';
export {
  VideoSynthesisRequest,
  VideoTaskCreationResponse,
  VideoTaskQueryResponse,
  VideoTaskStatus,
  VideoGenerationResult,
  VideoUsage,
  ImageToVideoOptions,
  TextToVideoOptions,
  VideoInput,
  VideoFromFirstFrameOptions,
  VideoContinuationOptions,
} from './video-types';

// Video Edit Client (Wan 2.7)
export { WanVideoEditClient } from './video-edit-client';
export {
  VideoEditMediaType,
  VideoEditMediaItem,
  VideoEditRequest,
  VideoStyleModificationOptions,
  VideoEditOptions,
} from './video-edit-types';
