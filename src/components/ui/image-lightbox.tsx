import * as React from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox = ({ src, alt = "Image", isOpen, onClose }: ImageLightboxProps) => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setScale(1);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.25, 3));
      if (e.key === "-") setScale((s) => Math.max(s - 0.25, 0.5));
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.max(s - 0.25, 0.5));
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-white/70 text-sm min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.min(s + 0.25, 3));
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div
        className="overflow-auto max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="transition-transform duration-200 cursor-zoom-in"
          style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
          onClick={() => setScale((s) => (s >= 2 ? 1 : s + 0.5))}
        />
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        클릭하여 확대 • ESC로 닫기
      </div>
    </div>
  );
};

// Thumbnail component with click-to-zoom
interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const ZoomableImage = ({ src, alt = "Image", className }: ZoomableImageProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div
        className={cn(
          "relative cursor-zoom-in group overflow-hidden rounded-lg",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <ImageLightbox src={src} alt={alt} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
