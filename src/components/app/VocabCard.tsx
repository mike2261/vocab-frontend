'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { StageBadge } from '@/components/app/StageBadge';
import { PosBadge } from '@/components/app/PosBadge';
import { addDays, getAppDateKey, parseApiDate } from '@/lib/datetime';

interface Meaning {
  definition: string;
  partOfSpeech?: string;
}

interface VocabCardProps {
  id: string;
  word: string;
  stage: number;
  meanings?: Meaning[];
  nextReviewAt?: string | null;
}

function formatNextReview(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not scheduled';
  const date = parseApiDate(dateStr);
  if (!date) return 'Not scheduled';
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0) return 'Due now';
  const todayKey = getAppDateKey(now);
  const reviewKey = getAppDateKey(date);
  if (reviewKey === todayKey) return 'Due today';
  if (reviewKey === getAppDateKey(addDays(now, 1))) return 'Due tomorrow';
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `Due in ${diffDays} days`;
}

export function VocabCard({
  id,
  word,
  stage,
  meanings,
  nextReviewAt,
}: VocabCardProps) {
  const firstMeaning = meanings?.[0];

  return (
    <Link
      href={`/vocabulary/${id}`}
      className="block bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md hover:border-neutral-300 transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-600 text-neutral-900 group-hover:text-primary-600 transition-colors font-mono">
          {word}
        </h3>
        <StageBadge stage={stage} />
      </div>

      {firstMeaning && (
        <div className="mb-3">
          {firstMeaning.partOfSpeech && (
            <PosBadge pos={firstMeaning.partOfSpeech} className="mb-1.5" />
          )}
          <p className="text-sm text-neutral-500 line-clamp-2">{firstMeaning.definition}</p>
          {meanings && meanings.length > 1 && (
            <p className="text-xs text-neutral-400 mt-1">
              +{meanings.length - 1} more meaning{meanings.length - 1 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Clock size={12} />
        {formatNextReview(nextReviewAt)}
      </div>
    </Link>
  );
}
