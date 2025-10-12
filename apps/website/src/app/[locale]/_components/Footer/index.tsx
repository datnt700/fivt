import React from 'react';
import { Content } from '@/components/Layout/Content';
import { Layout } from '@/components/Layout';
import { AppWindow } from 'lucide-react';
import Image from 'next/image';
import logo from '@/app/_assets/images/logo.png';

const Footer = () => {
  return (
    <Layout background="light">
      <Content>
        <section id="Footer">
          <div className="w-full px-3 py-4">
            <div className="flex flex-col gap-2.5 mb-8.5 md:flex-row md:gap-14">
              <div className="flex flex-col gap-10 md:w-[40%]">
                <Image
                  src={logo}
                  alt="logo"
                  className="w-[100] cursor-pointer"
                />
                {/* <p className={styles.description}>{t('description')}</p>
                <p className={styles.address}>
                  417 Lafayette Street, 7th Floor
                  <br />
                  New York, NY 10013
                  <br />
                  United States
                </p> */}
                <div className="flex gap-[1.2rem]">
                  <AppWindow size={40} />
                  <AppWindow size={40} />
                  <AppWindow size={40} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                {/* <Link href={'#features'}>
                  <span className={styles.linkItem}>{t('about')}</span>
                </Link>
                <Link href={'#contact'}>
                  <span className={styles.linkItem}>{t('contact')}</span>
                </Link> */}
                {/* <Link href={'#features'}>
                  <span className={styles.linkItem}>{t('feature')}</span>
                </Link>
                <Link href={'#features'}>
                  <span className={styles.linkItem}>{t('propertyType')}</span>
                </Link>
                <Link href={'#features'}>
                  <span className={styles.linkItem}>{t('porfolios')}</span>
                </Link>
                <Link href={'#features'}>
                  <span className={styles.linkItem}>{t('pricing')}</span>
                </Link> */}
              </div>
            </div>
            <div className="text-center mb-3">
              <p>@2024 FIVT. All Rights Reserved.</p>
            </div>
          </div>
        </section>
      </Content>
    </Layout>
  );
};

export default Footer;
