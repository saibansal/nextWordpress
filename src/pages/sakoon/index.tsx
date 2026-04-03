import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SakoonLayout from '../../components/frontend/sakoon/SakoonLayout';
import { useLocation } from '../../context/LocationContext';

interface HomepageData {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  welcome: {
    title: string;
    description: string;
    image: string;
    bottomText: string;
  };
}

export default function SakoonHome() {
  const [homepageData, setHomepageData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedLocation, isLoading: locationLoading } = useLocation();

  const fetchHomepageData = async (locationId: string) => {
    try {
      setLoading(true);
      console.log('[SakoonHome] Fetching data for location:', locationId);
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/homepage?location=${locationId}&t=${Date.now()}`);
      const data = await response.json();
      console.log('[SakoonHome] Fetched data:', data);
      setHomepageData(data);
    } catch (error) {
      console.error('Failed to fetch homepage data:', error);
      // Fallback data
      setHomepageData({
        hero: {
          title: 'CELEBRATING INDIAN FLAVOURS',
          subtitle: 'A Culinary Journey Through India',
          backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp',
          ctaText: 'Explore Our Menu',
          ctaLink: '/sakoon/menu'
        },
        welcome: {
          title: 'Welcome to Sakoon',
          description: 'Sakoon invites you on a culinary journey that transcends borders and awakens your senses. Step into a world of opulence and flavor, where timeless traditions of Indian cuisine blend seamlessly with contemporary elegance at four locations in the Bay Area.',
          image: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp',
          bottomText: 'At Sakoon, we have mastered the art of Indian fine dining, curating a menu that showcases the finest culinary treasures from across the subcontinent. Each dish is a symphony of flavors, meticulously prepared by our skilled chefs, using the freshest locally sourced produce and the exotic spices from India.'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Wait for location context to load, then fetch data
  useEffect(() => {
    if (!locationLoading && selectedLocation?.id) {
      console.log('[SakoonHome] Location ready:', selectedLocation.id);
      fetchHomepageData(selectedLocation.id);
    }
  }, [selectedLocation?.id, locationLoading]);


  if (loading) {
    return (
      <SakoonLayout title="Loading...">
        <div className="h-[85vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-100 border-t-[#F2002D] rounded-full animate-spin"></div>
        </div>
      </SakoonLayout>
    );
  }

  return (
    <SakoonLayout title={homepageData?.hero.title || "Celebrating Indian Flavours"}>
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <img
          src={homepageData?.hero.backgroundImage || "https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp"}
          alt="Sakoon Hero"
          className="absolute inset-0 w-full h-full object-cover brightness-90 transition-transform duration-[10s] hover:scale-110"
        />

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-7xl font-rubik font-black tracking-tight drop-shadow-2xl mb-6">
            {homepageData?.hero.title || "CELEBRATING INDIAN FLAVOURS"}
          </h1>
          <p className="text-lg md:text-xl font-medium tracking-widest mb-12 text-[#F2002D]">
            {homepageData?.hero.subtitle || "A Culinary Journey Through India"}
          </p>
          <Link
            href={homepageData?.hero.ctaLink || "/sakoon/menu"}
            className="inline-block bg-[#F2002D] text-white px-12 py-4 rounded-full font-black text-lg uppercase tracking-widest hover:bg-white hover:text-[#F2002D] transition-all duration-300 shadow-2xl shadow-[#F2002D]/30"
          >
            {homepageData?.hero.ctaText || "Explore Our Menu"}
          </Link>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto text-center">
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-rubik font-black mb-12 text-[#1b1b1b]">
            {homepageData?.welcome.title || "Welcome to Sakoon"}
          </h2>
          <p className="text-lg md:text-2xl text-[#1b1b1b] font-medium leading-[1.6] max-w-5xl mx-auto mb-12">
            {homepageData?.welcome.description || "Sakoon invites you on a culinary journey..."}
          </p>
          <div className="w-20 h-0.5 bg-[#F2002D] mx-auto mb-16"></div>

          <div className="relative rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] mb-24 group">
            <img
              src={homepageData?.welcome.image || "https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp"}
              alt="Sakoon Experience"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <p className="text-lg md:text-xl text-gray-600 leading-[1.8] max-w-4xl mx-auto">
            {homepageData?.welcome.bottomText || "At Sakoon, we have mastered the art of Indian fine dining..."}
          </p>
        </div>
      </section>
    </SakoonLayout>
  );
}
