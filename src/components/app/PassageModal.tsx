'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Word {
  id: string;
  word: string;
}

interface PassageModalProps {
  words: Word[];
  onClose: () => void;
}

const TOPIC_SUGGESTIONS = [
  'Technology', 'Travel', 'Business', 'Science',
  'Daily life', 'Nature', 'Health', 'Education',
];

function highlightWords(text: string, words: string[]): ReactNode[] {
  if (!words.length || !text) return [text];
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <mark key={match.index} className="bg-primary-100 text-primary-800 rounded px-0.5 not-italic">
        {match[0]}
      </mark>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

export function PassageModal({ words, onClose }: PassageModalProps) {
  const { token } = useAuth();
  const [topic, setTopic] = useState('');
  const [passage, setPassage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim() || !token) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await api.post<{ data: { passage: string } }>(
        '/passages/generate',
        { wordIds: words.map(w => w.id), topic: topic.trim() },
        token,
      );
      setPassage(res.data.passage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate passage');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-primary-500" />
            <h2 className="text-base font-600 text-neutral-900">Generate Passage</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Word chips */}
          <div>
            <p className="text-xs font-500 text-neutral-500 uppercase tracking-wide mb-2">
              Vocabulary words ({words.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {words.slice(0, 30).map(w => (
                <span
                  key={w.id}
                  className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-500 rounded-full border border-primary-200 font-mono"
                >
                  {w.word}
                </span>
              ))}
              {words.length > 30 && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-xs font-500 rounded-full">
                  +{words.length - 30} more
                </span>
              )}
            </div>
          </div>

          {/* Topic input */}
          <div>
            <label className="text-xs font-500 text-neutral-500 uppercase tracking-wide mb-2 block">
              Topic / Context
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isGenerating && generate()}
              placeholder="e.g. technology, travel, business, science…"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {TOPIC_SUGGESTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-500 border transition-colors ${
                    topic === t
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Generated passage */}
          {passage && (
            <div>
              <p className="text-xs font-500 text-neutral-500 uppercase tracking-wide mb-2">
                Generated Passage
              </p>
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-800 leading-7">
                {highlightWords(passage, words.map(w => w.word))}
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                Highlighted words are from your vocabulary list.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-neutral-600 text-sm font-500 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={generate}
            disabled={!topic.trim() || isGenerating}
            className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white text-sm font-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating…
              </>
            ) : passage ? (
              <>
                <RefreshCw size={14} />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
