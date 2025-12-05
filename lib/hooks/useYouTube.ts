import { useState, useCallback } from 'react';
import { 
  YouTubePlaylistResponse, 
  YouTubeStreamResponse, 
  YouTubePlaylistItem 
} from '../types/queue';

/**
 * Hook for fetching YouTube playlist data
 * This is a simple implementation that can be upgraded to react-query later
 */
export const useYouTubePlaylist = () => {
  const [data, setData] = useState<YouTubePlaylistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches YouTube playlist by URL or playlist ID
   * @param playlistUrl - YouTube playlist URL or playlist ID
   */
  const fetchPlaylist = useCallback(async (playlistUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = new URL('/api/youtube/playlist', window.location.origin);
      url.searchParams.set('url', playlistUrl);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: YouTubePlaylistResponse = await response.json();
      setData(result);
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch playlist';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the current playlist data
   */
  const clearPlaylist = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchPlaylist,
    clearPlaylist,
  };
};

/**
 * Hook for fetching YouTube video stream URLs
 */
export const useYouTubeStream = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches direct stream URL for a YouTube video
   * @param videoId - YouTube video ID
   * @returns Promise with stream URL
   */
  const fetchStream = useCallback(async (videoId: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/yt-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: videoId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: YouTubeStreamResponse = await response.json();
      
      if (!result.url) {
        throw new Error('No stream URL found');
      }
      
      return result.url;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stream';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fetchStream,
  };
};

/**
 * Combined hook for YouTube functionality
 * Provides both playlist and stream fetching capabilities
 */
export const useYouTube = () => {
  const playlist = useYouTubePlaylist();
  const stream = useYouTubeStream();

  /**
   * Fetches playlist and prepares items for queue integration
   * @param playlistUrl - YouTube playlist URL
   * @returns Promise with playlist items ready for queue
   */
  const fetchPlaylistForQueue = useCallback(async (playlistUrl: string) => {
    const playlistData = await playlist.fetchPlaylist(playlistUrl);
    return playlistData.items;
  }, [playlist]);

  /**
   * Converts YouTube playlist item to queue-ready format
   * @param item - YouTube playlist item
   * @param streamUrl - Direct stream URL for the video
   * @returns Queue-ready YouTube item
   */
  const createQueueItem = useCallback((item: YouTubePlaylistItem, streamUrl: string) => {
    return {
      id: `youtube_${item.videoId}`,
      kind: 'youtube' as const,
      title: item.title,
      videoId: item.videoId,
      channelTitle: item.channelTitle,
      thumbnails: item.thumbnails,
      url: streamUrl,
    };
  }, []);

  return {
    playlist,
    stream,
    fetchPlaylistForQueue,
    createQueueItem,
    isLoading: playlist.isLoading || stream.isLoading,
    error: playlist.error || stream.error,
  };
};