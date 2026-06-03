'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AddWordModalProps {
  onClose: () => void;
}

export function AddWordModal({ onClose }: AddWordModalProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await api.post<{ data: { id: string } }>(
        '/vocabularies',
        { word: word.trim() },
        token ?? undefined,
      );
      onClose();
      router.push(`/vocabulary/${res.data.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add word';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-600 text-neutral-900">Add new word</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-neutral-500 mb-4">
          Enter a word and our AI will generate meanings, examples, and
          translations automatically.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="word-input"
              className="block text-sm font-500 text-neutral-700 mb-1.5"
            >
              Word or phrase
            </label>
            <input
              id="word-input"
              type="text"
              autoFocus
              required
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. ephemeral, break the ice…"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-300 rounded-lg text-sm font-500 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !word.trim()}
              className="flex-1 py-2.5 bg-primary-500 text-white font-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  AI is working…
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add word
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
