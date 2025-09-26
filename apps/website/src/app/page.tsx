'use client';

import { Header } from './components/header';
import herobanner from './assets/images/herobanner.jpg';
import example from './assets/images/example.jpg';
import superman from './assets/images/superman.jpg';
import Image from 'next/image';
import { Footer } from './components/footer';
import { useState, useRef } from 'react';
import Carousel from './components/carousel';

export default function Home() {
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const carouselData = useRef([
    {
      title: 'item 1',
      image: herobanner,
    },
    {
      title: 'item 2',
      image: example,
    },
    {
      title: 'item 3',
      image: superman,
    },
  ]);
  return (
    <>
      <div className="font-[Poppins] bg-gradient-to-t from-[#fbc2eb] to-[#a6c1ee] min-h-screen px-5 md:px-20 rounded-b-xl">
        <Header />
        <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] 2xl:h-[800px] mt-5 rounded-lg overflow-hidden relative">
          <Carousel
            activeItemIndex={activeItemIndex}
            setActiveItemIndex={setActiveItemIndex}
            carouselData={carouselData.current}
            autoplay
            intervalMs={5000}
            pauseOnHover
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
