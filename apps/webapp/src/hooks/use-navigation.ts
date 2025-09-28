'use client';

import { usePathname } from 'next/navigation';

const useNavigation = () => {
  const pathname = usePathname();

  const raw = pathname.replace(/^\/(en|vi|fr)(?=\/|$)/, '');

  const isHomeActive = raw === '' || raw === '/';
  const isExploreActive = raw.startsWith('/explore');
  const isNotificationsActive = raw.startsWith('/notifications');
  const isMessagesActive = raw.startsWith('/messages');

  return {
    isHomeActive,
    isExploreActive,
    isNotificationsActive,
    isMessagesActive,
  };
};

export default useNavigation;
