import { useEffect, useRef } from 'react';

export default function VideoLightbox({ 
  open, 
  onClose, 
  src, 
  poster 
}: { 
  open: boolean; 
  onClose: () => void; 
  src?: string; 
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  
  useEffect(() => {
    if (open) {
      ref.current?.play().catch(() => {});
    } else {
      try {
        ref.current?.pause();
      } catch {}
    }
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
      aria-label="Video player"
    >
      <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <video 
          ref={ref} 
          controls 
          playsInline 
          poster={poster} 
          className="w-full rounded-xl bg-black"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <button 
          onClick={onClose} 
          className="mt-3 px-4 py-2 rounded bg-white text-black hover:bg-gray-100 transition"
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
