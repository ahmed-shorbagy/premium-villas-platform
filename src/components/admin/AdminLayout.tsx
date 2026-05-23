import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminSidebar, { MobileSidebar } from './AdminSidebar';
import { buildLocalizedPath } from '@/routes';
import { BrandMark } from '@/components/brand/BrandMark';
import { getAdminTitle } from '@/lib/brand';

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(buildLocalizedPath.adminLogin());
      } else if (!isAdmin) {
        navigate(buildLocalizedPath.adminLogin());
      }
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Desktop Sidebar - Only visible on md and up */}
      <div className="hidden md:block fixed inset-y-0 right-0 w-64 z-40">
        <AdminSidebar />
      </div>

      {/* Mobile Header - Only visible on mobile */}
      <header className="md:hidden sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4">
        <MobileSidebar />
        <div className="flex items-center gap-2">
          <BrandMark size="sm" />
          <span className="font-display font-bold text-lg">{getAdminTitle()}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="md:mr-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
