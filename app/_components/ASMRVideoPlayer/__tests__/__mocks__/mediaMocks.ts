/**
 * Media mocks for testing HTMLMediaElement and Web APIs with Vitest
 * Provides comprehensive mocking for video player functionality
 */

import { vi } from 'vitest'

export interface MockHTMLVideoElement extends Partial<HTMLVideoElement> {
  _mockCurrentTime: number;
  _mockDuration: number;
  _mockVolume: number;
  _mockMuted: boolean;
  _mockPaused: boolean;
  _mockEnded: boolean;
  _mockReadyState: number;
  _mockPlaybackRate: number;
  _mockSrc: string;
  _mockEventListeners: Map<string, EventListener[]>;
  _triggerEvent: (eventType: string, eventData?: Partial<Event>) => void;
}

/**
 * Creates a mock HTMLVideoElement with all necessary properties and methods
 */
export const createMockVideoElement = (): MockHTMLVideoElement => {
  const mockElement: MockHTMLVideoElement = {
    // Internal state
    _mockCurrentTime: 0,
    _mockDuration: 100,
    _mockVolume: 1,
    _mockMuted: false,
    _mockPaused: true,
    _mockEnded: false,
    _mockReadyState: HTMLMediaElement.HAVE_ENOUGH_DATA,
    _mockPlaybackRate: 1,
    _mockSrc: '',
    _mockEventListeners: new Map(),

    // Properties
    get currentTime() { return this._mockCurrentTime; },
    set currentTime(value: number) { 
      this._mockCurrentTime = value;
      this._triggerEvent('timeupdate');
    },

    get duration() { return this._mockDuration; },
    set duration(value: number) { this._mockDuration = value; },

    get volume() { return this._mockVolume; },
    set volume(value: number) { 
      this._mockVolume = Math.max(0, Math.min(1, value));
      this._triggerEvent('volumechange');
    },

    get muted() { return this._mockMuted; },
    set muted(value: boolean) { 
      this._mockMuted = value;
      this._triggerEvent('volumechange');
    },

    get paused() { return this._mockPaused; },
    get ended() { return this._mockEnded; },
    get readyState() { return this._mockReadyState; },

    get playbackRate() { return this._mockPlaybackRate; },
    set playbackRate(value: number) { 
      this._mockPlaybackRate = value;
      this._triggerEvent('ratechange');
    },

    get src() { return this._mockSrc; },
    set src(value: string) { 
      this._mockSrc = value;
      this._triggerEvent('loadstart');
      // Simulate loading process
      setTimeout(() => {
        this._mockReadyState = HTMLMediaElement.HAVE_METADATA;
        this._triggerEvent('loadedmetadata');
        setTimeout(() => {
          this._mockReadyState = HTMLMediaElement.HAVE_ENOUGH_DATA;
          this._triggerEvent('loadeddata');
          this._triggerEvent('canplay');
        }, 10);
      }, 10);
    },

    // Methods
    play: vi.fn().mockImplementation(function(this: MockHTMLVideoElement) {
      if (!this._mockPaused) return Promise.resolve();
      
      this._mockPaused = false;
      this._mockEnded = false;
      this._triggerEvent('play');
      
      // Simulate playing event after play
      setTimeout(() => {
        if (!this._mockPaused) {
          this._triggerEvent('playing');
        }
      }, 10);
      
      return Promise.resolve();
    }),

    pause: vi.fn().mockImplementation(function(this: MockHTMLVideoElement) {
      if (this._mockPaused) return;
      
      this._mockPaused = true;
      this._triggerEvent('pause');
    }),

    load: vi.fn().mockImplementation(function(this: MockHTMLVideoElement) {
      this._mockCurrentTime = 0;
      this._mockPaused = true;
      this._mockEnded = false;
      this._mockReadyState = HTMLMediaElement.HAVE_NOTHING;
      this._triggerEvent('loadstart');
    }),

    addEventListener: vi.fn().mockImplementation(function(
      this: MockHTMLVideoElement, 
      type: string, 
      listener: EventListener
    ) {
      if (!this._mockEventListeners.has(type)) {
        this._mockEventListeners.set(type, []);
      }
      this._mockEventListeners.get(type)?.push(listener);
    }),

    removeEventListener: vi.fn().mockImplementation(function(
      this: MockHTMLVideoElement, 
      type: string, 
      listener: EventListener
    ) {
      const listeners = this._mockEventListeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }),

    // Helper method to trigger events
    _triggerEvent(eventType: string, eventData: Partial<Event> = {}) {
      const listeners = this._mockEventListeners.get(eventType);
      if (listeners) {
        const event = {
          type: eventType,
          target: this,
          currentTarget: this,
          ...eventData
        } as Event;
        
        listeners.forEach(listener => {
          try {
            listener(event);
          } catch (error) {
            console.error(`Error in ${eventType} listener:`, error);
          }
        });
      }
    },

    // Additional properties that might be needed
    requestFullscreen: vi.fn().mockResolvedValue(undefined),
  };

  return mockElement;
};

/**
 * Mock URL object for createObjectURL and revokeObjectURL
 */
export const mockURL = {
  createObjectURL: vi.fn().mockImplementation((object: File | Blob) => {
    return `mock-object-url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }),
  
  revokeObjectURL: vi.fn().mockImplementation((url: string) => {
    // Mock implementation - in real browser this would free memory
  }),
};

/**
 * Mock AudioContext for bass boost functionality
 */
export const createMockAudioContext = () => {
  const mockBiquadFilter = {
    connect: vi.fn(),
    frequency: { value: 800 },
    gain: { value: 0 },
    type: 'lowshelf' as BiquadFilterType,
  };

  const mockMediaElementSource = {
    connect: vi.fn(),
  };

  return {
    createMediaElementSource: vi.fn().mockReturnValue(mockMediaElementSource),
    createBiquadFilter: vi.fn().mockReturnValue(mockBiquadFilter),
    destination: {},
    state: 'running' as AudioContextState,
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
};

/**
 * Mock Fullscreen API
 */
export const mockFullscreenAPI = {
  // Document properties
  fullscreenElement: null as Element | null,
  fullscreenEnabled: true,
  
  // Document methods
  exitFullscreen: vi.fn().mockImplementation(() => {
    mockFullscreenAPI.fullscreenElement = null;
    // Trigger fullscreenchange event
    document.dispatchEvent(new Event('fullscreenchange'));
    return Promise.resolve();
  }),
  
  // Element method
  requestFullscreen: vi.fn().mockImplementation(function(this: Element) {
    mockFullscreenAPI.fullscreenElement = this;
    // Trigger fullscreenchange event
    document.dispatchEvent(new Event('fullscreenchange'));
    return Promise.resolve();
  }),
};

/**
 * Mock File object for testing file uploads
 */
export const createMockFile = (
  name: string = 'test-video.mp4',
  type: string = 'video/mp4',
  size: number = 1024 * 1024 // 1MB
): File => {
  const file = new File(['mock file content'], name, { type });
  
  // Add size property (readonly in real File objects)
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  });
  
  return file;
};

/**
 * Mock FileList for testing multiple file uploads
 */
export const createMockFileList = (files: File[]): FileList => {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  };
  
  // Add indexed access
  files.forEach((file, index) => {
    (fileList as any)[index] = file;
  });
  
  return fileList as FileList;
};

/**
 * Utility to simulate video playback progress
 */
export const simulateVideoProgress = (
  mockVideo: MockHTMLVideoElement,
  duration: number = 1000,
  steps: number = 10
) => {
  const stepDuration = duration / steps;
  const timeIncrement = mockVideo._mockDuration / steps;
  
  let currentStep = 0;
  
  const interval = setInterval(() => {
    if (currentStep >= steps || mockVideo._mockPaused) {
      clearInterval(interval);
      if (currentStep >= steps) {
        mockVideo._mockEnded = true;
        mockVideo._mockPaused = true;
        mockVideo._triggerEvent('ended');
      }
      return;
    }
    
    mockVideo._mockCurrentTime += timeIncrement;
    mockVideo._triggerEvent('timeupdate');
    currentStep++;
  }, stepDuration);
  
  return interval;
};

/**
 * Utility to wait for next tick (useful for async operations in tests)
 */
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Utility to wait for multiple ticks
 */
export const waitForTicks = (ticks: number = 1) => 
  new Promise(resolve => setTimeout(resolve, ticks * 10));