'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Listings', href: '/admin/listings' },
  { name: 'Settings', href: '/admin/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex items-center justify-center h-16 bg-white border-b">
          <h1 className="text-2xl font-bold text-primary">MotoAuto.ch</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto bg-white">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  pathname === link.href
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}