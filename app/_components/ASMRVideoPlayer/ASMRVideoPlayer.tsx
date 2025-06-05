"use client";

import React, { useRef, useState } from "react";
import useASMRVideoPlayer from "./ASMRVideoPlayer.module";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Film,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Format time for video player
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Switch component for toggles (improved for light mode)
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
  <label className={cn("flex items-center gap-2 cursor-pointer", className, disabled && "opacity-50")}>
    <span className="text-sm">{label}</span>
    <button
      type="button"
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors border",
        checked
          ? "bg-primary border-primary"
          : "bg-gray-200 border-gray-400 dark:bg-zinc-800 dark:border-zinc-700"
      )}
      aria-checked={checked}
      role="switch"
      tabIndex={0}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full transition-transform",
          checked
            ? "translate-x-6 bg-white border border-gray-300"
            : "translate-x-1 bg-gray-400 border border-gray-500 dark:bg-zinc-600 dark:border-zinc-700"
        )}
      />
    </button>
  </label>
);

const ASMRVideoPlayer = () => {
  const [cinemaMode, setCinemaMode] = useState(false);
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
      showControls,
      currentTime,
      duration,
      bassBoost,
      videoURL,
      preset,
      customGain,
      PRESETS,
      bassBoostEnabled,
    },
    setState: { setShowControls, setBassBoostEnabled },
    methods: {
      handleFileChange,
      togglePlay,
      handleVolumeChange,
      handleTimeUpdate,
      handleSeek,
      handleSeekSeconds,
      toggleMute,
      setSpeed,
      handlePresetChange,
      handleCustomGainChange,
    },
  } = useASMRVideoPlayer();

  // File input handler
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
    if (file) {
      setLocalVideoURL(URL.createObjectURL(file));
      setCurrentIndex(null);
      setYtVideoUrl(null);
    }
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
    } catch (e: any) {
      setPlaylistError(e.message || "Unknown error");
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

  // Autoplay next video in playlist
  const handleEnded = () => {
    if (
      playlist.length > 0 &&
      currentIndex !== null &&
      currentIndex < playlist.length - 1
    ) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Layout classes with responsive design
  const mainLayout = cinemaMode
    ? "flex flex-col items-center w-full"
    : "flex flex-col lg:flex-row w-full gap-4 lg:gap-8 items-start";

  const playerWrapper = cinemaMode
    ? "w-full flex flex-col items-center"
    : "w-full lg:flex-1 lg:min-w-[320px]";

  const controlsWrapper = cinemaMode
    ? "w-full flex flex-row justify-center mt-4"
    : "w-full lg:w-[340px] lg:min-w-[260px] flex flex-col gap-4";

  // File select header with responsive design
  const fileSelectHeader = (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-start mb-4 gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onFileInputChange}
      />
      <div className="flex items-center gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="default"
          size="sm"
        >
          Select Video
        </Button>
        {localVideoURL && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
            {(() => {
              try {
                const url = new URL(localVideoURL);
                return decodeURIComponent(url.pathname.split("/").pop() || "");
              } catch {
                return "";
              }
            })()}
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:ml-8">
        <input
          type="text"
          placeholder="Paste YouTube playlist URL"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          className="px-2 py-1 border rounded text-sm w-full sm:w-64"
        />
        <Button
          onClick={handleImportPlaylist}
          size="sm"
          disabled={playlistLoading || !playlistUrl}
          className="whitespace-nowrap"
        >
          {playlistLoading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Importing...
            </>
          ) : (
            "Import Playlist"
          )}
        </Button>
      </div>
      {playlistError && (
        <span className="text-xs text-red-500 break-words">{playlistError}</span>
      )}
    </div>
  );

  // Determine which video source to use
  const videoSrc = localVideoURL
    ? localVideoURL
    : ytVideoUrl
    ? ytVideoUrl
    : null;

  // Playback bar handler
  const onPlaybackSliderChange = (val: number) => {
    handleSeek(val);
  };

  return (
    <div className={cn("w-full", cinemaMode ? "flex flex-col items-center" : "")}>
      {/* Cinema mode toggle */}
      <div className="w-full flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCinemaMode((v) => !v)}
          className="gap-2"
        >
          <Film className="h-5 w-5" />
          {cinemaMode ? "Exit Cinema" : "Cinema Mode"}
        </Button>
      </div>
      <div className={mainLayout}>
        {/* File select header above player */}
        <div className={cn(playerWrapper, "flex-col")}>
          {fileSelectHeader}
          <div className="relative w-full">
            {videoSrc ? (
              <video
                ref={videoRef}
                className={cn(
                  "w-full aspect-video bg-black rounded-lg shadow-lg",
                  cinemaMode ? "max-h-[70vh]" : "max-h-[60vh]"
                )}
                onTimeUpdate={handleTimeUpdate}
                src={videoSrc}
                onClick={togglePlay}
                tabIndex={0}
                controls={false}
                autoPlay
                onEnded={handleEnded}
              />
            ) : (
              <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                Select a video file or import a playlist to begin
              </div>
            )}

            {/* Controls (play, pause, mute, speed) */}
            <div className="flex items-center gap-4 mt-2 px-2">
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-secondary"
                disabled={!videoSrc}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-secondary"
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
              <div className="w-24">
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="h-2 [&_[role=slider]]:bg-primary [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:rounded-full"
                  disabled={!videoSrc}
                />
              </div>
              <div className="flex items-center gap-1">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <Button
                    key={speed}
                    onClick={() => setSpeed(speed)}
                    variant={playbackSpeed === speed ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-foreground hover:bg-secondary",
                      playbackSpeed === speed && "bg-secondary"
                    )}
                    disabled={!videoSrc}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>

            {/* Playback bar always visible */}
            <div className="flex items-center gap-2 mt-2 px-2">
              <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
              <Slider
                value={[progress]}
                min={0}
                max={100}
                step={0.1}
                onValueChange={([val = 0]) => onPlaybackSliderChange(val)}
                className="flex-1 h-2 [&_[role=slider]]:bg-primary [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:rounded-full"
                disabled={!videoSrc}
              />
              <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Playlist sidebar - responsive */}
        {playlist.length > 0 && (
          <div className="w-full lg:w-80 lg:min-w-[220px] lg:max-w-xs flex flex-col gap-2 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-4">
            <div className="font-semibold mb-2">Playlist</div>
            {playlist.map((item, idx) => (
              <Button
                key={item.id}
                variant={currentIndex === idx ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start truncate",
                  currentIndex === idx && "font-bold"
                )}
                onClick={() => {
                  setCurrentIndex(idx);
                  setLocalVideoURL(null);
                }}
                disabled={ytLoading && currentIndex === idx}
              >
                {ytLoading && currentIndex === idx ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : null}
                <span className="truncate">{item.title}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Controls to the right in normal mode, below in cinema mode */}
        <div className={controlsWrapper}>
          <BassBoostControls
            {...{
              bassBoostEnabled,
              setBassBoostEnabled,
              PRESETS,
              preset,
              handlePresetChange,
              customGain,
              handleCustomGainChange,
            }}
          />
        </div>
      </div>
    </div>
  );
};

function BassBoostControls({
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
    <Card className="w-full p-4">
      <Switch
        checked={bassBoostEnabled}
        onChange={setBassBoostEnabled}
        label="Bass Boost"
        className="mb-2"
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {PRESETS.filter((p) => p.name !== "Custom").map((presetObj) => (
          <Button
            key={presetObj.name}
            variant={preset === presetObj.name ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetChange(presetObj.name)}
            disabled={!bassBoostEnabled}
          >
            {presetObj.name}
          </Button>
        ))}
        <Button
          variant={preset === "Custom" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetChange("Custom")}
          disabled={!bassBoostEnabled}
        >
          Custom
        </Button>
      </div>
      {preset === "Custom" && (
        <div>
          <Label htmlFor="custom-bass" className="text-sm font-medium text-foreground mb-2 block">
            Custom Bass Gain ({customGain} dB)
          </Label>
          <Slider
            id="custom-bass"
            value={[customGain]}
            min={0}
            max={30}
            step={1}
            onValueChange={handleCustomGainChange}
            className="h-2 [&_[role=slider]]:bg-primary [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:rounded-full"
            disabled={!bassBoostEnabled}
          />
        </div>
      )}
      {preset !== "Custom" && (
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Bass Gain: {PRESETS.find((p) => p.name === preset)?.gain ?? 0} dB
          </Label>
        </div>
      )}
    </Card>
  );
}

export default ASMRVideoPlayer;
