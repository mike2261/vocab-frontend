const POS_STYLES: Record<string, string> = {
  noun:        'bg-sky-50 text-sky-700 border-sky-200',
  verb:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  adjective:   'bg-violet-50 text-violet-700 border-violet-200',
  adverb:      'bg-amber-50 text-amber-700 border-amber-200',
  phrase:      'bg-rose-50 text-rose-700 border-rose-200',
  pronoun:     'bg-teal-50 text-teal-700 border-teal-200',
  preposition: 'bg-orange-50 text-orange-700 border-orange-200',
  conjunction: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  interjection:'bg-lime-50 text-lime-700 border-lime-200',
};

interface PosBadgeProps {
  pos: string;
  className?: string;
}

export function PosBadge({ pos, className = '' }: PosBadgeProps) {
  const style = POS_STYLES[pos.toLowerCase()] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-500 border ${style} ${className}`}>
      {pos}
    </span>
  );
}
