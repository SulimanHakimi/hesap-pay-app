'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const nav = [
  { href: '/dashboard',          label: 'Overview'  },
  { href: '/dashboard/products', label: 'Products'  },
  { href: '/dashboard/services', label: 'Services'  },
  { href: '/dashboard/orders',   label: 'Orders'    },
  { href: '/dashboard/settings', label: 'Settings'  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-sm">Sheen Store</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(item => {
            const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
