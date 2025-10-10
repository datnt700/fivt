import Image from 'next/image';
import logo from '@/app/_assets/images/logo.png';
import { Menu, X } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/app/context/ThemeContext';
import { SunDim, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { FranceFlag } from '@/app/_component/Icons/Flag/france';
import { EnglandFlag } from '@/app/_component/Icons/Flag/england';
import { VietnamFlag } from '@/app/_component/Icons/Flag/vietnam';
import { Layout } from '@/components/Layout';
import { Content } from '@/components/Layout/Content';

interface Language {
  name: string;
  img: React.JSX.Element;
  lang: string;
}
const MenuItem = [
  { name: 'Home', link: '#' },
  { name: 'About', link: '#' },
  { name: 'Services', link: '#' },
  { name: 'Contact', link: '#' },
  { name: 'Blog', link: '#' },
];

const LanguageItem = [
  {
    name: 'France',
    img: <FranceFlag size={30} />,
    lang: 'fr',
  },
  {
    name: 'English',
    img: <EnglandFlag size={30} />,
    lang: 'en',
  },
  {
    name: 'Vietnam',
    img: <VietnamFlag size={30} />,
    lang: 'vn',
  },
];

export const Header = () => {
  const { isDarkModeChecked, setDarkTheme, setLightTheme } =
    useContext(ThemeContext);
  const [isLightHeader, setLightHeader] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(o => !o);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () =>
        setLightHeader(window.scrollY > 10)
      );
    }
  }, []);

  const [language, setLanguage] = useState<Language | undefined>({
    name: 'FR',
    img: <FranceFlag size={32} />,
    lang: 'fr',
  });

  const [isOpenLanguage, setIsOpenLanguage] = useState<Boolean>(false);

  const handleOpenLanguage = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setIsOpenLanguage(e => !e);
  };

  const handleClickLang = (item: Language) => {
    setLanguage(item);
    setIsOpenLanguage(false);
  };

  return (
    <header
      className={`w-full sticky pt-2 top-0 z-50 bg-white ${isLightHeader && 'shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.1)]'}`}
    >
      <Layout>
        <Content>
          <nav className="flex justify-between items-center w-full">
            <Image src={logo} alt="logo" className="w-[100] cursor-pointer" />
            <div
              className={`nav-links
            md:static md:flex md:h-auto md:w-auto md:translate-y-0 md:opacity-100 md:pointer-events-auto
            fixed inset-0 z-40 bg-white h-screen overflow-y-auto
            transition-transform duration-300 ease-in-out
            px-5
            ${
              open
                ? 'translate-y-0 opacity-100 pointer-events-auto'
                : '-translate-y-full opacity-0 pointer-events-none'
            }`}
            >
              <div className="flex items-center justify-between w-full py-5 md:hidden">
                <div className="flex items-center gap-5">
                  <Image
                    src={logo}
                    alt="logo"
                    width={120}
                    className=" cursor-pointer p-0"
                  />
                  <div>
                    <div className="flex items-center">
                      <button
                        className="flex gap-5 items-center"
                        onClick={e => handleOpenLanguage(e)}
                      >
                        <span>{language?.img} </span>
                        {language?.name}
                      </button>
                      {isOpenLanguage ? <ChevronDown /> : <ChevronUp />}
                    </div>
                    <ul
                      className={`flex-col items-baseline gap-3  rounded-lg absolute p-2 bg-gray-200 shadow-[0px_0px_20px_0px_rgba(0,_0,_0,_0.1)]
                    ${!isOpenLanguage ? 'hidden' : 'flex'}
                    `}
                    >
                      {LanguageItem.map(item => (
                        <li
                          key={item.lang}
                          className="flex items-center justify-center gap-5"
                          onClick={() => handleClickLang(item)}
                        >
                          <span>{item.img}</span>
                          <a>{item.name}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div onClick={toggleMenu} className="cursor-pointer">
                  <X />
                </div>
              </div>
              <ul className="flex md:flex-row flex-col md:items-center md:gap-[4vw] gap-8 w-full mb-10 md:mb-0">
                {MenuItem.map(menu => (
                  <li key={menu.name} className="">
                    <a
                      className="
                  inline-block
                  border-b border-gray-200
                  [background-image:linear-gradient(transparent,transparent),linear-gradient(var(--color-primary),var(--color-primary))]
                  [background-size:0_3px]
                  [background-position:0_100%]
                  bg-no-repeat
                  transition-[background-size] duration-500 ease-in-out
                  hover:[background-size:100%_3px]
                  w-full
                  text-lg
                  pb-5
                  md:border-0
                  md:pb-0
                  "
                      href={menu.link}
                    >
                      {menu.name}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="md:hidden">
                <label className="relative inline-block w-16 h-8 cursor-pointer">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="absolute inset-0 rounded-full bg-orange-500 dark:bg-neutral-700" />
                  <Moon
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4
                text-neutral-900 dark:text-neutral-100
                transition-opacity
                "
                  />
                  <SunDim
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4
                text-neutral-900 dark:text-neutral-100
                "
                    width={50}
                  />
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white
                shadow transition-transform duration-200 ease-in-out
                peer-checked:translate-x-6"
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-6">
                <button
                  className="
              group relative inline-flex items-center justify-center
              rounded-full px-5 py-2
              bg-primary text-white
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
                text-white
                flex
                items-center justify-center
                "
                  >
                    Sign in
                  </span>
                </button>
                <div onClick={toggleMenu} className="cursor-pointer md:hidden">
                  <Menu />
                </div>
              </div>
              <div className="hidden md:block">
                <label className="relative inline-block w-16 h-8 cursor-pointer">
                  <input type="checkbox" className="peer sr-only" />
                  <span className="absolute inset-0 rounded-full bg-primary dark:bg-neutral-700" />
                  <Moon
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4
                text-neutral-900 dark:text-neutral-100
                transition-opacity
                "
                  />
                  <SunDim
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4
                text-neutral-900 dark:text-neutral-100
                "
                    width={50}
                  />
                  <span
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white
                shadow transition-transform duration-200 ease-in-out
                peer-checked:translate-x-6"
                  />
                </label>
              </div>
            </div>
          </nav>
        </Content>
      </Layout>
    </header>
  );
};
