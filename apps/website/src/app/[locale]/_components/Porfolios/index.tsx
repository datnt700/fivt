'use client';
import { IconPaperclip } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { PorfolioCard } from '@/app/[locale]/_components/Porfolios/PorfolioCard';
import { Layout } from '@/components/Layout';
import { Content } from '@/components/Layout/Content';

import style from './index.module.scss';

export const Porfolios = () => {
  // const t = useTranslations('Portfolios');

  const porfolioData = [
    {
      name: 'Small porfolios',
      detail: 'Quan offers phone, chat, and email support. Day or night.',
      icon: <IconPaperclip size={50} />,
    },
    {
      name: 'DIY Landlords',
      detail: 'Quan offers phone, chat, and email support. Day or night.',
      icon: <IconPaperclip size={50} />,
    },
    {
      name: 'Land Manager',
      detail: 'Quan offers phone, chat, and email support. Day or night.',
      icon: <IconPaperclip size={50} />,
    },
  ];
  return (
    <Layout background="light">
      <Content>
        <section id="porfolios">
          <div className={style.wrapper}>
            <div className={style.header}>
              <h1 className={style.title}>{"t('portfolio')"}</h1>
              <p className={style.description}>{"t('description')"}</p>
            </div>
            <div className={style.content}>
              {porfolioData.map(item => (
                <PorfolioCard
                  key={item.name}
                  name={item.name}
                  detail={item.detail}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};
