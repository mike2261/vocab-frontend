import { AuthProvider } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/app/Sidebar';
import { ProtectedRoute } from '@/components/app/ProtectedRoute';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen bg-neutral-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">{children}</div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
