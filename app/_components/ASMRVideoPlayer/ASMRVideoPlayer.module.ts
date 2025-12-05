import { useRef, useState, useEffect, useCallback } from "react";
import { QueueItem, LocalQueueItem, YouTubeQueueItem, isLocalQueueItem, isYouTubeQueueItem } from "../../../lib/types/queue";
import { useYouTube } from "../../../lib/hooks/useYouTube";

const PRESETS = [
  { name: "Default", gain: 5 },
  { name: "High", gain: 10 },
  { name: "Very High", gain: 20 },
  { name: "Insane", gain: 30 },
  { name: "Custom", gain: 0 }, // Custom gain will be set by user
];

const LOWSHELF_FREQ = 800;

const useASMRVideoPlayer = () => {
  /** @Globals */
  const youTubeHooks = useYouTube();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [preset, setPreset] = useState(PRESETS[0]?.name || "Default");
  const [customGain, setCustomGain] = useState(5);
  const [isOffline, setIsOffline] = useState(false);
  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [bassBoostEnabled, setBassBoostEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const previousObjectURLRef = useRef<string | null>(null);
  const isSourceChangingRef = useRef<boolean>(false);
  const fullscreenTriggerRef = useRef<HTMLElement | null>(null);

  // Queue state management
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(-1);

  // Initialize audio context for bass boost
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return; // Fix: guard for undefined videoRef.current
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(video);

      // Create bass filter
      bassFilterRef.current = audioContextRef.current.createBiquadFilter();
      bassFilterRef.current.type = "lowshelf";
      bassFilterRef.current.frequency.value = LOWSHELF_FREQ;

      // Connect nodes
      sourceNodeRef.current.connect(bassFilterRef.current);
      bassFilterRef.current.connect(audioContextRef.current.destination);
    }
    // Always set frequency to 800 Hz if filter exists
    if (bassFilterRef.current) {
      bassFilterRef.current.frequency.value = LOWSHELF_FREQ;
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [videoURL]);

  // Update bass boost when preset or customGain or enabled changes
  useEffect(() => {
    if (bassFilterRef.current) {
      if (bassBoostEnabled) {
        let gain = customGain;
        const presetObj = PRESETS.find((p) => p.name === preset);
        if (presetObj && presetObj.name !== "Custom") {
          gain = presetObj.gain;
        }
        bassFilterRef.current.gain.value = gain;
      } else {
        bassFilterRef.current.gain.value = 0;
      }
    }
  }, [preset, customGain, bassBoostEnabled]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  /**
   * Safely revokes a previous Object URL if it exists and is a blob URL
   * @param url - The URL to potentially revoke
   */
  const cleanupPreviousUrl = useCallback((url: string | null) => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke Object URL:', error);
      }
    }
  }, []);

  /**
   * Deterministic video element source change lifecycle
   * Implements: pause -> detach src/srcObject -> video.load() -> revoke previous URL -> set new src
   * @param newUrl - The new video URL to set (can be blob URL or regular URL)
   */
  const handleChangeSource = useCallback((newUrl: string | null) => {
    const video = videoRef.current;
    if (!video) return;

    // Set flag to prevent concurrent source changes
    isSourceChangingRef.current = true;

    try {
      // Step 1: Pause video if playing
      if (!video.paused) {
        video.pause();
      }

      // Step 2: Detach current source
      video.removeAttribute('src');
      video.srcObject = null;

      // Step 3: Force video element reset
      video.load();

      // Step 4: Revoke previous Object URL if it exists
      if (previousObjectURLRef.current) {
        cleanupPreviousUrl(previousObjectURLRef.current);
        previousObjectURLRef.current = null;
      }

      // Step 5: Set new source and track it
      if (newUrl) {
        video.src = newUrl;
        if (newUrl.startsWith('blob:')) {
          previousObjectURLRef.current = newUrl;
        }
      }

      // Step 6: Update state
      setVideoURL(newUrl);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);

    } catch (error) {
      console.error('Error during source change:', error);
    } finally {
      isSourceChangingRef.current = false;
    }
  }, [cleanupPreviousUrl]);

  /**
   * Safely prepares video for playback and plays it with proper event gating
   * Waits for loadedmetadata/canplay events before attempting play()
   */
  const prepareAndPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !videoURL || isSourceChangingRef.current) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Wait for video to be ready for playback
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Video load timeout'));
          }, 10000); // 10 second timeout

          const onLoadedData = () => {
            cleanup();
            resolve();
          };

          const onError = () => {
            cleanup();
            reject(new Error('Video load error'));
          };

          const cleanup = () => {
            clearTimeout(timeout);
            video.removeEventListener('loadeddata', onLoadedData);
            video.removeEventListener('canplay', onLoadedData);
            video.removeEventListener('error', onError);
          };

          video.addEventListener('loadeddata', onLoadedData);
          video.addEventListener('canplay', onLoadedData);
          video.addEventListener('error', onError);
        });
      }

      // Attempt to play with error handling
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
      }

    } catch (error) {
      console.error('Error during video playback preparation:', error);
      setIsPlaying(false);
    }
  }, [videoURL]);

  /**
   * Enhanced file change handler with deterministic lifecycle
   * @param file - The file to load, or null to clear
   */
  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      handleChangeSource(null);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      handleChangeSource(url);
    } catch (error) {
      console.error('Error creating Object URL:', error);
    }
  }, [handleChangeSource]);

  /**
   * Generates a unique ID for queue items
   */
  const generateQueueId = useCallback(() => {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Adds multiple files to the queue
   * @param files - FileList or File array to add to queue
   */
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: QueueItem[] = [];

    fileArray.forEach((file) => {
      if (file.type.startsWith('video/')) {
        try {
          const url = URL.createObjectURL(file);
          const item: LocalQueueItem = {
            kind: "local",
            id: generateQueueId(),
            file,
            name: file.name,
            title: file.name,
            url,
          };
          newItems.push(item);
        } catch (error) {
          console.error('Error creating Object URL for file:', file.name, error);
        }
      }
    });

    if (newItems.length > 0) {
      setQueue((prevQueue) => [...prevQueue, ...newItems]);
      
      // If no item is currently playing, start with the first new item
      if (currentQueueIndex === -1) {
        const newIndex = queue.length; // Index of first new item
        setCurrentQueueIndex(newIndex);
        handleChangeSource(newItems[0]?.url || null);
      }
    }
  }, [generateQueueId, queue.length, currentQueueIndex, handleChangeSource]);

  /**
   * Adds YouTube playlist items to the queue
   * @param playlistUrl - YouTube playlist URL
   */
  const addYouTubePlaylist = useCallback(async (playlistUrl: string) => {
    try {
      const playlistItems = await youTubeHooks.fetchPlaylistForQueue(playlistUrl);
      const newItems: YouTubeQueueItem[] = [];

      for (const item of playlistItems) {
        try {
          // Get stream URL for each video
          const streamUrl = await youTubeHooks.stream.fetchStream(item.videoId);
          
          const queueItem: YouTubeQueueItem = {
            kind: "youtube",
            id: generateQueueId(),
            title: item.title,
            videoId: item.videoId,
            channelTitle: item.channelTitle,
            thumbnails: item.thumbnails,
            url: streamUrl,
          };
          
          newItems.push(queueItem);
        } catch (error) {
          console.error('Error getting stream URL for video:', item.videoId, error);
          // Continue with other videos even if one fails
        }
      }

      if (newItems.length > 0) {
        setQueue((prevQueue) => [...prevQueue, ...newItems]);
        
        // If no item is currently playing, start with the first new item
        if (currentQueueIndex === -1) {
          const newIndex = queue.length; // Index of first new item
          setCurrentQueueIndex(newIndex);
          handleChangeSource(newItems[0]?.url || null);
        }
      }
    } catch (error) {
      console.error('Error adding YouTube playlist:', error);
      throw error; // Re-throw so UI can handle the error
    }
  }, [youTubeHooks, generateQueueId, queue.length, currentQueueIndex, handleChangeSource]);

  /**
   * Plays item at specific index in queue
   * @param index - Index of item to play
   */
  const playIndex = useCallback((index: number) => {
    if (index >= 0 && index < queue.length && queue[index]) {
      setCurrentQueueIndex(index);
      handleChangeSource(queue[index]!.url);
    }
  }, [queue, handleChangeSource]);

  /**
   * Plays next item in queue
   */
  const next = useCallback(() => {
    if (queue.length > 0 && currentQueueIndex < queue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      playIndex(nextIndex);
    }
  }, [queue.length, currentQueueIndex, playIndex]);

  /**
   * Plays previous item in queue
   */
  const prev = useCallback(() => {
    if (queue.length > 0 && currentQueueIndex > 0) {
      const prevIndex = currentQueueIndex - 1;
      playIndex(prevIndex);
    }
  }, [queue.length, currentQueueIndex, playIndex]);

  /**
   * Removes item at specific index from queue
   * @param index - Index of item to remove
   */
  const removeAt = useCallback((index: number) => {
    if (index >= 0 && index < queue.length && queue[index]) {
      const itemToRemove = queue[index]!;
      
      // Clean up Object URL only for local items (YouTube URLs don't need cleanup)
      if (isLocalQueueItem(itemToRemove)) {
        cleanupPreviousUrl(itemToRemove.url);
      }
      
      // Remove from queue
      setQueue((prevQueue) => prevQueue.filter((_, i) => i !== index));
      
      // Adjust current index
      if (index === currentQueueIndex) {
        // If removing current item, try to play next or previous
        if (index < queue.length - 1) {
          // Play next item (which will now be at the same index)
          setCurrentQueueIndex(index);
        } else if (index > 0) {
          // Play previous item
          setCurrentQueueIndex(index - 1);
          const prevItem = queue[index - 1];
          if (prevItem) {
            handleChangeSource(prevItem.url);
          }
        } else {
          // No items left
          setCurrentQueueIndex(-1);
          handleChangeSource(null);
        }
      } else if (index < currentQueueIndex) {
        // Adjust index if removing item before current
        setCurrentQueueIndex(currentQueueIndex - 1);
      }
    }
  }, [queue, currentQueueIndex, cleanupPreviousUrl, handleChangeSource]);

  /**
   * Clears entire queue and stops playback
   */
  const clearQueue = useCallback(() => {
    // Clean up Object URLs only for local items (YouTube URLs don't need cleanup)
    queue.forEach((item) => {
      if (isLocalQueueItem(item)) {
        cleanupPreviousUrl(item.url);
      }
    });
    
    // Clear queue and reset state
    setQueue([]);
    setCurrentQueueIndex(-1);
    handleChangeSource(null);
  }, [queue, cleanupPreviousUrl, handleChangeSource]);

  /**
   * Enhanced video ended handler with auto-advance
   */
  const handleVideoEnded = useCallback(() => {
    // Auto-advance to next item if available
    if (queue.length > 0 && currentQueueIndex < queue.length - 1) {
      next();
    }
  }, [queue.length, currentQueueIndex, next]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || isSourceChangingRef.current) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      // Use the new prepareAndPlay method for robust playback
      prepareAndPlay();
    }
  }, [isPlaying, prepareAndPlay]);

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (video) {
      const newVolume = (value && typeof value[0] === "number" ? value[0] : 0) / 100;
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const progress =
        (video.currentTime / (video.duration || 1)) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    }
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (video && video.duration) {
      const time = (value / 100) * video.duration;
      if (isFinite(time)) {
        video.currentTime = time;
        setProgress(value);
      }
    }
  };

  const handleSeekSeconds = useCallback((delta: number) => {
    const video = videoRef.current;
    if (video && video.duration) {
      let newTime = video.currentTime + delta;
      newTime = Math.max(0, Math.min(newTime, video.duration));
      video.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress((newTime / video.duration) * 100);
    }
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      const willBeMuted = !video.muted;
      video.muted = willBeMuted;
      setIsMuted(willBeMuted);
      if (willBeMuted) {
        setVolume(0);
      } else {
        setVolume(video.volume ?? 0.7);
        video.volume = video.volume ?? 0.7;
      }
    }
  };

  const setSpeed = (speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handlePresetChange = (presetName: string) => {
    setPreset(presetName);
    if (presetName !== "Custom") {
      const presetObj = PRESETS.find((p) => p.name === presetName);
      if (presetObj) setCustomGain(presetObj.gain);
    }
  };

  const handleCustomGainChange = (value: number[]) => {
    setCustomGain(typeof value[0] === "number" ? value[0] : 0);
    setPreset("Custom");
  };

  // Cleanup Object URLs on component unmount and videoURL changes
  useEffect(() => {
    return () => {
      // Clean up current Object URL on unmount
      if (previousObjectURLRef.current) {
        cleanupPreviousUrl(previousObjectURLRef.current);
      }
      // Clean up Object URLs only for local items on unmount
      queue.forEach((item) => {
        if (isLocalQueueItem(item)) {
          cleanupPreviousUrl(item.url);
        }
      });
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [cleanupPreviousUrl, queue]);

  /**
   * Feature detection for Fullscreen API with vendor prefixes
   * @returns Object with fullscreen API methods or null if not supported
   */
  const getFullscreenAPI = useCallback(() => {
    if (typeof document === 'undefined') return null;

    // Check for standard and vendor-prefixed fullscreen API
    if (document.fullscreenEnabled || document.fullscreenEnabled === false) {
      return {
        requestFullscreen: 'requestFullscreen',
        exitFullscreen: 'exitFullscreen',
        fullscreenElement: 'fullscreenElement',
        fullscreenchange: 'fullscreenchange',
        fullscreenerror: 'fullscreenerror'
      };
    } else if ((document as any).webkitFullscreenEnabled) {
      return {
        requestFullscreen: 'webkitRequestFullscreen',
        exitFullscreen: 'webkitExitFullscreen',
        fullscreenElement: 'webkitFullscreenElement',
        fullscreenchange: 'webkitfullscreenchange',
        fullscreenerror: 'webkitfullscreenerror'
      };
    } else if ((document as any).mozFullScreenEnabled) {
      return {
        requestFullscreen: 'mozRequestFullScreen',
        exitFullscreen: 'mozCancelFullScreen',
        fullscreenElement: 'mozFullScreenElement',
        fullscreenchange: 'mozfullscreenchange',
        fullscreenerror: 'mozfullscreenerror'
      };
    } else if ((document as any).msFullscreenEnabled) {
      return {
        requestFullscreen: 'msRequestFullscreen',
        exitFullscreen: 'msExitFullscreen',
        fullscreenElement: 'msFullscreenElement',
        fullscreenchange: 'MSFullscreenChange',
        fullscreenerror: 'MSFullscreenError'
      };
    }
    return null;
  }, []);

  /**
   * Requests fullscreen for the video player container
   * @param triggerElement - Element that triggered fullscreen (for focus management)
   */
  const requestFullscreen = useCallback(async (triggerElement?: HTMLElement) => {
    const video = videoRef.current;
    if (!video) return;

    const api = getFullscreenAPI();
    if (!api) {
      console.warn('Fullscreen API not supported');
      return;
    }

    try {
      // Store the trigger element for focus restoration
      if (triggerElement) {
        fullscreenTriggerRef.current = triggerElement;
      }

      // Request fullscreen on the video element
      const requestMethod = (video as any)[api.requestFullscreen];
      if (requestMethod) {
        await requestMethod.call(video);
      }
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
    }
  }, [getFullscreenAPI]);

  /**
   * Exits fullscreen mode
   */
  const exitFullscreen = useCallback(async () => {
    const api = getFullscreenAPI();
    if (!api) return;

    try {
      const exitMethod = (document as any)[api.exitFullscreen];
      if (exitMethod) {
        await exitMethod.call(document);
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  }, [getFullscreenAPI]);

  /**
   * Toggles fullscreen mode
   * @param triggerElement - Element that triggered the toggle (for focus management)
   */
  const toggleFullscreen = useCallback(async (triggerElement?: HTMLElement) => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await requestFullscreen(triggerElement);
    }
  }, [isFullscreen, exitFullscreen, requestFullscreen]);

  /**
   * Handles fullscreen change events to update state
   */
  const handleFullscreenChange = useCallback(() => {
    const api = getFullscreenAPI();
    if (!api) return;

    const fullscreenElement = (document as any)[api.fullscreenElement];
    const isCurrentlyFullscreen = Boolean(fullscreenElement);
    
    setIsFullscreen(isCurrentlyFullscreen);

    // Restore focus to trigger element when exiting fullscreen
    if (!isCurrentlyFullscreen && fullscreenTriggerRef.current) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        if (fullscreenTriggerRef.current) {
          fullscreenTriggerRef.current.focus();
          fullscreenTriggerRef.current = null;
        }
      }, 100);
    }
  }, [getFullscreenAPI]);

  /**
   * Handles fullscreen error events
   */
  const handleFullscreenError = useCallback((event: Event) => {
    console.error('Fullscreen error:', event);
    setIsFullscreen(false);
    
    // Restore focus on error
    if (fullscreenTriggerRef.current) {
      fullscreenTriggerRef.current.focus();
      fullscreenTriggerRef.current = null;
    }
  }, []);

  // Fullscreen event listeners
  useEffect(() => {
    const api = getFullscreenAPI();
    if (!api) return;

    document.addEventListener(api.fullscreenchange, handleFullscreenChange);
    document.addEventListener(api.fullscreenerror, handleFullscreenError);

    return () => {
      document.removeEventListener(api.fullscreenchange, handleFullscreenChange);
      document.removeEventListener(api.fullscreenerror, handleFullscreenError);
    };
  }, [getFullscreenAPI, handleFullscreenChange, handleFullscreenError]);

  // Keyboard bindings for left/right arrow seek, 'f' for fullscreen, and Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior if we're handling the key
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSeekSeconds(-5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSeekSeconds(5);
      } else if (e.key === "f" || e.key === "F") {
        // Only handle 'f' key if not typing in an input
        if (e.target && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          toggleFullscreen();
        }
      } else if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        exitFullscreen();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSeekSeconds, toggleFullscreen, exitFullscreen, isFullscreen]);

  return {
    refs: { videoRef },
    state: {
      isPlaying,
      volume,
      progress,
      isMuted,
      playbackSpeed,
      showControls,
      currentTime,
      duration,
      bassBoost: preset === "Custom" ? customGain : PRESETS.find((p) => p.name === preset)?.gain ?? 5,
      isOffline,
      savedVideos,
      videoURL,
      preset,
      customGain,
      PRESETS,
      bassBoostEnabled,
      // Queue state
      queue,
      currentQueueIndex,
      // Fullscreen state
      isFullscreen,
    },
    setState: {
      setShowControls,
      setBassBoostEnabled,
      setIsPlaying,
    },
    methods: {
      handleFileChange,
      handleChangeSource,
      prepareAndPlay,
      cleanupPreviousUrl,
      togglePlay,
      handleVolumeChange,
      handleTimeUpdate,
      handleSeek,
      handleSeekSeconds,
      toggleMute,
      setSpeed,
      handlePresetChange,
      handleCustomGainChange,
      // Queue methods
      addFiles,
      addYouTubePlaylist,
      playIndex,
      next,
      prev,
      removeAt,
      clearQueue,
      handleVideoEnded,
      // Fullscreen methods
      toggleFullscreen,
      requestFullscreen,
      exitFullscreen,
    },
  };
};

export default useASMRVideoPlayer;
