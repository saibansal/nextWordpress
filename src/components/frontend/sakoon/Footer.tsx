import React from 'react';
import Link from 'next/link';
import { Icons } from '../../Icons';

export default function Footer() {
  const footerLinks = [
    { name: 'Home', href: '/sakoon' },
    { name: 'Fine Dine', href: '/sakoon/fine-dine' },
    { name: 'Bar', href: '/sakoon/bar' },
    { name: 'Banquet', href: '/sakoon/banquet' },
    { name: 'Catering', href: '/sakoon/catering' },
    { name: 'Contact Us', href: '/sakoon/about' },
  ];

  return (
    <footer className="w-full font-['Rubik',sans-serif]">
      {/* Main Footer Bar */}
      <div className="bg-[#867853] py-4 px-6 md:px-16">
        <div className="max-w-[1340px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Social Media Section */}
          <div className="flex items-center gap-2.5">
            {[
              { icon: Icons.Facebook, href: '#' },
              { icon: Icons.Twitter, href: '#' },
              { icon: Icons.Youtube, href: '#' },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                className="w-[26px] h-[26px] rounded-full bg-black flex items-center justify-center text-white hover:bg-[#F2002D] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon className="w-3 h-3" />
              </a>
            ))}
          </div>

          {/* Navigation Menu Section */}
          <nav className="flex flex-wrap justify-center items-center gap-x-2 md:gap-x-0">
            {footerLinks.map((link, idx) => (
              <React.Fragment key={link.name}>
                <Link
                  href={link.href}
                  className="text-white text-[16px] font-normal uppercase tracking-wide px-[15px] hover:text-black/70 transition-colors"
                >
                  {link.name}
                </Link>
                {/* Separator if needed, but the original seems to just use padding */}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-white text-[#1b1b1b] text-center py-[7px] text-[16px] border-t border-[#f1f1f1] font-normal">
        <div className="max-w-[1340px] mx-auto">
          Sakoon Restaurant | © 2026 All rights reserved!
        </div>
      </div>
    </footer>
  );
}
