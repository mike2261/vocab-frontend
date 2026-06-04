'use client';

import { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { AddWordModal } from '@/components/app/AddWordModal';
import { useSidebar } from '@/contexts/SidebarContext';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { toggle } = useSidebar();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-neutral-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggle}
            className="lg:hidden p-2 -ml-1 rounded-lg text-neutral-500 hover:bg-neutral-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base sm:text-lg font-600 text-neutral-900">{title}</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Add word</span>
        </button>
      </header>

      {showModal && <AddWordModal onClose={() => setShowModal(false)} />}
    </>
  );
}
