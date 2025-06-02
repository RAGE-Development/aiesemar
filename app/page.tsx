import ThemeSwitcher from "./_components/ThemeSwitcher";
import ASMRVideoPlayer from "./_components/ASMRVideoPlayer/ASMRVideoPlayer";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-background/90 border-b border-border shadow-sm fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <img src="/favicon.svg" alt="AIESEMAR" className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight">
            {'AIESEMAR'}
          </span>
          <span className="ml-2 text-lg font-medium text-muted-foreground hidden sm:inline">
            {'(ASMR)'}
          </span>
          <div className="flex-1" />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-8 px-2 bg-background">
        <ASMRVideoPlayer />
      </main>
    </div>
  );
}
