import { vi } from 'vitest'

// Mock HTMLMediaElement methods that are not implemented in JSDOM
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
})

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
})

// Mock HTMLMediaElement properties
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  writable: true,
  value: false,
})

Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
  writable: true,
  value: 1,
})

Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
  writable: true,
  value: 0,
})

Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
  writable: true,
  value: 100,
})

Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
  writable: true,
  value: 1,
})

Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
  writable: true,
  value: HTMLMediaElement.HAVE_ENOUGH_DATA,
})

Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
  writable: true,
  value: true,
})

Object.defineProperty(HTMLMediaElement.prototype, 'ended', {
  writable: true,
  value: false,
})

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Fullscreen API
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
})

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
})

Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
})

// Mock AudioContext for bass boost functionality
global.AudioContext = vi.fn().mockImplementation(() => ({
  createMediaElementSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
  }),
  createBiquadFilter: vi.fn().mockReturnValue({
    connect: vi.fn(),
    frequency: { value: 800 },
    type: 'lowshelf',
  }),
  destination: {},
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
}))

global.webkitAudioContext = global.AudioContext

// Mock AbortSignal.timeout for API calls
if (!global.AbortSignal.timeout) {
  global.AbortSignal.timeout = vi.fn().mockImplementation((timeout) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), timeout)
    return controller.signal
  })
}

// Mock fetch for API testing
global.fetch = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))