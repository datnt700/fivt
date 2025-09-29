import { ChevronRight, ChevronLeft } from 'lucide-react';
import Image, { type StaticImageData } from 'next/image';
import { useEffect, useRef, useState } from 'react';

type CarouselItem = { title: string; image: StaticImageData };

type CarouselProps = {
  activeItemIndex: number;
  setActiveItemIndex: React.Dispatch<React.SetStateAction<number>>;
  carouselData: CarouselItem[];
  autoplay?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;
};

const Carousel = ({
  activeItemIndex,
  setActiveItemIndex,
  carouselData,
  autoplay = true,
  intervalMs = 3000,
  pauseOnHover = true,
}: CarouselProps) => {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const prev = () =>
    setActiveItemIndex(
      i => (i - 1 + carouselData.length) % carouselData.length
    );
  const next = () => setActiveItemIndex(i => (i + 1) % carouselData.length);

  useEffect(() => {
    if (!autoplay || paused || carouselData.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      next();
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoplay, paused, intervalMs, carouselData.length]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPaused(true);
      else setPaused(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce) setPaused(true);
  }, []);
  const item = carouselData[activeItemIndex];
  return (
    <div
      className=" w-full justify-center h-full"
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div className="relative min-w-[300px] rounded-lg overflow-hidden">
        <button
          onClick={prev}
          className="min-w-[30px] h-[30px] rounded-full grid place-items-center text-white bg-black/20 hover:bg-black/60 duration-200 absolute top-1/2 -translate-y-1/2 left-2 z-10"
        >
          <ChevronLeft />
        </button>
        <div className="relative h-[400px] md:h-[600px] lg:h-[700]  w-full">
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw,
               (max-width: 1200px) 50vw,
               33vw"
          />
        </div>
        <button
          onClick={next}
          className="min-w-[30px] h-[30px] rounded-full grid place-items-center text-white bg-black/20 hover:bg-black/60 duration-200 absolute top-1/2 -translate-y-1/2 right-2 z-10"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
