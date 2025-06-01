"use client";

import React from "react";
import useASMRVideoPlayer from "./ASMRVideoPlayer.module";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  WifiOff
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

// Custom slider for video progress
const CustomSlider = ({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-secondary/50 rounded-full cursor-pointer",
        className
      )}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <motion.div
        className="absolute top-0 left-0 h-full bg-primary rounded-full"
        style={{ width: `${value}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
};

// Theme toggle component using next-themes
interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

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
            <Moon
              className="w-4 h-4 text-foreground"
              strokeWidth={1.5}
            />
          ) : (
            <Sun
              className="w-4 h-4 text-foreground"
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark
              ? "bg-transparent"
              : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun
              className="w-4 h-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          ) : (
            <Moon
              className="w-4 h-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ASMRVideoPlayer = () => {
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
    },
    setState: { setShowControls },
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
  } = useASMRVideoPlayer();

  // File input handler
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  return (
    <Card className={cn("relative w-full max-w-4xl mx-auto overflow-hidden transition-colors duration-300")}>
      <div className="p-4 flex justify-between items-center border-b border-border">
        <h2 className="text-lg font-medium text-foreground">ASMR Video Player</h2>
        <div className="flex items-center gap-3">
          {isOffline ? (
            <WifiOff className="h-5 w-5 text-destructive" />
          ) : (
            <Wifi className="h-5 w-5 text-primary" />
          )}
          <ThemeToggle />
        </div>
      </div>

      <div className="p-4">
        <label className="block mb-4">
          <span className="text-sm font-medium">Load Video File</span>
          <input
            type="file"
            accept="video/*"
            className="block mt-1"
            onChange={onFileInputChange}
          />
        </label>
      </div>

      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {videoURL ? (
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            onTimeUpdate={handleTimeUpdate}
            src={videoURL}
            onClick={togglePlay}
          />
        ) : (
          <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
            Select a video file to begin
          </div>
        )}

        <AnimatePresence>
          {showControls && videoURL && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-foreground text-sm">
                  {formatTime(currentTime)}
                </span>
                <CustomSlider
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-foreground text-sm">{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      onClick={togglePlay}
                      variant="ghost"
                      size="icon"
                      className="text-foreground hover:bg-secondary"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                  </motion.div>
                  <div className="flex items-center gap-x-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        onClick={toggleMute}
                        variant="ghost"
                        size="icon"
                        className="text-foreground hover:bg-secondary"
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : volume > 0.5 ? (
                          <Volume2 className="h-5 w-5" />
                        ) : (
                          <Volume1 className="h-5 w-5" />
                        )}
                      </Button>
                    </motion.div>

                    <div className="w-24">
                      <Slider
                        value={[volume * 100]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="h-2 [&_[role=slider]]:bg-primary [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      key={speed}
                    >
                      <Button
                        onClick={() => setSpeed(speed)}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "text-foreground hover:bg-secondary",
                          playbackSpeed === speed && "bg-secondary"
                        )}
                      >
                        {speed}x
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Tabs defaultValue="equalizer" className="p-4">
        <TabsList className="mb-4">
          <TabsTrigger value="equalizer">Equalizer</TabsTrigger>
        </TabsList>

        <TabsContent value="equalizer" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {PRESETS.filter((p) => p.name !== "Custom").map((presetObj) => (
                <Button
                  key={presetObj.name}
                  variant={preset === presetObj.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(presetObj.name)}
                >
                  {presetObj.name}
                </Button>
              ))}
              <Button
                variant={preset === "Custom" ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetChange("Custom")}
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
                />
              </div>
            )}
            {preset !== "Custom" && (
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Bass Gain: {bassBoost} dB
                </Label>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ASMRVideoPlayer;
