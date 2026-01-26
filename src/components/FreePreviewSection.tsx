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
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
            {/* Video Area */}
            <div className="relative aspect-video bg-black">
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
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/50">
                      <Play className="w-9 h-9 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Info Bar */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-secondary/80 to-secondary">
              <div>
                <span className="text-primary text-sm font-semibold">
                  {previewData.chapter}
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  {previewData.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>{previewData.duration}</span>
                  <span>•</span>
                  <span className="text-primary font-medium">{previewData.badge}</span>
                </div>
              </div>
              
              <button
                onClick={() => setIsPlaying(true)}
                className={cn(
                  "px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300",
                  "bg-gradient-to-r from-primary to-orange-500 text-primary-foreground",
                  "hover:shadow-lg hover:shadow-primary/30 hover:scale-105",
                  "flex-shrink-0"
                )}
              >
                지금 시청하기
              </button>
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
