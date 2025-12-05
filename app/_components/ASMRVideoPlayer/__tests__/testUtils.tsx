/**
 * Test utilities for ASMRVideoPlayer component testing
 * Provides common setup, rendering helpers, and test data
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { vi, expect } from 'vitest'
import { createMockVideoElement, createMockFile, createMockFileList } from './__mocks__/mediaMocks'

/**
 * Custom render function that includes common providers and setup
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any providers here if needed (e.g., React Query, Context providers)
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Creates a mock video element and attaches it to a ref
 */
export const createMockVideoRef = () => {
  const mockVideo = createMockVideoElement()
  const videoRef = { current: mockVideo as HTMLVideoElement }
  return { mockVideo, videoRef }
}

/**
 * Test data for queue items
 */
export const createTestQueueItems = () => {
  const localFile1 = createMockFile('video1.mp4', 'video/mp4', 1024 * 1024)
  const localFile2 = createMockFile('video2.mp4', 'video/mp4', 2048 * 1024)
  const localFile3 = createMockFile('video3.mp4', 'video/mp4', 1536 * 1024)

  return {
    localItems: [
      {
        id: 'local-1',
        type: 'local' as const,
        file: localFile1,
        url: 'mock-object-url-1',
        name: 'video1.mp4',
        size: 1024 * 1024,
      },
      {
        id: 'local-2',
        type: 'local' as const,
        file: localFile2,
        url: 'mock-object-url-2',
        name: 'video2.mp4',
        size: 2048 * 1024,
      },
      {
        id: 'local-3',
        type: 'local' as const,
        file: localFile3,
        url: 'mock-object-url-3',
        name: 'video3.mp4',
        size: 1536 * 1024,
      },
    ],
    youtubeItems: [
      {
        id: 'yt-1',
        type: 'youtube' as const,
        videoId: 'dQw4w9WgXcQ',
        title: 'Test YouTube Video 1',
        channelTitle: 'Test Channel',
        thumbnails: {
          default: { url: 'https://example.com/thumb1.jpg', width: 120, height: 90 },
        },
      },
      {
        id: 'yt-2',
        type: 'youtube' as const,
        videoId: 'oHg5SJYRHA0',
        title: 'Test YouTube Video 2',
        channelTitle: 'Test Channel',
        thumbnails: {
          default: { url: 'https://example.com/thumb2.jpg', width: 120, height: 90 },
        },
      },
    ],
    files: [localFile1, localFile2, localFile3],
    fileList: createMockFileList([localFile1, localFile2, localFile3]),
  }
}

/**
 * Mock YouTube playlist API response
 */
export const createMockPlaylistResponse = () => ({
  items: [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      channelTitle: 'Rick Astley',
      videoId: 'dQw4w9WgXcQ',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', width: 480, height: 360 },
      },
    },
    {
      id: 'oHg5SJYRHA0',
      title: 'RickRoll\'d',
      channelTitle: 'Rick Astley',
      videoId: 'oHg5SJYRHA0',
      thumbnails: {
        default: { url: 'https://i.ytimg.com/vi/oHg5SJYRHA0/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://i.ytimg.com/vi/oHg5SJYRHA0/mqdefault.jpg', width: 320, height: 180 },
        high: { url: 'https://i.ytimg.com/vi/oHg5SJYRHA0/hqdefault.jpg', width: 480, height: 360 },
      },
    },
  ],
  nextPageToken: 'NEXT_PAGE_TOKEN',
})

/**
 * Mock fetch responses for different scenarios
 */
export const setupMockFetch = () => {
  const mockFetch = vi.fn()
  global.fetch = mockFetch

  const mockResponses = {
    playlistSuccess: () => mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(createMockPlaylistResponse()),
    }),
    playlistError: (status: number = 404, message: string = 'Not Found') => mockFetch.mockResolvedValueOnce({
      ok: false,
      status,
      statusText: message,
      json: () => Promise.resolve({ error: message }),
    }),
    playlistTimeout: () => mockFetch.mockRejectedValueOnce(new Error('timeout')),
    playlistQuotaExceeded: () => mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: () => Promise.resolve({ error: 'YouTube API quota exceeded or invalid API key' }),
    }),
  }

  return { mockFetch, mockResponses }
}

/**
 * Simulates user interactions with keyboard events
 */
export const createKeyboardEvent = (key: string, options: KeyboardEventInit = {}) => {
  return new KeyboardEvent('keydown', {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

/**
 * Simulates fullscreen API events
 */
export const simulateFullscreenChange = (element: Element | null = null) => {
  // Update the mock fullscreen state
  Object.defineProperty(document, 'fullscreenElement', {
    value: element,
    writable: true,
  })
  
  // Dispatch the event
  const event = new Event('fullscreenchange', { bubbles: true })
  document.dispatchEvent(event)
}

/**
 * Waits for a condition to be true with timeout
 */
export const waitFor = async (
  condition: () => boolean,
  timeout: number = 1000,
  interval: number = 10
): Promise<void> => {
  const startTime = Date.now()
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`)
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

/**
 * Creates a mock input element for file selection
 */
export const createMockFileInput = (files: File[] = []) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'video/*'
  
  // Mock the files property
  Object.defineProperty(input, 'files', {
    value: createMockFileList(files),
    writable: false,
  })
  
  return input
}

/**
 * Simulates a file drop event
 */
export const createDropEvent = (files: File[]) => {
  const dataTransfer = {
    files: createMockFileList(files),
    items: files.map(file => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })),
    types: ['Files'],
  }
  
  return new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer: dataTransfer as unknown as DataTransfer,
  })
}

/**
 * Mock console methods to capture logs in tests
 */
export const mockConsole = () => {
  const originalConsole = { ...console }
  const mockMethods = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }
  
  Object.assign(console, mockMethods)
  
  const restore = () => {
    Object.assign(console, originalConsole)
  }
  
  return { mockMethods, restore }
}

/**
 * Creates a mock ResizeObserver entry
 */
export const createMockResizeObserverEntry = (
  target: Element,
  contentRect: Partial<DOMRectReadOnly> = {}
) => ({
  target,
  contentRect: {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
    ...contentRect,
  } as DOMRectReadOnly,
  borderBoxSize: [],
  contentBoxSize: [],
  devicePixelContentBoxSize: [],
})

/**
 * Test constants for common values
 */
export const TEST_CONSTANTS = {
  VIDEO_DURATION: 100,
  SEEK_TIME: 50,
  VOLUME_LEVEL: 0.7,
  PLAYBACK_SPEEDS: [0.5, 1, 1.5, 2],
  BASS_FREQUENCIES: [800],
  TIMEOUT_DURATION: 1000,
  RETRY_ATTEMPTS: 3,
} as const

/**
 * Assertion helpers for common test scenarios
 */
export const assertions = {
  videoIsPlaying: (mockVideo: any) => {
    expect(mockVideo.play).toHaveBeenCalled()
    expect(mockVideo._mockPaused).toBe(false)
  },
  
  videoIsPaused: (mockVideo: any) => {
    expect(mockVideo.pause).toHaveBeenCalled()
    expect(mockVideo._mockPaused).toBe(true)
  },
  
  videoSourceChanged: (mockVideo: any, expectedSrc: string) => {
    expect(mockVideo._mockSrc).toBe(expectedSrc)
  },
  
  volumeChanged: (mockVideo: any, expectedVolume: number) => {
    expect(mockVideo._mockVolume).toBe(expectedVolume)
  },
  
  playbackRateChanged: (mockVideo: any, expectedRate: number) => {
    expect(mockVideo._mockPlaybackRate).toBe(expectedRate)
  },
}

// Re-export commonly used testing utilities
export * from '@testing-library/react'
export { vi } from 'vitest'