'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ChevronUp, Loader2, Sparkles, Zap } from 'lucide-react';
import { TopBar } from '@/components/app/TopBar';
import { PassageModal } from '@/components/app/PassageModal';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Meaning {
  definition: string;
  partOfSpeech?: string;
}

interface VocabWord {
  id: string;
  word: string;
  meanings?: Meaning[];
  createdAt?: string;
}

function isToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function WordTable({ words }: { words: VocabWord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-neutral-100">
            <th className="px-4 sm:px-5 py-3 text-xs font-500 text-neutral-400 uppercase tracking-wide">Word</th>
            <th className="px-4 sm:px-5 py-3 text-xs font-500 text-neutral-400 uppercase tracking-wide">Definition (EN)</th>
            <th className="hidden sm:table-cell px-4 sm:px-5 py-3 text-xs font-500 text-neutral-400 uppercase tracking-wide">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {words.map(w => {
            const first = w.meanings?.[0];
            return (
              <tr key={w.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 sm:px-5 py-3 w-28 sm:w-36">
                  <Link
                    href={`/vocabulary/${w.id}`}
                    className="font-600 text-sm text-neutral-900 hover:text-primary-600 transition-colors font-mono"
                  >
                    {w.word}
                  </Link>
                </td>
                <td className="px-4 sm:px-5 py-3 text-sm text-neutral-600">
                  <span className="line-clamp-1">{first?.definition ?? '—'}</span>
                </td>
                <td className="hidden sm:table-cell px-4 sm:px-5 py-3 w-32 shrink-0">
                  {first?.partOfSpeech ? (
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs font-500">
                      {first.partOfSpeech}
                    </span>
                  ) : (
                    <span className="text-neutral-300 text-sm">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [dueWords, setDueWords] = useState<VocabWord[]>([]);
  const [newWords, setNewWords] = useState<VocabWord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showNewWords, setShowNewWords] = useState(false);
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [dueRes, totalRes, recentRes] = await Promise.all([
          api.get<{ data: VocabWord[] }>('/vocabularies/due?limit=100', token!),
          api.get<{ meta: { total: number } }>('/vocabularies?page=1&pageSize=1', token!),
          api.get<{ data: VocabWord[] }>(
            '/vocabularies?page=1&pageSize=200&sort=createdAt&order=desc',
            token!,
          ),
        ]);
        setDueWords(dueRes.data);
        setTotalCount(totalRes.meta?.total ?? 0);
        setNewWords(recentRes.data.filter(w => isToday(w.createdAt)));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Dashboard" />

      <main className="flex-1 p-6 space-y-5">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wide font-500 mb-1">
                  Due today
                </p>
                <p className="text-3xl font-700 text-neutral-900">{dueWords.length}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {dueWords.length === 0
                    ? 'All caught up!'
                    : `${dueWords.length} word${dueWords.length !== 1 ? 's' : ''} to review`}
                </p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wide font-500 mb-1">
                  New today
                </p>
                <p className="text-3xl font-700 text-neutral-900">{newWords.length}</p>
                <p className="text-xs text-neutral-400 mt-1">words added today</p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wide font-500 mb-1">
                  Total words
                </p>
                <p className="text-3xl font-700 text-neutral-900">{totalCount}</p>
                <p className="text-xs text-neutral-400 mt-1">in your library</p>
              </div>
            </div>

            {/* Words due today */}
            {dueWords.length > 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <h2 className="text-sm font-600 text-neutral-800">Words to Review Today</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    You have {dueWords.length} word{dueWords.length !== 1 ? 's' : ''} due for review
                  </p>
                </div>

                <WordTable words={dueWords} />

                <div className="px-5 py-4 border-t border-neutral-100 flex flex-wrap items-center gap-3">
                  <Link
                    href="/review"
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Zap size={15} strokeWidth={2.5} />
                    Review with Flashcards
                  </Link>
                  <button
                    onClick={() => setShowPassageModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-500 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <Sparkles size={15} />
                    Generate Passage
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm text-center">
                <p className="text-neutral-500 text-sm mb-4">
                  You&apos;re all caught up — no words due today.
                </p>
                <Link
                  href="/vocabulary"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-500 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <BookOpen size={15} />
                  Browse vocabulary
                </Link>
              </div>
            )}

            {/* New words toggle */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setShowNewWords(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <span className="text-sm font-600 text-neutral-800">New Words Added Today</span>
                  <span className="ml-2 text-xs text-neutral-400">({newWords.length})</span>
                </div>
                {showNewWords
                  ? <ChevronUp size={16} className="text-neutral-400 shrink-0" />
                  : <ChevronDown size={16} className="text-neutral-400 shrink-0" />}
              </button>

              {showNewWords && (
                newWords.length > 0 ? (
                  <div className="border-t border-neutral-100">
                    <WordTable words={newWords} />
                  </div>
                ) : (
                  <div className="border-t border-neutral-100 px-5 py-6 text-center">
                    <p className="text-sm text-neutral-400">No new words added today.</p>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </main>

      {showPassageModal && (
        <PassageModal
          words={dueWords}
          onClose={() => setShowPassageModal(false)}
        />
      )}
    </div>
  );
}
