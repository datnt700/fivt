'use client';
import Image from 'next/image';
import logo from '../../public/logo.png';
import { Menu } from 'lucide-react';

export default function Home() {
  const MenuItem = [
    { name: 'Home', link: '#' },
    { name: 'About', link: '#' },
    { name: 'Services', link: '#' },
    { name: 'Contact', link: '#' },
    { name: 'Blog', link: '#' },
  ];

  const toggleMenu = () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      if (navLinks.classList.contains('top-[-100%]')) {
        navLinks.classList.remove('top-[-100%]');
        navLinks.classList.add('top-[49px]');
      } else {
        navLinks.classList.remove('top-[49px]');
        navLinks.classList.add('top-[-100%]');
      }
    }
  };

  return (
    <div className="font-[Poppins] bg-gradient-to-t from-[#fbc2eb] to-[#a6c1ee] min-h-screen">
      <header className="bg-white">
        <nav className="flex justify-between items-center w-[90%] mx-auto">
          <div>
            <Image src={logo} alt="logo" className="w-22 cursor-pointer" />
          </div>
          <div className="nav-links duration-500 md:static absolute bg-white md:min-h-fit min-h-[60vh] left-0 top-[-100%] md:w-auto  w-full flex items-center px-5">
            <ul className="flex md:flex-row flex-col md:items-center md:gap-[4vw] gap-8">
              {MenuItem.map(menu => (
                <li key={menu.name}>
                  <a
                    className="
      inline-block
      border-b-0
      [background-image:linear-gradient(transparent,transparent),linear-gradient(currentColor,currentColor)]
      [background-size:0_3px]
      [background-position:0_100%]
      bg-no-repeat
      transition-[background-size] duration-500 ease-in-out
      hover:[background-size:100%_3px]
    "
                    href={menu.link}
                  >
                    {menu.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-6">
            <button
              className="
                group relative inline-flex items-center justify-center
                rounded-full px-5 py-2
                bg-[#a6c1ee] text-white
                overflow-hidden
              "
            >
              <span
                className="
                  absolute inset-0
                  bg-[#4f7fe6]          
                  -translate-y-full    
                  transition-transform duration-500 ease-out
                  group-hover:translate-y-0
                "
                aria-hidden="true"
              />
              <span
                className="
                relative z-10
                transition-colors duration-500
                group-hover:text-white
              "
              >
                Sign in
              </span>
            </button>
            <div onClick={toggleMenu} className="cursor-pointer md:hidden">
              <Menu />
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
