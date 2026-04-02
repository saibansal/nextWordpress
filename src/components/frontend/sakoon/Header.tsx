import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icons } from '../../Icons';
import { useLocation } from '../../../context/LocationContext';

export default function Header() {
  const router = useRouter();
  const { selectedLocation, clearLocation } = useLocation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: 'HOME', href: '/sakoon' },
    { name: 'MENU', href: '/sakoon/menu' },
    { name: 'FINE DINE', href: '/sakoon/fine-dine' },
    { name: 'BAR', href: '/sakoon/bar' },
    { name: 'BANQUET', href: '/sakoon/banquet' },
    { name: 'CATERING', href: '/sakoon/catering' },
    { name: 'ABOUT', href: '/sakoon/about' },
  ];

  // Refined ColorZilla gradient string
  const headerGradient = `linear-gradient(to bottom, rgba(254,254,254,1) 0%, rgba(253,253,253,0.74) 50%, rgba(253,253,253,0.65) 56%, rgba(255,255,255,0.64) 57%, rgba(255,255,255,0.63) 58%, rgba(255,255,255,0.62) 59%, rgba(255,255,255,0.6) 60%, rgba(253,253,253,0.59) 61%, rgba(255,255,255,0.56) 63%, rgba(255,255,255,0.53) 65%, rgba(255,255,255,0.51) 66%, rgba(255,255,255,0.48) 68%, rgba(255,255,255,0.45) 70%, rgba(253,253,253,0.42) 72%, rgba(253,253,253,0.41) 73%, rgba(252,252,252,0.39) 74%, rgba(255,255,255,0.38) 75%, rgba(252,252,252,0.35) 77%, rgba(255,255,255,0.33) 78%, rgba(252,252,252,0.32) 79%, rgba(255,255,255,0.3) 80%, rgba(251,251,251,0.28) 81%, rgba(255,255,255,0.27) 82%, rgba(255,255,255,0.26) 83%, rgba(251,251,251,0.24) 84%, rgba(255,255,255,0.22) 85%, rgba(250,250,250,0.21) 86%, rgba(255,255,255,0.2) 87%, rgba(255,255,255,0.18) 88%, rgba(255,255,255,0.16) 89%, rgba(255,255,255,0.15) 90%, rgba(247,247,247,0.14) 91%, rgba(255,255,255,0.12) 92%, rgba(255,255,255,0.11) 93%, rgba(255,255,255,0.08) 95%, rgba(255,255,255,0.06) 96%, rgba(255,255,255,0.03) 98%, rgba(0,0,0,0) 100%)`;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 py-8 flex items-center justify-between"
      style={{ background: headerGradient }}
    >
      <div className="flex items-center gap-4">
        <Link href="/sakoon">
          <img src="https://sakoon.vismaad.com/wp-content/uploads/2022/06/sakoonlogo__.png" alt="Sakoon Logo" className="h-10 md:h-12 w-auto" />
        </Link>

      </div>

      <nav className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = router.asPath === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[12px] font-bold tracking-[0.1em] hover:text-[#F2002D] transition-all duration-300 ${isActive ? 'text-[#F2002D]' : 'text-[#1B1B1B]'}`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            alert('location reset and select location');
            clearLocation();
          }}
          className="hidden sm:block bg-[#F2002D] text-white px-6 py-2.5 rounded-full text-[11px] font-black tracking-widest hover:bg-black transition-all"
        >
          {mounted && selectedLocation ? 'CHANGE LOCATION' : 'SELECT LOCATION'}
        </button>
        <button className="lg:hidden text-gray-700">
          <Icons.Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
