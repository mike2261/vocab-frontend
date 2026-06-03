'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { TopBar } from '@/components/app/TopBar';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface StageThresholds {
  [stage: string]: number;
}

interface SettingsData {
  stageThresholds: StageThresholds;
}

const STAGE_LABELS: Record<string, string> = {
  '1': 'New → Learning (stage 1→2)',
  '2': 'Learning → Familiar (stage 2→3)',
  '3': 'Familiar → Confident (stage 3→4)',
  '4': 'Confident → Mastered (stage 4→5)',
};

export default function SettingsPage() {
  const { token } = useAuth();
  const [thresholds, setThresholds] = useState<StageThresholds>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.get<{ data: SettingsData }>('/settings', token!);
        setThresholds(res.data.stageThresholds ?? {});
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load settings',
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch('/settings', { stageThresholds: thresholds }, token);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Settings" />

      <main className="flex-1 p-6 max-w-2xl">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin text-primary-500" />
          </div>
        )}

        {!isLoading && (
          <form onSubmit={handleSave} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-sm text-primary-700">
                Settings saved successfully!
              </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-600 text-neutral-700 mb-1">
                Stage thresholds
              </h2>
              <p className="text-xs text-neutral-400 mb-5">
                Number of correct reviews required to advance to the next stage.
              </p>

              <div className="space-y-4">
                {Object.keys(STAGE_LABELS).map((stage) => (
                  <div key={stage} className="flex items-center gap-4">
                    <label className="flex-1 text-sm text-neutral-700">
                      {STAGE_LABELS[stage]}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={thresholds[stage] ?? 0}
                      onChange={(e) =>
                        setThresholds((prev) => ({
                          ...prev,
                          [stage]: Number(e.target.value),
                        }))
                      }
                      className="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
                    />
                    <span className="text-xs text-neutral-400 w-16">
                      reviews
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? 'Saving…' : 'Save settings'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
