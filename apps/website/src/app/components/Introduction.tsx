import { KeyRound, FolderSync, GlobeLock } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Card } from './card';
import Carousel from './carousel';
import herobanner from '../_assets/images/herobanner.jpg';
import example from '../_assets/images/example.jpg';
import superman from '../_assets/images/superman.jpg';
import heroBanner from '../_assets/images/hero-banner.png';
import Image from 'next/image';
import { Icon } from './icon';
const reassurranceItem = [
  { title: '100% Secured data', icon: <KeyRound /> },
  { title: 'Fast sync', icon: <FolderSync /> },
  { title: 'Privacy-first', icon: <GlobeLock /> },
];

export const Introduction = () => {
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
    <section className="grid gap-5 md:w-[600px] lg:w-full mx-auto lg:grid-cols-2">
      <div className="flex flex-col gap-5 text-center items-center">
        <h1 className="text-5xl">Control Your Cash. Level Up Your Life.</h1>
        <p className="text-md">
          FIVT is a personal finance app to link all accounts, get real-time
          reports, optimize spending, track goals, and grow your wealth in one
          place.
        </p>
        <button className="bg-orange-500 rounded-full py-2 text-white w-full max-w-3xs">
          Get started
        </button>
        <div className="grid grid-cols-3 gap-2">
          {reassurranceItem.map((item, i) => (
            <Card key={i}>
              <Icon source={item.icon} />
              <div className="">
                <h2 className="">{item.title}</h2>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="justify-self-center lg:place-self-center">
        <Image
          src={heroBanner}
          alt="herobanner"
          className="md:w-[500] xl:w-[600]"
        />
      </div>
    </section>
  );
};
