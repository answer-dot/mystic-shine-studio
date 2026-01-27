import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, Lock } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import previewThumbnail from '@/assets/tarot-preview-thumbnail.jpg';

export const FreePreviewSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const previewData = {
    chapter: 'Chapter 1',
    title: '지식 창업의 시작',
    duration: '15:32',
    badge: '무료 공개',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  };

  const handleWatchClick = () => {
    if (user) {
      setIsPlaying(true);
    } else {
      navigate('/auth');
    }
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
          {/* Video Container */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
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
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    onClick={handleWatchClick}
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 text-black ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info Bar - BELOW video */}
          <div className="mt-4">
            <div className="backdrop-blur-md bg-black/80 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-primary text-xs sm:text-sm font-semibold">
                    {previewData.chapter}
                  </span>
                  <h3 className="text-sm sm:text-lg font-bold text-white mt-0.5 truncate">
                    {previewData.title}
                  </h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/70">
                    <span>{previewData.duration}</span>
                    <span>•</span>
                    <span className="text-primary font-medium">{previewData.badge}</span>
                  </div>
                </div>
                
                {/* Button - Only for logged-out users */}
                {!user && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWatchClick();
                    }}
                    className={cn(
                      "px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300",
                      "bg-gradient-to-r from-primary to-orange-400 text-black",
                      "hover:shadow-lg hover:shadow-primary/30 hover:scale-105",
                      "flex-shrink-0 whitespace-nowrap"
                    )}
                  >
                    풀버전 시청하기
                  </button>
                )}
              </div>
              
              {/* Login prompt - Only for logged-out users */}
              {!user && (
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Lock className="w-3.5 h-3.5" />
                  <span>🔒 로그인 후 풀버전 감상 가능합니다</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
