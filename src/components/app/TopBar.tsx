'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronDown, LogOut, Plus, Settings } from 'lucide-react';
import { AddWordModal } from '@/components/app/AddWordModal';
import { useAuth } from '@/contexts/AuthContext';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function handleLogout() {
    setShowMenu(false);
    logout();
    router.push('/login');
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500 shadow-[0_12px_24px_rgba(21,195,154,0.18)]">
                <BookOpen size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-700 tracking-tight text-neutral-900">Lexio</p>
                <p className="text-xs text-neutral-400">Vocabulary cockpit</p>
              </div>
            </Link>

            {title && <p className="hidden truncate text-sm font-600 text-neutral-800 md:block">{title}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-2 text-sm font-600 text-white transition-colors hover:bg-primary-600 sm:px-4"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add word</span>
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1.5 pl-1.5 pr-2 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                aria-label="Open account menu"
                aria-expanded={showMenu}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-700 text-primary-700">
                  {user?.display_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-32 truncate text-sm font-500 text-neutral-900">
                    {user?.display_name ?? 'Account'}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-neutral-400 transition-transform ${showMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                  <div className="border-b border-neutral-100 px-4 py-3">
                    <p className="text-sm font-600 text-neutral-900">{user?.display_name ?? 'Account'}</p>
                    <p className="truncate text-xs text-neutral-400">{user?.email}</p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/settings"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-500 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-500 text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showModal && <AddWordModal onClose={() => setShowModal(false)} />}
    </>
  );
}
