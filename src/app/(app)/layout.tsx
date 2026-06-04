import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-50">{children}</div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
