'use client';
import React from 'react';
import styles from './index.module.scss';
import { Button, Field, InputText, Label, TextArea, Card } from '@revt/diverse';
import { Layout } from '@/components/Layout';
import { Content } from '@/components/Layout/Content';
import { useTranslations } from 'next-intl';

export const Contact = () => {
  const t = useTranslations('Contact');

  const data = [
    {
      input: <InputText className="border-2 border-gray-400 rounded-sm" />,
      label: t('nameInput'),
    },
    {
      input: <InputText className="border-2 border-gray-400  rounded-sm" />,
      label: t('emailInput'),
    },
    {
      input: <InputText className="border-2 border-gray-400  rounded-sm" />,
      label: t('phoneInput'),
    },
    {
      input: <TextArea className="!border-2 !border-gray-400  !rounded-sm" />,
      label: t('noteInput'),
    },
  ];

  return (
    <Layout background="light">
      <Content>
        <section id="contact">
          <div className={styles.contactWrapper}>
            <div className={styles.content}>
              <h1 className={styles.title}>{t('title')}</h1>
              <p className={styles.description}>{t('description')}</p>
            </div>
            <div className={styles.form}>
              <Card className={styles.card}>
                {data.map(item => (
                  <Field
                    key={item.label}
                    className={styles.field}
                    input={item.input}
                    label={<Label className={styles.label}>{item.label}</Label>}
                  />
                ))}
                <Button className={styles.button}>{t('demoButton')}</Button>
              </Card>
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};
