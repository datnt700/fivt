'use client';

import React from 'react';

import Link from 'next/link';

import useNavigation from '@/hooks/use-navigation';
import useScrollingEffect from '@/hooks/use-scroll';
import { House, Globe, ArrowLeftRight, BotMessageSquare } from 'lucide-react';
import { useLocale } from 'next-intl';

const BottomNav = () => {
  const scrollDirection = useScrollingEffect(); // Use the custom hook
  const navClass = scrollDirection === 'up' ? '' : 'opacity-25 duration-500';
  const locale = useLocale();
  const {
    isHomeActive,
    isExploreActive,
    isNotificationsActive,
    isMessagesActive,
  } = useNavigation();

  return (
    <div
      className={`fixed bottom-0 w-full py-4 z-10 bg-zinc-100 dark:bg-zinc-950 border-t dark:border-zinc-800 border-zinc-200 shadow-lg sm:hidden ${navClass}`}
    >
      <div className="flex flex-row justify-around items-center bg-transparent w-full">
        <Link href="/" className="flex items-center relative">
          {isHomeActive && <House />}
          {/* <span className="h-2 w-2 rounded-full bg-sky-500 absolute -top-0.5 right-[3px]"></span> */}
        </Link>
        <Link href={`/${locale}/transactions`} className="flex items-center">
          {isExploreActive && <ArrowLeftRight />}
        </Link>
        <Link href={`/${locale}/chatbot`} className="flex items-center">
          {isNotificationsActive && <BotMessageSquare />}
        </Link>
        <Link href="/messages" className="flex items-center">
          {isMessagesActive && <Globe />}
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
