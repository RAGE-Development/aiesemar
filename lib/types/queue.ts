/**
 * Unified queue item types for ASMR Video Player
 * Supports both local files and YouTube videos in a single queue
 */

/**
 * Base queue item interface
 */
interface BaseQueueItem {
  id: string;
  title: string;
  url: string;
}

/**
 * Local file queue item
 */
export interface LocalQueueItem extends BaseQueueItem {
  kind: 'local';
  file: File;
  name: string;
  url: string; // Object URL for the file
}

/**
 * YouTube video queue item
 */
export interface YouTubeQueueItem extends BaseQueueItem {
  kind: 'youtube';
  videoId: string;
  channelTitle: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
  };
  url: string; // Direct video stream URL
}

/**
 * Union type for all queue items
 */
export type QueueItem = LocalQueueItem | YouTubeQueueItem;

/**
 * YouTube playlist item from API
 */
export interface YouTubePlaylistItem {
  id: string;
  title: string;
  channelTitle: string;
  videoId: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
  };
}

/**
 * YouTube playlist API response
 */
export interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
}

/**
 * YouTube stream API response
 */
export interface YouTubeStreamResponse {
  url: string;
}

/**
 * Queue state interface
 */
export interface QueueState {
  items: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
}

/**
 * Type guards for queue items
 */
export const isLocalQueueItem = (item: QueueItem): item is LocalQueueItem => {
  return item.kind === 'local';
};

export const isYouTubeQueueItem = (item: QueueItem): item is YouTubeQueueItem => {
  return item.kind === 'youtube';
};