'use client';

import { Header } from './components/header';
import herobanner from './assets/images/herobanner.jpg';
import example from './assets/images/example.jpg';
import superman from './assets/images/superman.jpg';
import { Footer } from './components/footer';
import { useState, useRef } from 'react';
import Image from 'next/image';
import Carousel from './components/carousel';
import { KeyRound } from 'lucide-react';
import { Card } from './components/card';

export default function Home() {
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const carouselData = useRef([
    {
      title: 'item 1',
      image: herobanner,
    },
    {
      title: 'item 2',
      image: example,
    },
    {
      title: 'item 3',
      image: superman,
    },
  ]);

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
      <div className="font-[Poppins] bg-gradient-to-t from-[#fbc2eb] to-[#a6c1ee] min-h-screen px-5 md:px-30 lg:px-40 xl:px-50 2xl:px-60 ">
        <Header />
        <section className="w-full h-[400px] md:h-[600px] lg:h-[700px] mt-5 rounded-lg overflow-hidden relative">
          <Carousel
            activeItemIndex={activeItemIndex}
            setActiveItemIndex={setActiveItemIndex}
            carouselData={carouselData.current}
            autoplay
            intervalMs={5000}
            pauseOnHover
          />
        </section>
        <section className="grid gap-4 grid-cols-2 md:grid-cols-4 mt-5">
          {cardItem.map((item, i) => (
            <Card key={i} title={item.title} icon={item.icon} />
          ))}
        </section>
        <section className="mt-5 flex flex-col gap-5">
          {benefitItem.map((item, i) => {
            const even = i % 2 === 0;
            return (
              <div className="grid lg:grid-cols-2 gap-5">
                <div
                  className={even ? 'order-2 lg:order-1' : 'order-2 lg:order-2'}
                >
                  <h2 className="font-bold">{item.title}</h2>
                  <p>{item.description}</p>
                </div>
                <div
                  className={even ? 'order-1 lg:order-2' : 'order-1 lg:order-1'}
                >
                  <div className="relative h-[300px] md:h-[400px] w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw,
                                    (max-width: 1200px) 50vw,
                                    33vw"
                      className="object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
        <section>
          <div>
            <h2 className="font-bold">Features</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              consequat lacus dui, et efficitur tortor tincidunt sit amet. Nam
              euismod nisi ac velit vulputate suscipit. Mauris lorem ante,
              gravida porttitor risus id, ultricies ullamcorper libero.
            </p>
          </div>
          <div className="grid grid-cols-2 place-items-center">
            {featureItem.map((item, i) => (
              <div key={i} className="flex flex-col text-center items-center">
                <div className=" rounded-4xl p-5 bg-white rounded-4xl shadow-[2px_2px_0px_0px_rgba(0,_0,_0,_0.1)]">
                  {item.icon}
                </div>
                <h4>{item.title}</h4>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
