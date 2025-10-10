import React from 'react';
import { ReactNode } from 'react';
import styles from './styles.module.scss';

interface ContentProps {
  children: ReactNode;
}

export const Content = ({ children }: ContentProps) => {
  return (
    <div className="w-full h-full m-auto px-5 py-2 md:max-w-[1700px]">
      {children}
    </div>
  );
};
