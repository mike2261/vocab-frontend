'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddWordModal } from '@/components/app/AddWordModal';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-600 text-neutral-900">{title}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add word
        </button>
      </header>

      {showModal && <AddWordModal onClose={() => setShowModal(false)} />}
    </>
  );
}
