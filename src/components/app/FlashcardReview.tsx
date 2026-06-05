'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PosBadge } from '@/components/app/PosBadge';

interface Example {
  sentence: string;
  translation?: string | null;
}

interface Meaning {
  partOfSpeech?: string;
  definition: string;
  translation?: string | null;
  examples?: Example[];
  cefrLevel?: string | null;
}

interface VocabWord {
  id: string;
  word: string;
  pronunciationUk?: string | null;
  pronunciationUs?: string | null;
  meanings?: Meaning[];
}

export function FlashcardReview() {
  const { token } = useAuth();
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDueWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: VocabWord[] }>(
        '/vocabularies/due?limit=20',
        token ?? undefined,
      );
      setQueue(res.data);
      setCurrentIndex(0);
      setIsFlipped(false);
      setCompleted(res.data.length === 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load words');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDueWords();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchDueWords]);

  const currentWord = queue[currentIndex];
  const total = queue.length;

  function handleNextCard() {
    if (!currentWord) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      setCompleted(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setIsFlipped(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-24">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchDueWords}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-500 hover:bg-primary-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (completed || queue.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-primary-500" />
        </div>
        <div>
          <h2 className="text-2xl font-700 text-neutral-900 mb-2">
            Stack finished
          </h2>
          <p className="text-neutral-500 text-sm">
            You&apos;ve gone through all visible flashcards in this session.
          </p>
        </div>
        <button
          onClick={fetchDueWords}
          className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-500 text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <RotateCcw size={15} />
          Check again
        </button>
      </div>
    );
  }

  const meanings = currentWord.meanings ?? [];

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
          <span>
            {currentIndex + 1} / {total}
          </span>
          <span>{Math.round(((currentIndex + 1) / total) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="relative h-64 cursor-pointer mb-6"
        style={{ perspective: '1000px' }}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div
          className="w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p
              className="text-3xl font-600 text-neutral-900 mb-3"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {currentWord.word}
            </p>
            {(currentWord.pronunciationUk || currentWord.pronunciationUs) && (
              <p className="text-sm text-neutral-400 font-mono mb-4">
                {currentWord.pronunciationUk ?? currentWord.pronunciationUs}
              </p>
            )}
            <p className="text-xs text-neutral-400 mt-auto">
              Tap to reveal meaning
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white border border-primary-200 rounded-2xl shadow-sm overflow-y-auto p-6"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p
              className="text-xl font-600 text-neutral-900 mb-4 font-mono"
            >
              {currentWord.word}
            </p>
            <div className="space-y-3">
              {meanings.slice(0, 3).map((m, i) => (
                <div key={i}>
                  {m.partOfSpeech && <PosBadge pos={m.partOfSpeech} className="mb-1" />}
                  <p className="text-sm text-neutral-700">{m.definition}</p>
                  {m.translation && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {m.translation}
                    </p>
                  )}
                  {m.examples?.[0] && (
                    <p className="text-xs text-neutral-400 italic mt-1 border-l-2 border-neutral-200 pl-2">
                      {m.examples[0].sentence}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next card */}
      {isFlipped && (
        <div className="flex justify-center">
          <button
            onClick={handleNextCard}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-500 text-white transition-colors hover:bg-primary-600"
          >
            Next card
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {!isFlipped && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsFlipped(true)}
            className="px-6 py-2.5 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Show answer
          </button>
        </div>
      )}
    </div>
  );
}
