'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { StageBadge } from '@/components/app/StageBadge';

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
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0) return 'Due now';
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
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
        <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
          {firstMeaning.partOfSpeech && (
            <span className="text-xs text-neutral-400 mr-1">
              {firstMeaning.partOfSpeech}
            </span>
          )}
          {firstMeaning.definition}
        </p>
      )}

      {meanings && meanings.length > 1 && (
        <p className="text-xs text-neutral-400 mb-3">
          +{meanings.length - 1} more meaning{meanings.length - 1 !== 1 ? 's' : ''}
        </p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Clock size={12} />
        {formatNextReview(nextReviewAt)}
      </div>
    </Link>
  );
}
