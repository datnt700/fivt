'use client';
import styles from '@/app/[locale]/_components/Pricing/PricingCard/index.module.scss';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card } from '@revt/diverse';

interface PricingComponentProps {
  title: string;
  price: string;
  features: string[];
}

export const PricingCard = ({
  title,
  price,
  features,
}: PricingComponentProps) => {
  // const t = useTranslations('Pricing');

  return (
    <Card key={title} className={styles.pricingComponent}>
      <div className={styles.pricingPlan}>
        <div className={styles.pricingContent}>
          <div className={styles.contentTop}>
            <div className={styles.planName}>{title}</div>
            <div className={styles.planPrice}>
              <div className={styles.priceWrapper}>
                <p className={styles.symbol}>€</p>
                <div className={styles.monthlyPrice}>
                  <span className={styles.priceNumber}>{price}</span>
                  <span className={styles.unit}>/Unit</span>
                </div>
              </div>
              <div className={styles.billedMonthly}>
                <p> {"t('perMonth')"}</p>
              </div>
            </div>
            <Button>{"t('getStarterBtn')"}</Button>
            <div className={styles.featureList}>
              {features.map((feature, index) => (
                <ul key={index} className={styles.featureItem}>
                  <li className={styles.text}>{feature}</li>
                </ul>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
