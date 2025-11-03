'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

const FULL_WIDTH_PX = 120;
const COLLAPSED_WIDTH_PX = 35;
const GAP_PX = 2;
const MARGIN_PX = 2;

interface GalleryItem {
  id: string | number;
  url: string;
  title: string | null;
}

interface FramerThumbnailCarouselProps {
  items: GalleryItem[];
}

export function FramerThumbnailCarousel({ items }: FramerThumbnailCarouselProps) {
  const [index, setIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1;
      const targetX = -index * containerWidth;

      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    }
  }, [index, x, isDragging]);

  useEffect(() => {
    if (thumbnailsRef.current) {
      let scrollPosition = 0;
      for (let i = 0; i < index; i++) {
        scrollPosition += COLLAPSED_WIDTH_PX + GAP_PX;
      }

      scrollPosition += MARGIN_PX;

      const containerWidth = thumbnailsRef.current.offsetWidth;
      const centerOffset = containerWidth / 2 - FULL_WIDTH_PX / 2;
      scrollPosition -= centerOffset;

      thumbnailsRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [index]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className='w-full'>
      <div className='flex flex-col gap-3'>
        {/* Main Carousel */}
        <div className='relative overflow-hidden rounded-[9px]' ref={containerRef}>
          <motion.div
            className='flex'
            drag='x'
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e: any, info: any) => {
              setIsDragging(false);
              const containerWidth = containerRef.current?.offsetWidth || 1;
              const offset = info.offset.x;
              const velocity = info.velocity.x;

              let newIndex = index;

              if (Math.abs(velocity) > 500) {
                newIndex = velocity > 0 ? index - 1 : index + 1;
              } else if (Math.abs(offset) > containerWidth * 0.3) {
                newIndex = offset > 0 ? index - 1 : index + 1;
              }

              newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
              setIndex(newIndex);
            }}
            style={{ x }}
          >
            {items.map((item) => (
              <div key={item.id} className='shrink-0 w-full h-[320px]'>
                <img
                  src={item.url}
                  alt={item.title || 'Gallery image'}
                  className='w-full h-full object-cover rounded-[9px] select-none pointer-events-none'
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>

          {/* Navigation Buttons */}
          {items.length > 1 && (
            <>
              <motion.button
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className={`absolute left-4 text-black top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10 ${
                  index === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'bg-white hover:scale-110 hover:opacity-100 opacity-70'
                }`}
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </motion.button>

              <motion.button
                disabled={index === items.length - 1}
                onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
                className={`absolute text-black right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10 ${
                  index === items.length - 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'bg-white hover:scale-110 hover:opacity-100 opacity-70'
                }`}
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </motion.button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {items.length > 1 && (
          <div
            ref={thumbnailsRef}
            className='overflow-x-auto scrollbar-hide'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className='flex gap-1 h-20 pb-2' style={{ width: 'fit-content' }}>
              {items.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => setIndex(i)}
                  initial={false}
                  animate={i === index ? 'active' : 'inactive'}
                  variants={{
                    active: {
                      width: FULL_WIDTH_PX,
                      marginLeft: MARGIN_PX,
                      marginRight: MARGIN_PX,
                    },
                    inactive: {
                      width: COLLAPSED_WIDTH_PX,
                      marginLeft: 0,
                      marginRight: 0,
                    },
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className='relative shrink-0 h-full overflow-hidden rounded-[9px]'
                >
                  <img
                    src={item.url}
                    alt={item.title || 'Gallery image'}
                    className='w-full h-full object-cover pointer-events-none select-none'
                  />
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
