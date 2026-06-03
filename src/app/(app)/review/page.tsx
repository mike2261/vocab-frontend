import { TopBar } from '@/components/app/TopBar';
import { FlashcardReview } from '@/components/app/FlashcardReview';

export default function ReviewPage() {
  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Review" />
      <main className="flex-1 p-6">
        <FlashcardReview />
      </main>
    </div>
  );
}
