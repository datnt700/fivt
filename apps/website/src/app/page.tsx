'use client';

import { Header } from './components/header';
import herobanner from '../../public/herobanner.jpg';
import Image from 'next/image';
import { Footer } from './components/footer';
export default function Home() {
  return (
    <>
      <div className="font-[Poppins] bg-gradient-to-t from-[#fbc2eb] to-[#a6c1ee] min-h-screen px-5 md:px-20 rounded-b-xl">
        <Header />
        <section className="hero w-full">
          <div className="flex justify-center items-center ">
            <Image
              src={herobanner}
              alt="herobanner"
              className="rounded-lg w-full h-auto shadow-lg xl:max-h-[700px] 2xl:max-h-[800px] object-cover"
            ></Image>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
