import React from 'react';
import Head from 'next/head';
import { Montserrat, Rubik } from 'next/font/google';
import Header from './Header';
import Footer from './Footer';
import { LocationProvider, useLocation } from '../../../context/LocationContext';
import LocationPopup from './LocationPopup';

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });
const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' });

function LayoutContent({ children, title }: { children: React.ReactNode, title?: string }) {
  const { selectedLocation } = useLocation();
  
  return (
    <div className={`${montserrat.variable} ${rubik.variable} min-h-screen bg-white font-montserrat text-[#1B1B1B]`}>
        <Head>
            <title>{title ? `${title} | Sakoon Restaurant` : 'Sakoon Restaurant – Celebrating Indian Flavours'}</title>
            {selectedLocation && <meta name="location" content={selectedLocation.name} />}
        </Head>

        <Header />
        <LocationPopup />
        
        <main>
           {children}
        </main>
        
        <Footer />
    </div>
  );
}

export default function SakoonLayout({ children, title }: { children: React.ReactNode, title?: string }) {
  return (
    <LocationProvider>
        <LayoutContent title={title}>{children}</LayoutContent>
    </LocationProvider>
  );
}
