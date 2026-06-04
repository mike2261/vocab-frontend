'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Search, Sparkles, X, Zap } from 'lucide-react';
import { TopBar } from '@/components/app/TopBar';
import { VocabCard } from '@/components/app/VocabCard';
import { FlashcardReview } from '@/components/app/FlashcardReview';
import { PassageModal } from '@/components/app/PassageModal';
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

const STAGE_TABS = [
  { label: 'All', value: 0 },
  { label: 'New', value: 1 },
  { label: 'Learning', value: 2 },
  { label: 'Familiar', value: 3 },
  { label: 'Confident', value: 4 },
  { label: 'Mastered', value: 5 },
];

const PAGE_SIZE = 20;

export default function DashboardPage() {
  const { token } = useAuth();

  const [dueWords, setDueWords] = useState<VocabWord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const [words, setWords] = useState<VocabWord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stageFilter, setStageFilter] = useState(0);
  const [vocabLoading, setVocabLoading] = useState(true);
  const [vocabError, setVocabError] = useState<string | null>(null);

  const [showReview, setShowReview] = useState(false);
  const [showPassageModal, setShowPassageModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    setStatsLoading(true);
    api
      .get<{ data: VocabWord[] }>('/vocabularies/due?limit=100', token)
      .then((res) => setDueWords(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchVocab = useCallback(async () => {
    if (!token) return;
    setVocabLoading(true);
    setVocabError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (stageFilter > 0) params.set('stage', String(stageFilter));
      const res = await api.get<{
        data: VocabWord[];
        meta?: { total: number };
      }>(`/vocabularies?${params.toString()}`, token);
      setWords(res.data);
      setTotal(res.meta?.total ?? res.data.length);
      if (page === 1 && !debouncedSearch && stageFilter === 0) {
        setTotalCount(res.meta?.total ?? res.data.length);
      }
    } catch (err: unknown) {
      setVocabError(err instanceof Error ? err.message : 'Failed to load words');
    } finally {
      setVocabLoading(false);
    }
  }, [token, page, debouncedSearch, stageFilter]);

  useEffect(() => {
    fetchVocab();
  }, [fetchVocab]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col flex-1">
      <TopBar />

      {/* Review overlay */}
      {showReview && (
        <div className="fixed inset-0 z-50 bg-neutral-50 flex flex-col">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-neutral-200 bg-white shrink-0">
            <span className="text-sm font-600 text-neutral-900">Flashcard Review</span>
            <button
              onClick={() => setShowReview(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <FlashcardReview />
          </div>
        </div>
      )}

      <main className="flex-1 p-6 space-y-5">
        {/* Stats + actions */}
        <div className="flex flex-wrap items-center gap-3">
          {statsLoading ? (
            <Loader2 size={16} className="animate-spin text-neutral-400" />
          ) : (
            <>
              <div className="flex items-center gap-4 bg-white border border-neutral-200 rounded-xl px-5 py-3 shadow-sm">
                <div className="text-center">
                  <p className="text-2xl font-700 text-neutral-900">{dueWords.length}</p>
                  <p className="text-xs text-neutral-400 font-500">Due today</p>
                </div>
                <div className="w-px h-8 bg-neutral-100" />
                <div className="text-center">
                  <p className="text-2xl font-700 text-neutral-900">{totalCount}</p>
                  <p className="text-xs text-neutral-400 font-500">Total words</p>
                </div>
              </div>

              {dueWords.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReview(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Zap size={15} strokeWidth={2.5} />
                    Review ({dueWords.length})
                  </button>
                  <button
                    onClick={() => setShowPassageModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-neutral-300 text-neutral-700 text-sm font-500 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <Sparkles size={15} />
                    Passage
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Vocabulary */}
        <div>
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

          {!vocabLoading && (
            <p className="text-sm text-neutral-400 mb-4">
              {total} word{total !== 1 ? 's' : ''}
              {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
            </p>
          )}

          {vocabLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={28} className="animate-spin text-primary-500" />
            </div>
          )}

          {vocabError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {vocabError}
            </div>
          )}

          {!vocabLoading && !vocabError && words.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-24 text-center">
              <p className="text-neutral-500 text-sm">
                {debouncedSearch
                  ? `No words found for "${debouncedSearch}"`
                  : 'No words yet. Add your first word!'}
              </p>
            </div>
          )}

          {!vocabLoading && words.length > 0 && (
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
        </div>
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
