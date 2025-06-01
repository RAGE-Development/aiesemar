import { useRef, useState, useEffect } from "react";

const PRESETS = [
  { name: "Default", gain: 5 },
  { name: "High", gain: 10 },
  { name: "Very High", gain: 20 },
  { name: "Insane", gain: 30 },
  { name: "Custom", gain: 0 }, // Custom gain will be set by user
];

const LOWSHELF_FREQ = 800;

const useASMRVideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [preset, setPreset] = useState(PRESETS[0].name);
  const [customGain, setCustomGain] = useState(5);
  const [isOffline, setIsOffline] = useState(false);
  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);

  // Initialize audio context for bass boost
  useEffect(() => {
    if (videoRef.current && !audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(videoRef.current);

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

  // Update bass boost when preset or customGain changes
  useEffect(() => {
    if (bassFilterRef.current) {
      let gain = customGain;
      const presetObj = PRESETS.find((p) => p.name === preset);
      if (presetObj && presetObj.name !== "Custom") {
        gain = presetObj.gain;
      }
      bassFilterRef.current.gain.value = gain;
    }
  }, [preset, customGain]);

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

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoURL(url);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0] / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(value);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(0.7);
        videoRef.current.volume = 0.7;
      }
    }
  };

  const setSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
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
    },
    setState: {
      setShowControls,
    },
    methods: {
      handleFileChange,
      togglePlay,
      handleVolumeChange,
      handleTimeUpdate,
      handleSeek,
      toggleMute,
      setSpeed,
      handlePresetChange,
      handleCustomGainChange,
    },
  };
};

export default useASMRVideoPlayer;
