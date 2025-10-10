'use client';

import herobanner from '@/app/_assets/images/herobanner.jpg';
import { KeyRound } from 'lucide-react';
import { Card } from './components/card';
import { Introduction } from './[locale]/_components/Introduction';
import Footer from './[locale]/_components/Footer';
import { Header } from './[locale]/_components/Header';
import { Features } from './[locale]/_components/Features';
import { Porfolios } from './[locale]/_components/Porfolios';
import { Pricing } from './[locale]/_components/Pricing';
import { Contact } from './[locale]/_components/Contact';
import { ThemeProvider } from './context/ThemeContext';

export default function Home() {
  const cardItem = [
    { title: '100% Secured data', icon: <KeyRound /> },
    { title: 'Fast sync', icon: <KeyRound /> },
    { title: 'Privacy-first', icon: <KeyRound /> },
    { title: 'Privacy-first', icon: <KeyRound /> },
  ];

  const benefitItem = [
    {
      title: 'Simple money tracker',
      description:
        'It takes seconds to record daily transactions. Put them into clear and visualized categories such as Expense: Food, Shopping or Income: Salary, Gift.',
      image: herobanner,
    },
    {
      title: 'Painless budgeting',
      description:
        'It takes seconds to record daily transactions. Put them into clear and visualized categories such as Expense: Food, Shopping or Income: Salary, Gift.',
      image: herobanner,
    },
    {
      title: 'Simple money tracker',
      description:
        'One report to give a clear view on your spending patterns. Understand where your money comes and goes with easy-to-read graphs.',
      image: herobanner,
    },
  ];

  const featureItem = [
    {
      icon: <KeyRound />,
      title: 'Theo dõi và quản lý chi tiêu hiệu quả',
    },
    {
      icon: <KeyRound />,
      title: 'Vận hành kinh doanh đơn giản',
    },
    {
      icon: <KeyRound />,
      title: 'Chi tiêu thông minh, sinh lời dễ dàng',
    },
    {
      icon: <KeyRound />,
      title: 'A.I đề xuất dịch vụ cá nhân hóa',
    },
    {
      icon: <KeyRound />,
      title: 'Tín dụng trong tầm tay',
    },
    {
      icon: <KeyRound />,
      title: 'A.I đồng hành xây dựng thói quen chi tiêu',
    },
  ];

  return (
    <>
      <Header />
      <Introduction />
      <Features />
      <Porfolios />
      <Pricing />
      <Contact />
      <Footer />
    </>
  );
}
