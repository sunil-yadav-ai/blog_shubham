import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface StoryType {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  category?: {
    displayName: string;
  };
  creator: {
    username: string;
    avatar: string;
  };
}

interface StoryViewerProps {
  stories: StoryType[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, isOpen, onClose }: StoryViewerProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  // Sync state if active index prop changes
  useEffect(() => {
    setActiveIndex(initialIndex);
    setProgress(0);
  }, [initialIndex]);

  // Manage story auto-advance (5 seconds per story)
  useEffect(() => {
    if (!isOpen || stories.length === 0) return;

    // Reset progress on slide changes
    setProgress(0);

    const intervalTime = 50; // Update progress every 50ms
    const totalDuration = 5000; // 5 seconds
    const steps = totalDuration / intervalTime;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Time's up, advance
          handleNext();
          return 0;
        }
        return prev + 100 / steps;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, activeIndex, stories.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev < stories.length - 1) {
        return prev + 1;
      } else {
        onClose(); // Exit on final story
        return prev;
      }
    });
    setProgress(0);
  }, [onClose, stories.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
    setProgress(0);
  }, [stories.length]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[activeIndex];

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const midX = rect.width / 2;

    if (clickX < midX) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/98 backdrop-blur-lg p-0 sm:p-4">
      {/* Background click to close */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Main Story Container */}
      <div className="relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-none sm:rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col justify-between">
        
        {/* Story Progress Indicators (Instagram Style) */}
        <div className="absolute top-3 inset-x-3 z-30 flex gap-1">
          {stories.map((_, index) => {
            let storyProgress = 0;
            if (index < activeIndex) storyProgress = 100;
            if (index === activeIndex) storyProgress = progress;

            return (
              <div key={index} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75 ease-linear"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Story Header (Author, Category, Close Button) */}
        <div className="absolute top-6 inset-x-4 z-30 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <img
              src={currentStory.creator?.avatar}
              alt={currentStory.creator?.username}
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-bold leading-tight">
                {currentStory.creator?.username}
              </span>
              <span className="text-[9px] text-white/70">
                {currentStory.category?.displayName || 'Daily Story'}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-black/30 hover:bg-primary hover:text-white transition-all text-white/90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left/Right manual triggers (Desktop utility) */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white disabled:opacity-0 transition-opacity z-30 hidden sm:block"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white transition-opacity z-30 hidden sm:block"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Story Media (Clickable overlay area) */}
        <div
          onClick={handleScreenClick}
          className="flex-1 w-full h-full relative cursor-pointer flex items-center justify-center bg-zinc-900"
        >
          <img
            src={currentStory.imageUrl}
            alt={currentStory.title}
            className="w-full h-full object-cover"
          />
          {/* Black gradient overlay on text */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
        </div>

        {/* Story Captions / Description details */}
        <div className="absolute bottom-6 inset-x-5 z-20 text-white flex flex-col text-left pointer-events-none">
          <div className="flex items-center gap-1 text-[10px] text-white/70 font-semibold mb-2">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(currentStory.date).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-label-md font-extrabold mb-1.5 leading-snug drop-shadow">
            {currentStory.title}
          </h2>
          <p className="text-[12px] text-white/80 leading-relaxed font-medium drop-shadow">
            {currentStory.description || 'Enjoying daily moments with Focus & Frames.'}
          </p>
        </div>

      </div>
    </div>
  );
}
