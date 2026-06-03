'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { TopBar } from '@/components/app/TopBar';
import { VocabCard } from '@/components/app/VocabCard';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Meaning {
  definition: string;
  partOfSpeech?: string;
}

interface ReviewState {
  stage: number;
  nextReviewAt?: string | null;
}

interface VocabWord {
  id: string;
  word: string;
  reviewState?: ReviewState | null;
  meanings?: Meaning[];
}

interface VocabResponse {
  data: VocabWord[];
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
}

const STAGE_TABS = [
  { label: 'All', value: 0 },
  { label: 'New', value: 1 },
  { label: 'Learning', value: 2 },
  { label: 'Familiar', value: 3 },
  { label: 'Confident', value: 4 },
  { label: 'Mastered', value: 5 },
];

const PAGE_SIZE = 20;

export default function VocabularyPage() {
  const { token } = useAuth();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stageFilter, setStageFilter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchWords = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (stageFilter > 0) params.set('stage', String(stageFilter));

      const res = await api.get<VocabResponse>(
        `/vocabularies?${params.toString()}`,
        token,
      );
      setWords(res.data);
      setTotal(res.meta?.total ?? res.data.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load words');
    } finally {
      setIsLoading(false);
    }
  }, [token, page, debouncedSearch, stageFilter]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Vocabulary" />

      <main className="flex-1 p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words…"
              className="w-full pl-9 pr-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
            />
          </div>

          <div className="flex gap-1 flex-wrap">
            {STAGE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStageFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-500 transition-colors ${
                  stageFilter === tab.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Word count */}
        {!isLoading && (
          <p className="text-sm text-neutral-400 mb-4">
            {total} word{total !== 1 ? 's' : ''}
            {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && words.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-neutral-500 text-sm">
              {debouncedSearch
                ? `No words found for "${debouncedSearch}"`
                : 'No words yet. Add your first word!'}
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && words.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {words.map((w) => (
              <VocabCard
                key={w.id}
                id={w.id}
                word={w.word}
                stage={w.reviewState?.stage ?? 1}
                meanings={w.meanings}
                nextReviewAt={w.reviewState?.nextReviewAt}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
