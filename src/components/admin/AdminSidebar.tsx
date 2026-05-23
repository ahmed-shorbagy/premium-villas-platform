import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Home, LogOut, Menu, Image as ImageIcon, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buildLocalizedPath } from '@/routes';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { BrandMark } from '@/components/brand/BrandMark';
import { getAdminTitle } from '@/lib/brand';

const navRoutes = {
  dashboard: buildLocalizedPath.adminDashboard(),
  listings: buildLocalizedPath.adminListings(),
  adminBanners: buildLocalizedPath.adminBanners(),
  listingRequests: buildLocalizedPath.adminListingRequests(),
  login: buildLocalizedPath.adminLogin(),
};

export const navItems = [
  { title: 'لوحة التحكم', icon: LayoutDashboard, path: navRoutes.dashboard },
  { title: 'العقارات', icon: Home, path: navRoutes.listings },
  { title: 'طلبات الإعلانات', icon: ClipboardList, path: navRoutes.listingRequests },
  { title: 'البنرات', icon: ImageIcon, path: navRoutes.adminBanners },
];

const AdminSidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate(navRoutes.login);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <BrandMark size="sm" />
        <span className="font-display text-lg font-semibold">{getAdminTitle()}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === navRoutes.dashboard}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">فتح القائمة</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-72">
        <AdminSidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

const AdminSidebar = () => {
  return (
    <aside className="h-screen w-64 flex-col border-l border-border bg-card">
      <AdminSidebarContent />
    </aside>
  );
};

export default AdminSidebar;
