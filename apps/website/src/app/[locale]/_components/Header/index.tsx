import Image from 'next/image';
import logo from '@/app/_assets/images/logo.png';
import { Menu, X } from 'lucide-react';
export const Header = () => {
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
        navLinks.classList.add('top-0');
      } else {
        navLinks.classList.add('top-0');
        navLinks.classList.add('top-[-100%]');
      }
    }
  };
  return (
    <header>
      <nav className="flex justify-between items-center  mx-auto md:items-center ">
        <div>
          <Image src={logo} alt="logo" className="w-26 cursor-pointer" />
        </div>
        <div className="nav-links duration-500 md:static absolute md:min-h-fit bg-white md:bg-transparent h-[100vh] md:h-auto left-0 top-[-100%] md:w-auto  w-full flex flex-col items-center px-5 z-50">
          <div className="flex align-center justify-between w-full py-5 border-b-[0.5px] md:hidden">
            <Image src={logo} alt="logo" className="w-22 cursor-pointer" />
            <div onClick={toggleMenu} className=" cursor-pointer ">
              <X />
            </div>
          </div>
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
                text-black
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
  );
};
