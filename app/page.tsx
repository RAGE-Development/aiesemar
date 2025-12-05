import Image from "next/image";
import ThemeSwitcher from "./_components/ThemeSwitcher";
import ASMRVideoPlayer from "./_components/ASMRVideoPlayer/ASMRVideoPlayer";

export default function Page() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-cosmic noise overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb orb-amber w-[500px] h-[500px] -top-32 -right-32 animate-float opacity-20" />
        <div className="orb orb-violet w-[600px] h-[600px] top-1/3 -left-48 animate-float-delayed opacity-15" />
        <div className="orb orb-teal w-[400px] h-[400px] bottom-0 right-1/4 animate-float opacity-20" />
      </div>

      {/* Header */}
      <header className="w-full glass-heavy border-b border-border/30 fixed top-0 left-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/favicon.svg"
                alt="AIESEMAR"
                width={40}
                height={40}
                className="h-10 w-10 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-amber/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                AIESEMAR
              </h1>
              <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
                Ethereal Sound
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Navigation hint */}
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-secondary/50 text-xs font-mono">Space</kbd>
              <span>Play/Pause</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-secondary/50 text-xs font-mono">F</kbd>
              <span>Fullscreen</span>
            </span>
          </div>

          {/* Theme Switcher */}
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 pt-24 pb-12 px-4 md:px-6 z-10">
        <div className="max-w-[1600px] mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <ASMRVideoPlayer />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full py-6 z-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="font-display italic">
            Immerse yourself in sound
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              Audio Enhanced
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
