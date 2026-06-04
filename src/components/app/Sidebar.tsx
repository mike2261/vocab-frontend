'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, Settings, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebar();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-60 shrink-0
          flex flex-col border-r border-neutral-200 bg-white
          transition-transform duration-200 ease-in-out
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo row */}
        <div className="px-5 h-16 flex items-center justify-between border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <BookOpen size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-700 text-neutral-900 text-base tracking-tight">
              Lexio
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mb-0.5" />
          </div>
          <button
            onClick={close}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1" />

        {/* User footer */}
        <div className="border-t border-neutral-100 px-3 py-4 shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-600 shrink-0">
              {user?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-500 text-neutral-900 truncate">
                {user?.display_name}
              </p>
              <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Link
              href="/settings"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
            >
              <Settings size={14} />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
