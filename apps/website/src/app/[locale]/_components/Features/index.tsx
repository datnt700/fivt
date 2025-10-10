'use client';
import {
  IconAddressBook,
  IconBrandHipchat,
  IconBrandMastercard,
  IconFileAnalytics,
  IconPaperclip,
  IconSubtask,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Layout } from '@/components/Layout';
import { Content } from '@/components/Layout/Content';

import { FeatureComponent } from './FeatureComponent';
import styles from './index.module.scss';

interface Feature {
  title: string;
  icon: React.JSX.Element;
  description: string;
}

export const Features = () => {
  // const t = useTranslations('Features');

  const featureData: Feature[] = [
    {
      icon: <IconBrandMastercard size={80} />,
      title: "t('paymentReminderFeature')",
      description: "t('paymentReminderFeature')",
    },
    {
      icon: <IconFileAnalytics size={80} />,
      title: '2',
      description: "t('paymentReminderFeature')",
    },
    {
      icon: <IconAddressBook size={80} />,
      title: '3',
      description: "t('paymentReminderFeature')",
    },
    {
      icon: <IconBrandHipchat size={80} />,
      title: '4',
      description: "t('paymentReminderFeature')",
    },
    {
      icon: <IconSubtask size={80} />,
      title: '5',
      description: "t('paymentReminderFeature')",
    },
    {
      icon: <IconPaperclip size={80} />,
      title: '6',
      description: "t('paymentReminderFeature')",
    },
  ];
  return (
    <Layout background="gradient">
      <Content>
        <section id="features">
          <div className={styles.wrapper}>
            <div className={styles.introductionFeature}>
              <span className={styles.text}>
                {"t('paymentReminderFeature')"}
              </span>
            </div>
            <div className={styles.features}>
              <div className={styles.featuresItem}>
                {featureData.map(feature => (
                  <FeatureComponent
                    key={feature.title}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};
