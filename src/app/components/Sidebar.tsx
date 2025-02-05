"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} min-h-screen border-r dark:border-gray-800 p-4 transition-all duration-300 relative font-light`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="mb-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/tavily.svg" alt="Tavily" width={32} height={32} className="min-w-[32px]" />
          {!isCollapsed && <span className="text-xl font-normal bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">tavily</span>}
        </Link>
      </div>

      <div className="mb-8">
        {!isCollapsed && (
          <div className="px-3 mb-2">
            <select className="w-full bg-transparent text-sm font-light border-none focus:ring-0">
              <option>Personal</option>
            </select>
          </div>
        )}
      </div>

      <nav className="space-y-0.5">
        {[
          { href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Overview' },
          { href: '/assistant', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Research Assistant' },
          { href: '/reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Research Reports' },
          { href: '/playground', icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5', label: 'API Playground' },
          { href: '/invoices', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Invoices' },
          { href: '/docs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Documentation' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-normal'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            {!isCollapsed && <span className="text-sm tracking-wide">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className={`absolute bottom-4 ${isCollapsed ? 'left-0 right-0' : 'left-4'}`}>
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'px-3'} py-2`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white text-sm font-normal">
            T
          </div>
          {!isCollapsed && (
            <div className="text-sm">
              <div className="font-normal text-gray-900 dark:text-white">Thuy Phung Van</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">Settings</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 