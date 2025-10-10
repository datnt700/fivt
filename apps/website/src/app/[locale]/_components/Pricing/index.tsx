'use client';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Layout } from '@/components/Layout';
import { Content } from '@/components/Layout/Content';

import styles from './index.module.scss';
import { PricingCard } from './PricingCard';

export const Pricing = () => {
  // const t = useTranslations('Pricing');

  const pricingData = [
    {
      title: "t('starterCard')",
      price: '1',
      features: [
        "t('paymentReminderFeature')",
        "t('fileManagementFeature')",
        "t('CommunicationWithTenantsFeature')",
        "t('addressBookFeature')",
      ],
    },
    {
      title: "t('premiumCard')",
      price: '2',
      features: [
        "t('paymentReminderFeature')",
        "t('fileManagementFeature')",
        "t('CommunicationWithTenantsFeature')",
        "t('addressBookFeature')",
      ],
    },
    {
      title: "t('vipCard')",
      price: '5',
      features: [
        "t('paymentReminderFeature')",
        "t('fileManagementFeature')",
        "t('CommunicationWithTenantsFeature')",
        "t('addressBookFeature')",
      ],
    },
  ];
  return (
    <Layout background="gradient">
      <Content>
        <section id="pricing">
          <div className={styles.wrapper}>
            <div className={styles.pricingTitle}>
              <p className={styles.text}>Pricing</p>
            </div>
            <div className={styles.pricingWrapper}>
              {pricingData.map(item => (
                <PricingCard
                  key={item.title}
                  title={item.title}
                  price={item.price}
                  features={item.features}
                />
              ))}
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};
