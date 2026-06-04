'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { TopBar } from '@/components/app/TopBar';
import { VocabCard } from '@/components/app/VocabCard';
import { FlashcardReview } from '@/components/app/FlashcardReview';
import { PassageModal } from '@/components/app/PassageModal';
import { PosBadge } from '@/components/app/PosBadge';
import { StageBadge } from '@/components/app/StageBadge';
import { api } from '@/lib/api';
import { parseApiDate } from '@/lib/datetime';
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
  createdAt?: string;
  reviewState?: ReviewState | null;
  meanings?: Meaning[];
}

type ViewMode = 'cards' | 'table';
type QuickFilter = 'all' | 'due' | 'newToday';

const STAGE_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: 'New', value: 1 },
  { label: 'Learning', value: 2 },
  { label: 'Familiar', value: 3 },
  { label: 'Confident', value: 4 },
  { label: 'Mastered', value: 5 },
];

const POS_OPTIONS = ['Any', 'Noun', 'Verb', 'Adjective', 'Adverb', 'Phrase'];
const PAGE_SIZE = 20;

function formatNextReview(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = parseApiDate(dateStr);
  if (!date) return '—';
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0) return 'Due now';
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `${diffDays}d`;
}

function isSameLocalDay(dateStr: string | undefined, compareDate: Date) {
  const date = parseApiDate(dateStr);
  if (!date) return false;
  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
}

function matchesPos(word: VocabWord, posFilter: string) {
  if (posFilter === 'Any') return true;
  return word.meanings?.some((meaning) => meaning.partOfSpeech?.toLowerCase() === posFilter.toLowerCase()) ?? false;
}

function matchesStage(word: VocabWord, stageFilter: number) {
  if (stageFilter === 0) return true;
  return (word.reviewState?.stage ?? 1) === stageFilter;
}

function matchesSearch(word: VocabWord, searchValue: string) {
  if (!searchValue) return true;
  const query = searchValue.toLowerCase();
  return (
    word.word.toLowerCase().includes(query) ||
    (word.meanings?.some((meaning) => {
      return (
        meaning.definition.toLowerCase().includes(query) ||
        meaning.partOfSpeech?.toLowerCase().includes(query)
      );
    }) ?? false)
  );
}

function TableView({ words }: { words: VocabWord[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/60 text-left">
              <th className="px-4 py-3 text-xs font-500 uppercase tracking-wide text-neutral-400 sm:px-5">Word</th>
              <th className="px-4 py-3 text-xs font-500 uppercase tracking-wide text-neutral-400 sm:px-5">Definition</th>
              <th className="hidden px-4 py-3 text-xs font-500 uppercase tracking-wide text-neutral-400 sm:table-cell sm:px-5">Type</th>
              <th className="hidden px-4 py-3 text-xs font-500 uppercase tracking-wide text-neutral-400 md:table-cell sm:px-5">Stage</th>
              <th className="hidden px-4 py-3 text-xs font-500 uppercase tracking-wide text-neutral-400 lg:table-cell sm:px-5">Next review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {words.map((word) => {
              const firstMeaning = word.meanings?.[0];
              return (
                <tr key={word.id} className="transition-colors hover:bg-neutral-50/70">
                  <td className="w-32 px-4 py-3 sm:w-40 sm:px-5">
                    <Link
                      href={`/vocabulary/${word.id}`}
                      className="font-mono text-sm font-600 text-neutral-900 transition-colors hover:text-primary-600"
                    >
                      {word.word}
                    </Link>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-neutral-600 sm:px-5">
                    <span className="line-clamp-1">{firstMeaning?.definition ?? '—'}</span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell sm:px-5">
                    {firstMeaning?.partOfSpeech
                      ? <PosBadge pos={firstMeaning.partOfSpeech} />
                      : <span className="text-sm text-neutral-300">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell sm:px-5">
                    <StageBadge stage={word.reviewState?.stage ?? 1} />
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-neutral-500 lg:table-cell sm:px-5">
                    {formatNextReview(word.reviewState?.nextReviewAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();

  const [dueWords, setDueWords] = useState<VocabWord[]>([]);
  const [allWords, setAllWords] = useState<VocabWord[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stageFilter, setStageFilter] = useState(0);
  const [posFilter, setPosFilter] = useState('Any');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [hideNewWordsInDue, setHideNewWordsInDue] = useState(false);
  const [vocabLoading, setVocabLoading] = useState(true);
  const [vocabError, setVocabError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showReview, setShowReview] = useState(false);
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function loadDueWords() {
      setStatsLoading(true);
      try {
        const res = await api.get<{ data: VocabWord[] }>('/vocabularies/due?limit=100', token);
        setDueWords(res.data);
      } catch {
        setDueWords([]);
      } finally {
        setStatsLoading(false);
      }
    }

    loadDueWords();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    async function loadAllWords() {
      setVocabLoading(true);
      setVocabError(null);
      try {
        const pageSize = 100;
        let currentPage = 1;
        let totalPages = 1;
        const merged: VocabWord[] = [];

        do {
          const res = await api.get<{ data: VocabWord[]; meta?: { totalPages?: number } }>(
            `/vocabularies?page=${currentPage}&pageSize=${pageSize}`,
            token,
          );
          merged.push(...res.data);
          totalPages = res.meta?.totalPages ?? 1;
          currentPage += 1;
        } while (currentPage <= totalPages);

        setAllWords(merged);
      } catch (err: unknown) {
        setVocabError(err instanceof Error ? err.message : 'Failed to load words');
      } finally {
        setVocabLoading(false);
      }
    }

    loadAllWords();
  }, [token]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!showFilterSheet) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowFilterSheet(false);
      }
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showFilterSheet]);

  const today = new Date();
  const newWordsToday = allWords.filter((word) => isSameLocalDay(word.createdAt, today));
  const newWordsTodayIds = new Set(newWordsToday.map((word) => word.id));
  const dueWordIds = new Set(dueWords.map((word) => word.id));

  let sourceWords = allWords;
  if (quickFilter === 'due') {
    sourceWords = allWords.filter((word) => {
      if (!dueWordIds.has(word.id)) return false;
      if (!hideNewWordsInDue) return true;
      return !newWordsTodayIds.has(word.id);
    });
  } else if (quickFilter === 'newToday') {
    sourceWords = newWordsToday;
  }

  const filteredWords = sourceWords.filter((word) => {
    return (
      matchesSearch(word, debouncedSearch) &&
      matchesStage(word, stageFilter) &&
      matchesPos(word, posFilter)
    );
  });

  const total = filteredWords.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleWords = filteredWords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeFilterCount = (stageFilter > 0 ? 1 : 0) + (posFilter !== 'Any' ? 1 : 0);

  function toggleQuickFilter(nextFilter: QuickFilter) {
    setQuickFilter((current) => current === nextFilter ? 'all' : nextFilter);
    setPage(1);
  }

  function resetFilters() {
    setStageFilter(0);
    setPosFilter('Any');
    setQuickFilter('all');
    setHideNewWordsInDue(false);
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      {showReview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-50">
          <div className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
            <span className="text-sm font-600 text-neutral-900">Flashcard Review</span>
            <button
              onClick={() => setShowReview(false)}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <FlashcardReview />
          </div>
        </div>
      )}

      <main className="mx-auto flex-1 w-full max-w-7xl space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => toggleQuickFilter('due')}
              className={`rounded-[24px] border px-5 py-5 text-left transition-all ${
                quickFilter === 'due'
                  ? 'border-primary-400 bg-primary-50 shadow-[0_12px_28px_rgba(21,195,154,0.12)]'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-600 text-neutral-500">Due to review</p>
                  <p className="mt-2 text-4xl font-700 tracking-tight text-neutral-950">{dueWords.length}</p>
                  <p className="mt-2 text-sm text-neutral-500">Tap to focus only due words.</p>
                </div>
                <div className={`rounded-full p-2 ${quickFilter === 'due' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                  <Zap size={16} strokeWidth={2.5} />
                </div>
              </div>
            </button>

            <button
              onClick={() => toggleQuickFilter('newToday')}
              className={`rounded-[24px] border px-5 py-5 text-left transition-all ${
                quickFilter === 'newToday'
                  ? 'border-primary-400 bg-primary-50 shadow-[0_12px_28px_rgba(21,195,154,0.12)]'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
              }`}
            >
              <p className="text-4xl font-700 tracking-tight text-neutral-950">{newWordsToday.length}</p>
              <p className="mt-2 text-base font-600 text-neutral-900">
                {newWordsToday.length} new word{newWordsToday.length !== 1 ? 's' : ''} today
              </p>
              <p className="mt-2 text-sm text-neutral-500">Toggle to inspect today&apos;s additions.</p>
            </button>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center rounded-[24px] border border-neutral-200 bg-white px-5 py-8">
              <Loader2 size={18} className="animate-spin text-neutral-400" />
            </div>
          ) : (
            <div className="flex h-full flex-col justify-between rounded-[24px] border border-neutral-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-sm font-600 text-neutral-500">Your library</p>
                <p className="mt-2 text-3xl font-700 tracking-tight text-neutral-950">{allWords.length}</p>
                <p className="mt-2 text-sm text-neutral-500">
                  Search, filter, and switch between review pressure and fresh vocabulary without leaving the page.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {dueWords.length > 0 && (
                  <button
                    onClick={() => setShowReview(true)}
                    className="flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-600 text-white transition-colors hover:bg-primary-600"
                  >
                    <Zap size={15} strokeWidth={2.5} />
                    Review now
                  </button>
                )}
                <button
                  onClick={() => setShowPassageModal(true)}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-600 text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  <Sparkles size={15} />
                  Passage
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative max-w-sm flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search words…"
              className="w-full rounded-lg border border-neutral-300 py-2.5 pl-9 pr-3.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            <button
              onClick={() => setShowFilterSheet(true)}
              className="relative flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-600 text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <SlidersHorizontal size={16} />
              Filter
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary-500 px-2 py-0.5 text-xs font-700 text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-0.5 rounded-full bg-neutral-100 p-1">
              <button
                onClick={() => setViewMode('cards')}
                title="Card view"
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Table view"
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {!vocabLoading && (
          <div className="flex flex-wrap items-center gap-2 -mt-1">
            <p className="text-sm text-neutral-400">
              {total} word{total !== 1 ? 's' : ''}
              {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
            </p>
            {quickFilter === 'due' && (
              <label className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-600 text-neutral-600">
                <input
                  type="checkbox"
                  checked={hideNewWordsInDue}
                  onChange={(event) => {
                    setHideNewWordsInDue(event.target.checked);
                    setPage(1);
                  }}
                  className="h-3.5 w-3.5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                Hide words added today
              </label>
            )}
            {quickFilter !== 'all' && (
              <button
                onClick={() => setQuickFilter('all')}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-600 text-neutral-500 transition-colors hover:bg-white hover:text-neutral-800"
              >
                Clear quick filter
              </button>
            )}
          </div>
        )}

        {vocabLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        )}

        {vocabError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {vocabError}
          </div>
        )}

        {!vocabLoading && !vocabError && visibleWords.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-sm text-neutral-500">
              {debouncedSearch ? `No words found for "${debouncedSearch}"` : 'No words yet. Add your first word!'}
            </p>
          </div>
        )}

        {!vocabLoading && !vocabError && visibleWords.length > 0 && (
          <>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleWords.map((word) => (
                  <VocabCard
                    key={word.id}
                    id={word.id}
                    word={word.word}
                    stage={word.reviewState?.stage ?? 1}
                    meanings={word.meanings}
                    nextReviewAt={word.reviewState?.nextReviewAt}
                  />
                ))}
              </div>
            ) : (
              <TableView words={visibleWords} />
            )}
          </>
        )}

        {!vocabLoading && !vocabError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-neutral-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {showFilterSheet && (
        <>
          <button
            aria-label="Close filters"
            className="fixed inset-0 z-40 bg-neutral-950/28 backdrop-blur-[1px]"
            onClick={() => setShowFilterSheet(false)}
          />
          <section
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-[28px] border border-neutral-200 bg-white px-5 pb-6 pt-5 shadow-[0_-24px_60px_rgba(15,23,42,0.18)] md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-[28px] md:px-6 md:pt-6"
            aria-label="Filter words"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-200 md:hidden" />
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-700 tracking-tight text-neutral-950">Filter</p>
                <p className="mt-1 text-sm text-neutral-400">Tighten the list without crowding the canvas.</p>
              </div>
              <button
                onClick={resetFilters}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-600 text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Reset filters
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pb-4 md:pb-8">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-600 text-neutral-700">
                  <Filter size={15} />
                  Stage
                </div>
                <div className="rounded-[26px] bg-neutral-100 p-1">
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                    {STAGE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStageFilter(option.value);
                          setPage(1);
                        }}
                        className={`rounded-full px-3 py-3 text-sm font-500 transition-all ${
                          stageFilter === option.value
                            ? 'bg-white text-neutral-950 shadow-[0_6px_18px_rgba(15,23,42,0.12)]'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-600 text-neutral-700">Part of speech</div>
                <div className="rounded-[26px] bg-neutral-100 p-1">
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                    {POS_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setPosFilter(option);
                          setPage(1);
                        }}
                        className={`rounded-full px-3 py-3 text-sm font-500 transition-all ${
                          posFilter === option
                            ? 'bg-white text-neutral-950 shadow-[0_6px_18px_rgba(15,23,42,0.12)]'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm font-600 text-neutral-800">Quick focus</p>
                <div className="mt-3 grid gap-2">
                  <button
                    onClick={() => toggleQuickFilter('due')}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-600 transition-colors ${
                      quickFilter === 'due'
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Due to review
                  </button>
                  <button
                    onClick={() => toggleQuickFilter('newToday')}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-600 transition-colors ${
                      quickFilter === 'newToday'
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {newWordsToday.length} new word{newWordsToday.length !== 1 ? 's' : ''} today
                  </button>
                </div>
                {quickFilter === 'due' && (
                  <label className="mt-3 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-500 text-neutral-700">
                    <input
                      type="checkbox"
                      checked={hideNewWordsInDue}
                      onChange={(event) => {
                        setHideNewWordsInDue(event.target.checked);
                        setPage(1);
                      }}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                    Hide words added today
                  </label>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {showPassageModal && (
        <PassageModal words={dueWords} onClose={() => setShowPassageModal(false)} />
      )}
    </div>
  );
}
