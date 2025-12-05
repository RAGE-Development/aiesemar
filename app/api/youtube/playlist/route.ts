import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * YouTube playlist item interface matching the expected API response
 */
interface YouTubePlaylistItem {
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
 * YouTube API response interface for playlist items
 */
interface YouTubeApiResponse {
  items: Array<{
    snippet: {
      title: string;
      channelTitle: string;
      resourceId: {
        videoId: string;
      };
      thumbnails: {
        default?: { url: string; width: number; height: number };
        medium?: { url: string; width: number; height: number };
        high?: { url: string; width: number; height: number };
      };
    };
  }>;
  nextPageToken?: string;
}

/**
 * Extracts playlist ID from various YouTube URL formats
 * @param url - YouTube playlist URL
 * @returns Playlist ID or null if not found
 */
function extractPlaylistId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle different YouTube URL formats
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('list');
    } else if (urlObj.hostname.includes('youtu.be')) {
      // For youtu.be links, playlist ID might be in the query params
      return urlObj.searchParams.get('list');
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches YouTube playlist items using YouTube Data API v3
 * GET /api/youtube/playlist?playlistId=...
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const playlistIdParam = searchParams.get('playlistId');
    const urlParam = searchParams.get('url');
    
    let playlistId: string | null = null;
    
    if (playlistIdParam) {
      playlistId = playlistIdParam;
    } else if (urlParam) {
      playlistId = extractPlaylistId(urlParam);
    }
    
    if (!playlistId) {
      return NextResponse.json(
        { error: "Missing or invalid playlist ID/URL" }, 
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key not configured" }, 
        { status: 500 }
      );
    }

    // Fetch playlist items from YouTube Data API v3
    const apiUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    apiUrl.searchParams.set('part', 'snippet');
    apiUrl.searchParams.set('playlistId', playlistId);
    apiUrl.searchParams.set('maxResults', '50'); // Maximum allowed by API
    apiUrl.searchParams.set('key', apiKey);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: YouTubeApiResponse = await response.json();

    // Transform API response to our expected format
    const items: YouTubePlaylistItem[] = data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      videoId: item.snippet.resourceId.videoId,
      thumbnails: item.snippet.thumbnails
    }));

    return NextResponse.json({ 
      items,
      nextPageToken: data.nextPageToken 
    });

  } catch (error) {
    console.error('YouTube playlist fetch error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('403')) {
        return NextResponse.json(
          { error: "YouTube API quota exceeded or invalid API key" }, 
          { status: 403 }
        );
      } else if (error.message.includes('404')) {
        return NextResponse.json(
          { error: "Playlist not found or is private" }, 
          { status: 404 }
        );
      } else if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: "Request timeout - please try again" }, 
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch playlist" }, 
      { status: 500 }
    );
  }
}