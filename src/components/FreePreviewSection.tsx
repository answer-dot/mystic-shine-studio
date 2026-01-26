import { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { cn } from '@/lib/utils';
import previewThumbnail from '@/assets/tarot-preview-thumbnail.jpg';

export const FreePreviewSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const previewData = {
    chapter: 'Chapter 1',
    title: '타로 카드의 세계로 초대',
    duration: '15:32',
    badge: '무료 공개',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  };

  return (
    <section id="free-preview" className="py-20 sm:py-28 bg-secondary/30">
      <div className="section-container">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 inline mr-1" />
            무료 맛보기
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">먼저 체험해보세요</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            결제 전, 강의 퀄리티를 직접 확인하세요
          </p>
        </div>

        {/* Video Preview Card */}
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
          <div className="relative">
            {/* Video Container */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
              {/* Video Area */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
                {isPlaying ? (
                  <VideoPlayer
                    src={previewData.videoUrl}
                    autoPlay
                    className="w-full h-full"
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : (
                  <>
                    {/* Thumbnail */}
                    <img
                      src={previewThumbnail}
                      alt="강의 미리보기"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Play Button Overlay */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group"
                      onClick={() => setIsPlaying(true)}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/50">
                        <Play className="w-7 h-7 sm:w-9 sm:h-9 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Floating Info Bar - overlapping the video */}
            <div className="relative -mt-8 sm:-mt-10 mx-3 sm:mx-6 z-10">
              <div className="backdrop-blur-xl bg-background/80 border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-primary text-xs sm:text-sm font-semibold">
                    {previewData.chapter}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-foreground mt-0.5 sm:mt-1 truncate">
                    {previewData.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                    <span>{previewData.duration}</span>
                    <span>•</span>
                    <span className="text-primary font-medium">{previewData.badge}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsPlaying(true)}
                  className={cn(
                    "px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300",
                    "bg-gradient-to-r from-primary to-orange-500 text-primary-foreground",
                    "hover:shadow-lg hover:shadow-primary/30 hover:scale-105",
                    "flex-shrink-0 w-full sm:w-auto text-center"
                  )}
                >
                  지금 시청하기
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            🔓 로그인 없이 바로 시청 가능합니다
          </p>
        </div>
      </div>
    </section>
  );
};
