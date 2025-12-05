"use client";

import React, { useRef, useState, useEffect } from "react";
import useASMRVideoPlayer from "./ASMRVideoPlayer.module";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Loader2,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Maximize,
  Minimize,
  Music2,
  ListMusic,
  Sparkles,
  Waves,
  MonitorPlay,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Format time for video player
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Custom Switch with ethereal styling
const Switch = ({
  checked,
  onChange,
  label,
  className = "",
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}) => (
  <label className={cn("flex items-center gap-3 cursor-pointer group", className, disabled && "opacity-50 cursor-not-allowed")}>
    {label && (
      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
        {label}
      </span>
    )}
    <button
      type="button"
      className={cn(
        "relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300",
        checked
          ? "bg-gradient-to-r from-amber to-amber-glow shadow-glow-amber"
          : "bg-secondary/60 hover:bg-secondary/80"
      )}
      aria-checked={checked}
      role="switch"
      tabIndex={0}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full transition-all duration-300 shadow-lg",
          checked
            ? "translate-x-8 bg-white"
            : "translate-x-1 bg-muted-foreground/60"
        )}
      />
    </button>
  </label>
);

const ASMRVideoPlayer = () => {
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showQueue, setShowQueue] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Playlist state
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlist, setPlaylist] = useState<{ id: string; title: string }[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [ytVideoUrl, setYtVideoUrl] = useState<string | null>(null);
  const [ytLoading, setYtLoading] = useState(false);

  // Local file state
  const [localVideoURL, setLocalVideoURL] = useState<string | null>(null);

  const {
    refs: { videoRef },
    state: {
      isPlaying,
      volume,
      progress,
      isMuted,
      playbackSpeed,
      currentTime,
      duration,
      preset,
      customGain,
      PRESETS,
      bassBoostEnabled,
      queue,
      currentQueueIndex,
      isFullscreen,
    },
    setState: { setBassBoostEnabled, setIsPlaying },
    methods: {
      cleanupPreviousUrl,
      togglePlay,
      handleVolumeChange,
      handleTimeUpdate,
      handleSeek,
      toggleMute,
      setSpeed,
      handlePresetChange,
      handleCustomGainChange,
      addFiles,
      playIndex,
      next,
      prev,
      removeAt,
      clearQueue,
      handleVideoEnded,
      toggleFullscreen,
    },
  } = useASMRVideoPlayer();

  // File input handler
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (localVideoURL) {
      cleanupPreviousUrl(localVideoURL);
    }

    setCurrentIndex(null);
    setYtVideoUrl(null);
    setLocalVideoURL(null);

    addFiles(files);
  };

  // Playlist import handler
  const handleImportPlaylist = async () => {
    setPlaylistLoading(true);
    setPlaylistError(null);
    setPlaylist([]);
    setCurrentIndex(null);
    setYtVideoUrl(null);
    setLocalVideoURL(null);
    try {
      const res = await fetch("/api/yt-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: playlistUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import playlist");
      setPlaylist(data.playlist);
      setCurrentIndex(0);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      setPlaylistError(errorMessage);
    } finally {
      setPlaylistLoading(false);
    }
  };

  // Fetch stream URL for current playlist video
  React.useEffect(() => {
    if (
      playlist.length > 0 &&
      currentIndex !== null &&
      currentIndex >= 0 &&
      currentIndex < playlist.length &&
      playlist[currentIndex] !== undefined
    ) {
      setYtLoading(true);
      setYtVideoUrl(null);
      fetch("/api/yt-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: playlist[currentIndex]!.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setYtVideoUrl(data.url || null);
        })
        .catch(() => setYtVideoUrl(null))
        .finally(() => setYtLoading(false));
    }
  }, [playlist, currentIndex]);

  // Enhanced ended handler
  const handleEnded = () => {
    if (queue.length > 0 && currentQueueIndex >= 0) {
      handleVideoEnded();
      return;
    }

    if (
      playlist.length > 0 &&
      currentIndex !== null &&
      currentIndex < playlist.length - 1
    ) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Determine video source
  const videoSrc = queue.length > 0 && currentQueueIndex >= 0 && queue[currentQueueIndex]
    ? queue[currentQueueIndex]!.url
    : localVideoURL
    ? localVideoURL
    : ytVideoUrl
    ? ytVideoUrl
    : null;

  // Current video name
  const currentVideoName = queue.length > 0 && currentQueueIndex >= 0 && queue[currentQueueIndex]
    ? queue[currentQueueIndex]!.title
    : playlist.length > 0 && currentIndex !== null && playlist[currentIndex]
    ? playlist[currentIndex]!.title
    : null;

  // Space key for play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (videoSrc) {
          togglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoSrc, togglePlay]);

  return (
    <div className={cn(
      "w-full transition-all duration-500",
      cinemaMode && "max-w-none"
    )}>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* File & Playlist Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={onFileInputChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="btn-glow bg-gradient-to-r from-amber/90 to-amber hover:from-amber hover:to-amber-glow text-primary-foreground gap-2 rounded-xl shadow-lg hover:shadow-glow-amber transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Add Videos
          </Button>

          {queue.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/40 backdrop-blur-sm">
              <ListMusic className="h-4 w-4 text-teal" />
              <span className="text-sm text-foreground/80">
                {queue.length} video{queue.length !== 1 ? "s" : ""}
              </span>
              <Button
                onClick={clearQueue}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Mode Toggles */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQueue(!showQueue)}
            className={cn(
              "gap-2 rounded-xl transition-all duration-300",
              showQueue && "bg-secondary/60"
            )}
          >
            <ListMusic className="h-4 w-4" />
            Queue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCinemaMode(!cinemaMode)}
            className={cn(
              "gap-2 rounded-xl transition-all duration-300",
              cinemaMode && "bg-secondary/60 text-amber"
            )}
          >
            <MonitorPlay className="h-4 w-4" />
            {cinemaMode ? "Exit Cinema" : "Cinema"}
          </Button>
        </div>
      </div>

      {/* YouTube Playlist Import */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 p-4 rounded-2xl glass">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Music2 className="h-5 w-5" />
          <span className="text-sm font-medium">YouTube</span>
        </div>
        <input
          type="text"
          placeholder="Paste YouTube playlist URL..."
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          className="flex-1 bg-background/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/30 transition-all"
        />
        <Button
          onClick={handleImportPlaylist}
          disabled={playlistLoading || !playlistUrl}
          className="btn-glow bg-gradient-to-r from-violet/80 to-violet hover:from-violet hover:to-violet-glow text-white gap-2 rounded-xl shadow-lg hover:shadow-glow-violet transition-all duration-300"
        >
          {playlistLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Importing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Import
            </>
          )}
        </Button>
        {playlistError && (
          <span className="text-xs text-destructive">{playlistError}</span>
        )}
      </div>

      {/* Main Content Layout */}
      <div className={cn(
        "grid gap-6 transition-all duration-500",
        cinemaMode
          ? "grid-cols-1"
          : showQueue && (queue.length > 0 || playlist.length > 0)
          ? "lg:grid-cols-[1fr_320px]"
          : "grid-cols-1"
      )}>
        {/* Video Player Section */}
        <div className="space-y-4">
          {/* Video Container */}
          <div className="video-container relative group">
            {videoSrc ? (
              <>
                <video
                  ref={videoRef}
                  className={cn(
                    "w-full aspect-video bg-black/90 rounded-3xl shadow-ambient-lg transition-all duration-300",
                    cinemaMode ? "max-h-[75vh]" : "max-h-[65vh]"
                  )}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  src={videoSrc}
                  onClick={togglePlay}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    toggleFullscreen(e.currentTarget);
                  }}
                  tabIndex={0}
                  controls={false}
                  autoPlay
                  onEnded={handleEnded}
                />
                {/* Video Overlay - Play/Pause indicator */}
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300",
                  isPlaying ? "opacity-0" : "opacity-100"
                )}>
                  <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-10 w-10 text-white ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full aspect-video rounded-3xl bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/30 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Waves className="h-10 w-10 text-amber/60" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-display text-xl">Begin Your Journey</p>
                  <p className="text-sm">Add videos or import a playlist to start</p>
                </div>
              </div>
            )}

            {/* Current Video Title Overlay */}
            {currentVideoName && (
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="glass-heavy rounded-xl px-4 py-2 max-w-md">
                  <p className="text-sm font-medium truncate">{currentVideoName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="glass-heavy rounded-2xl p-4 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative group/progress">
                <Slider
                  value={[progress]}
                  min={0}
                  max={100}
                  step={0.1}
                  onValueChange={([val = 0]) => handleSeek(val)}
                  disabled={!videoSrc}
                  className="h-2 cursor-pointer [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-amber [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-glow-amber group-hover/progress:[&_[role=slider]]:scale-125 [&_[role=slider]]:transition-transform"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls Row */}
            <div className="flex items-center justify-between">
              {/* Left: Playback Controls */}
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <Button
                    onClick={prev}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-secondary/80 transition-all"
                    disabled={currentQueueIndex <= 0}
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                )}

                <Button
                  onClick={togglePlay}
                  size="icon"
                  className="h-14 w-14 rounded-full bg-gradient-to-r from-amber to-amber-glow hover:shadow-glow-amber transition-all duration-300 hover:scale-105"
                  disabled={!videoSrc}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-0.5" />
                  )}
                </Button>

                {queue.length > 0 && (
                  <Button
                    onClick={next}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl hover:bg-secondary/80 transition-all"
                    disabled={currentQueueIndex >= queue.length - 1}
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Center: Volume Control */}
              <div className="flex items-center gap-3 flex-1 max-w-xs mx-8">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-secondary/80 shrink-0"
                  disabled={!videoSrc}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : volume > 0.5 ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <Volume1 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  disabled={!videoSrc}
                  className="flex-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:bg-teal [&_[role=slider]]:border-0"
                />
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>

              {/* Right: Speed & Fullscreen */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-secondary/40">
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <Button
                      key={speed}
                      onClick={() => setSpeed(speed)}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2 rounded-lg text-xs transition-all",
                        playbackSpeed === speed
                          ? "bg-teal/20 text-teal"
                          : "hover:bg-secondary/60"
                      )}
                      disabled={!videoSrc}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={(e) => toggleFullscreen(e.currentTarget)}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-secondary/80 transition-all"
                  disabled={!videoSrc}
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Bass Boost Panel */}
          <BassBoostPanel
            bassBoostEnabled={bassBoostEnabled}
            setBassBoostEnabled={setBassBoostEnabled}
            PRESETS={PRESETS}
            preset={preset}
            handlePresetChange={handlePresetChange}
            customGain={customGain}
            handleCustomGainChange={handleCustomGainChange}
          />
        </div>

        {/* Queue Sidebar */}
        {showQueue && (queue.length > 0 || playlist.length > 0) && !cinemaMode && (
          <div className="glass-heavy rounded-2xl p-4 h-fit max-h-[600px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <ListMusic className="h-5 w-5 text-amber" />
                Queue
              </h3>
              <span className="text-xs text-muted-foreground px-2 py-1 rounded-lg bg-secondary/50">
                {queue.length > 0 ? queue.length : playlist.length} items
              </span>
            </div>

            <div className="overflow-y-auto flex-1 -mx-2 px-2 space-y-1">
              {/* Local Queue Items */}
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    "queue-item group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-secondary/40",
                    idx === currentQueueIndex && "active bg-amber/10"
                  )}
                  onClick={() => {
                    // Don't reload if clicking the currently playing item
                    if (idx !== currentQueueIndex) {
                      playIndex(idx);
                    }
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    idx === currentQueueIndex
                      ? "bg-amber/20 text-amber"
                      : "bg-secondary/50 text-muted-foreground"
                  )}>
                    {idx === currentQueueIndex && isPlaying ? (
                      <Waves className="h-4 w-4 animate-pulse" />
                    ) : (
                      <span className="text-xs font-mono">{idx + 1}</span>
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm">{item.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(idx);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* YouTube Playlist Items */}
              {playlist.length > 0 && queue.length === 0 && playlist.map((item, idx) => (
                <div
                  key={item.id}
                  className={cn(
                    "queue-item group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-secondary/40",
                    idx === currentIndex && "active bg-violet/10"
                  )}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setLocalVideoURL(null);
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    idx === currentIndex
                      ? "bg-violet/20 text-violet"
                      : "bg-secondary/50 text-muted-foreground"
                  )}>
                    {idx === currentIndex && ytLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : idx === currentIndex && isPlaying ? (
                      <Waves className="h-4 w-4 animate-pulse" />
                    ) : (
                      <span className="text-xs font-mono">{idx + 1}</span>
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Bass Boost Panel Component
function BassBoostPanel({
  bassBoostEnabled,
  setBassBoostEnabled,
  PRESETS,
  preset,
  handlePresetChange,
  customGain,
  handleCustomGainChange,
}: {
  bassBoostEnabled: boolean;
  setBassBoostEnabled: (v: boolean) => void;
  PRESETS: { name: string; gain: number }[];
  preset: string;
  handlePresetChange: (name: string) => void;
  customGain: number;
  handleCustomGainChange: (v: number[]) => void;
}) {
  return (
    <div className="glass rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
            bassBoostEnabled
              ? "bg-gradient-to-br from-amber/20 to-teal/20 shadow-lg"
              : "bg-secondary/50"
          )}>
            <Waves className={cn(
              "h-5 w-5 transition-colors",
              bassBoostEnabled ? "text-amber" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h3 className="font-display font-semibold">Bass Boost</h3>
            <p className="text-xs text-muted-foreground">Enhance low frequencies</p>
          </div>
        </div>
        <Switch
          checked={bassBoostEnabled}
          onChange={setBassBoostEnabled}
        />
      </div>

      {bassBoostEnabled && (
        <div className="space-y-4 pt-2 animate-fade-in">
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.filter((p) => p.name !== "Custom").map((presetObj) => (
              <Button
                key={presetObj.name}
                variant="ghost"
                size="sm"
                onClick={() => handlePresetChange(presetObj.name)}
                className={cn(
                  "rounded-xl transition-all duration-300",
                  preset === presetObj.name
                    ? "bg-gradient-to-r from-amber/20 to-teal/20 text-foreground border border-amber/30"
                    : "hover:bg-secondary/60"
                )}
              >
                {presetObj.name}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePresetChange("Custom")}
              className={cn(
                "rounded-xl transition-all duration-300",
                preset === "Custom"
                  ? "bg-gradient-to-r from-violet/20 to-teal/20 text-foreground border border-violet/30"
                  : "hover:bg-secondary/60"
              )}
            >
              Custom
            </Button>
          </div>

          {/* Custom Gain Slider */}
          {preset === "Custom" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Gain Level</Label>
                <span className="text-sm font-mono text-amber">{customGain} dB</span>
              </div>
              <Slider
                value={[customGain]}
                min={0}
                max={30}
                step={1}
                onValueChange={handleCustomGainChange}
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:bg-violet [&_[role=slider]]:border-0"
              />
            </div>
          )}

          {/* Current Gain Display */}
          {preset !== "Custom" && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/30">
              <span className="text-sm text-muted-foreground">Current Gain</span>
              <span className="font-mono text-amber">
                {PRESETS.find((p) => p.name === preset)?.gain ?? 0} dB
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ASMRVideoPlayer;
