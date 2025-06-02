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
  Moon,
  Sun,
  Headphones,
  Wifi,
  WifiOff,
  Film
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Format time for video player
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Theme toggle component using next-themes
interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark
          ? "bg-zinc-950 border border-zinc-800"
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark
              ? "transform translate-x-0 bg-zinc-800"
              : "transform translate-x-8 bg-gray-200"
          )}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark ? "bg-transparent" : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
};

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
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}
      aria-checked={checked}
      role="switch"
      tabIndex={0}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  </label>
);

const ASMRVideoPlayer = () => {
  const [cinemaMode, setCinemaMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      isOffline,
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
  };

  // Video progress slider handler
  const onProgressSliderChange = (value: number) => {
    handleSeek(value);
  };

  // Layout classes
  const mainLayout = cinemaMode
    ? "flex flex-col items-center w-full"
    : "flex flex-row w-full gap-8 items-start";

  const playerWrapper = cinemaMode
    ? "w-full flex flex-col items-center"
    : "flex-1 min-w-[320px]";

  const controlsWrapper = cinemaMode
    ? "w-full flex flex-row justify-center mt-4"
    : "w-[340px] min-w-[260px] flex flex-col gap-4";

  // File select header
  const fileSelectHeader = (
    <div className="w-full flex items-center justify-start mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onFileInputChange}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="default"
        size="sm"
      >
        Select Video
      </Button>
      {videoURL && (
        <span className="ml-4 text-xs text-muted-foreground truncate max-w-[300px]">
          {(() => {
            try {
              const url = new URL(videoURL);
              return decodeURIComponent(url.pathname.split("/").pop() || "");
            } catch {
              return "";
            }
          })()}
        </span>
      )}
    </div>
  );

  return (
    <div className={cn("w-full flex flex-row sm:flex-col", cinemaMode ? "flex flex-col items-center" : "")}>
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
            {videoURL ? (
              <video
                ref={videoRef}
                className={cn(
                  "w-full aspect-video bg-black rounded-lg shadow-lg",
                  cinemaMode ? "max-h-[70vh]" : "max-h-[60vh]"
                )}
                onTimeUpdate={handleTimeUpdate}
                src={videoURL}
                onClick={togglePlay}
                tabIndex={0}
              />
            ) : (
              <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
                Select a video file to begin
              </div>
            )}

            {/* Controls (play, pause, mute, speed) */}
            <div className="flex items-center gap-4 mt-2 px-2">
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-secondary"
                disabled={!videoURL}
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
                disabled={!videoURL}
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
                  disabled={!videoURL}
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
                    disabled={!videoURL}
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
                onValueChange={([val = 0]) => onProgressSliderChange(val)}
                className="flex-1 h-2 [&_[role=slider]]:bg-primary [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:rounded-full"
                disabled={!videoURL}
              />
              <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

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
