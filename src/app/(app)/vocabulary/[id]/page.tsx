'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { TopBar } from '@/components/app/TopBar';
import { getStageLabel, StageBadge } from '@/components/app/StageBadge';
import { PosBadge } from '@/components/app/PosBadge';
import { api } from '@/lib/api';
import { formatAppDateTime } from '@/lib/datetime';
import { useAuth } from '@/contexts/AuthContext';

interface Example {
  id: string;
  sentence: string;
  translation?: string | null;
}

interface Meaning {
  id: string;
  partOfSpeech?: string;
  definition: string;
  translation?: string | null;
  examples?: Example[];
  cefrLevel?: string | null;
}

interface ReviewState {
  stage: number;
  lastReviewedAt?: string | null;
  nextReviewAt?: string | null;
}

interface ReviewHistoryItem {
  id: string;
  rating: string;
  reviewedAt: string;
}

interface VocabDetail {
  id: string;
  word: string;
  createdAt?: string;
  pronunciationUk?: string | null;
  pronunciationUs?: string | null;
  reviewState?: ReviewState | null;
  meanings?: Meaning[];
  reviewHistory?: ReviewHistoryItem[];
}

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-green-50 text-green-700',
  A2: 'bg-green-50 text-green-700',
  B1: 'bg-blue-50 text-blue-700',
  B2: 'bg-blue-50 text-blue-700',
  C1: 'bg-purple-50 text-purple-700',
  C2: 'bg-purple-50 text-purple-700',
};

export default function VocabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { token } = useAuth();

  const [id, setId] = useState<string>('');
  const [word, setWord] = useState<VocabDetail | null>(null);
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editWord, setEditWord] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id || !token) return;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [vocabRes, historyRes] = await Promise.all([
          api.get<{ data: VocabDetail }>(`/vocabularies/${id}`, token!),
          api.get<{ data: ReviewHistoryItem[] }>(
            `/reviews/history?vocabularyId=${id}&pageSize=5`,
            token!,
          ).catch(() => ({ data: [] })),
        ]);
        setWord(vocabRes.data);
        setEditWord(vocabRes.data.word);
        setReviewHistory(historyRes.data ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load word');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id, token]);

  async function handleSave() {
    if (!id || !token || !editWord.trim()) return;
    setIsSaving(true);
    try {
      const res = await api.patch<{ data: VocabDetail }>(
        `/vocabularies/${id}`,
        { word: editWord.trim() },
        token,
      );
      setWord(res.data);
      setIsEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !token) return;
    setIsDeleting(true);
    try {
      await api.delete(`/vocabularies/${id}`, token);
      router.push('/vocabulary');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Word Detail" />
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="flex flex-col flex-1">
        <TopBar title="Word Detail" />
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error ?? 'Word not found'}
          </div>
        </div>
      </div>
    );
  }

  const currentStage = word.reviewState?.stage ?? 1;
  const currentStageLabel = getStageLabel(currentStage);

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Word Detail" />

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-5">
        {/* Back */}
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to vocabulary
        </Link>

        {/* Word header */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {isEditing ? (
                <input
                  value={editWord}
                  onChange={(e) => setEditWord(e.target.value)}
                  className="text-3xl font-700 text-neutral-900 border-b-2 border-primary-500 bg-transparent focus:outline-none font-mono"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-3xl font-700 text-neutral-900"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {word.word}
                </h1>
              )}
              {(word.pronunciationUk || word.pronunciationUs) && (
                <p className="text-sm text-neutral-400 font-mono mt-1">
                  {word.pronunciationUk && <span>UK {word.pronunciationUk}</span>}
                  {word.pronunciationUk && word.pronunciationUs && <span className="mx-2">·</span>}
                  {word.pronunciationUs && <span>US {word.pronunciationUs}</span>}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StageBadge stage={currentStage} />
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditWord(word.word);
                    }}
                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 border-t border-neutral-100 pt-4 text-sm text-neutral-500">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              Added: {formatAppDateTime(word.createdAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <StageBadge stage={currentStage} className="mr-1" />
              Stage {currentStage}: {currentStageLabel}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              Last reviewed: {formatAppDateTime(word.reviewState?.lastReviewedAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              Next review: {formatAppDateTime(word.reviewState?.nextReviewAt)}
            </div>
          </div>
        </div>

        {/* Meanings */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-600 text-neutral-700 mb-4">Meanings</h2>
          {word.meanings && word.meanings.length > 0 ? (
            <div className="space-y-5">
              {word.meanings.map((m, i) => (
                <div key={i} className="pb-5 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {m.partOfSpeech && <PosBadge pos={m.partOfSpeech} />}
                    {m.cefrLevel && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-500 ${
                          CEFR_COLORS[m.cefrLevel] ?? 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {m.cefrLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-neutral-800 text-sm mb-1">
                    {m.definition}
                  </p>
                  {m.translation && (
                    <p className="text-sm text-neutral-400 mb-2">
                      {m.translation}
                    </p>
                  )}
                  {m.examples && m.examples.length > 0 && (
                    <ul className="space-y-1.5">
                      {m.examples.map((ex, j) => (
                        <li
                          key={j}
                          className="border-l-2 border-neutral-200 pl-3"
                        >
                          <p className="text-sm text-neutral-500 italic">{ex.sentence}</p>
                          {ex.translation && (
                            <p className="text-xs text-neutral-400">{ex.translation}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No meanings available</p>
          )}
        </div>

        {/* Review history */}
        {reviewHistory.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-600 text-neutral-700 mb-4">
              Recent reviews
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-neutral-400 text-left border-b border-neutral-100">
                  <th className="pb-2 font-500">Date</th>
                  <th className="pb-2 font-500">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reviewHistory.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 text-neutral-600">
                      {formatAppDateTime(r.reviewedAt)}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`capitalize font-500 ${
                          r.rating === 'forgot'
                            ? 'text-red-600'
                            : r.rating === 'hard'
                              ? 'text-orange-600'
                              : r.rating === 'good'
                                ? 'text-primary-600'
                                : 'text-blue-600'
                        }`}
                      >
                        {r.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-600 text-neutral-700 mb-3">
            Danger zone
          </h2>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-neutral-600">
                Are you sure you want to delete this word?
              </p>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-500 text-white text-sm font-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                Yes, delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 border border-neutral-300 text-neutral-600 text-sm font-500 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 text-sm font-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
              Delete word
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
