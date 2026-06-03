'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2, Plus, Zap } from 'lucide-react';
import { TopBar } from '@/components/app/TopBar';
import { StageBadge } from '@/components/app/StageBadge';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface StageCount {
  stage: number;
  count: number;
}

interface DashboardData {
  dueCount: number;
  totalCount: number;
  stageCounts: StageCount[];
}

const STAGES = [1, 2, 3, 4, 5];

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    async function load() {
      setIsLoading(true);
      try {
        // Fetch due words (just for count), total, and per-stage counts
        const [dueRes, totalRes, ...stageResults] = await Promise.all([
          api.get<{ data: unknown[] }>('/vocabularies/due?limit=100', token!),
          api.get<{ meta: { total: number } }>(
            '/vocabularies?page=1&pageSize=1',
            token!,
          ),
          ...STAGES.map((s) =>
            api
              .get<{ meta: { total: number } }>(
                `/vocabularies?page=1&pageSize=1&stage=${s}`,
                token!,
              )
              .then((r) => ({ stage: s, count: r.meta?.total ?? 0 })),
          ),
        ]);

        setData({
          dueCount: dueRes.data.length,
          totalCount: (totalRes as { meta: { total: number } }).meta?.total ?? 0,
          stageCounts: stageResults as StageCount[],
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load dashboard',
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [token]);

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Dashboard" />

      <main className="flex-1 p-6 space-y-6">
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

        {data && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wide font-500 mb-1">
                  Due for review
                </p>
                <p className="text-3xl font-700 text-neutral-900">
                  {data.dueCount}
                </p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wide font-500 mb-1">
                  Total words
                </p>
                <p className="text-3xl font-700 text-neutral-900">
                  {data.totalCount}
                </p>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-400 uppercase tracking-wide font-500 mb-1">
                  Mastered
                </p>
                <p className="text-3xl font-700 text-neutral-900">
                  {data.stageCounts.find((s) => s.stage === 5)?.count ?? 0}
                </p>
              </div>
            </div>

            {/* Stage breakdown */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-600 text-neutral-700 mb-4">
                Stage breakdown
              </h2>
              <div className="space-y-3">
                {data.stageCounts.map(({ stage, count }) => (
                  <div key={stage} className="flex items-center gap-3">
                    <StageBadge stage={stage} className="w-24 justify-center" />
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{
                          width:
                            data.totalCount > 0
                              ? `${(count / data.totalCount) * 100}%`
                              : '0%',
                        }}
                      />
                    </div>
                    <span className="text-sm font-500 text-neutral-700 w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {data.dueCount > 0 && (
                <Link
                  href="/review"
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-500 text-white font-500 rounded-xl hover:bg-primary-600 transition-colors"
                >
                  <Zap size={18} strokeWidth={2.5} />
                  Start Review ({data.dueCount} word
                  {data.dueCount !== 1 ? 's' : ''})
                </Link>
              )}
              <Link
                href="/vocabulary"
                className="flex items-center justify-center gap-2 px-5 py-3 border border-neutral-300 text-neutral-700 font-500 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <BookOpen size={18} />
                Browse vocabulary
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
