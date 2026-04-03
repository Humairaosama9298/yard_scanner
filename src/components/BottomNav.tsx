"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Camera, FileText } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Scanner', path: '/', icon: Camera },
    { label: 'Logs', path: '/logs', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800">
      <div className="max-w-lg mx-auto flex">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                isActive
                  ? 'text-blue-500 bg-blue-500/5'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
