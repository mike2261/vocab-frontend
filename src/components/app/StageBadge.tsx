interface StageBadgeProps {
  stage: number;
  className?: string;
}

const STAGE_MAP: Record<
  number,
  { label: string; className: string }
> = {
  1: {
    label: 'New',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  2: {
    label: 'Learning',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  3: {
    label: 'Familiar',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  4: {
    label: 'Confident',
    className: 'bg-primary-50 text-primary-700 border-primary-200',
  },
  5: {
    label: 'Mastered',
    className: 'bg-green-50 text-green-800 border-green-200',
  },
};

export function StageBadge({ stage, className = '' }: StageBadgeProps) {
  const config = STAGE_MAP[stage] ?? STAGE_MAP[1];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-500 border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
