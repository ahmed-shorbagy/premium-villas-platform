import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HypeControllerProvider } from "@/context/HypeController";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import { getLocalizedRoutes, buildLocalizedPath } from "./routes";
import { ActivityTracker } from "./components/ActivityTracker";
import { SiteShell } from "./components/layout/SiteShell";

const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Listings = lazy(() => import("./pages/admin/Listings"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const PropertyForm = lazy(() => import("./pages/admin/PropertyForm"));
const Banners = lazy(() => import("./pages/admin/Banners"));
const Reservations = lazy(() => import("./pages/admin/Reservations"));
const Owners = lazy(() => import("./pages/admin/Owners"));
const OwnerPortal = lazy(() => import("./pages/OwnerPortal"));
const PropertyTypePage = lazy(() => import("./pages/PropertyTypePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const localizedRoutes = getLocalizedRoutes();
const englishRoutes = getLocalizedRoutes("en");
const adminListingsPath = localizedRoutes.adminListings
  .replace(`${localizedRoutes.adminDashboard}/`, "")
  .replace(`${localizedRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const adminBannersPath = localizedRoutes.adminBanners
  .replace(`${localizedRoutes.adminDashboard}/`, "")
  .replace(`${localizedRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const adminSettingsPath = localizedRoutes.adminSettings
  .replace(`${localizedRoutes.adminDashboard}/`, "")
  .replace(`${localizedRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const legacyAdminListingsPath = englishRoutes.adminListings
  .replace(`${englishRoutes.adminDashboard}/`, "")
  .replace(`${englishRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const legacyAdminBannersPath = englishRoutes.adminBanners
  .replace(`${englishRoutes.adminDashboard}/`, "")
  .replace(`${englishRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const legacyAdminSettingsPath = englishRoutes.adminSettings
  .replace(`${englishRoutes.adminDashboard}/`, "")
  .replace(`${englishRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const adminReservationsPath = localizedRoutes.adminReservations
  .replace(`${localizedRoutes.adminDashboard}/`, "")
  .replace(`${localizedRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const legacyAdminReservationsPath = englishRoutes.adminReservations
  .replace(`${englishRoutes.adminDashboard}/`, "")
  .replace(`${englishRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const adminOwnersPath = localizedRoutes.adminOwners
  .replace(`${localizedRoutes.adminDashboard}/`, "")
  .replace(`${localizedRoutes.adminDashboard}`, "")
  .replace(/^\//, "");
const legacyAdminOwnersPath = englishRoutes.adminOwners
  .replace(`${englishRoutes.adminDashboard}/`, "")
  .replace(`${englishRoutes.adminDashboard}`, "")
  .replace(/^\//, "");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HypeControllerProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SiteShell>
              <ActivityTracker />
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path={localizedRoutes.home} element={<Index />} />

                <Route path={localizedRoutes.propertyDetails} element={<PropertyDetails />} />
                <Route path={englishRoutes.propertyDetails} element={<PropertyDetails />} />
                <Route path="/عقار/:id" element={<PropertyDetails />} />

                <Route path={localizedRoutes.submitListing} element={<Navigate to={localizedRoutes.home} replace />} />
                <Route path={englishRoutes.submitListing} element={<Navigate to={englishRoutes.home} replace />} />
                <Route path="/لوحة-التحكم/العقارات/*" element={<Navigate to={buildLocalizedPath.adminListings()} replace />} />

                <Route path={localizedRoutes.adminLogin} element={<AdminLogin />} />
                <Route path={englishRoutes.adminLogin} element={<AdminLogin />} />
                <Route path={localizedRoutes.ownerPortal} element={<OwnerPortal />} />

                <Route path={localizedRoutes.propertyType} element={<PropertyTypePage />} />
                <Route path={englishRoutes.propertyType} element={<PropertyTypePage />} />

                <Route path={localizedRoutes.adminDashboard} element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path={adminListingsPath} element={<Listings />} />
                  <Route path={`${adminListingsPath}/new`} element={<PropertyForm />} />
                  <Route path={`${adminListingsPath}/:id`} element={<PropertyForm />} />
                  <Route path={adminBannersPath} element={<Banners />} />
                  <Route path={adminReservationsPath} element={<Reservations />} />
                  <Route path={adminOwnersPath} element={<Owners />} />
                  <Route path={adminSettingsPath} element={<Settings />} />
                </Route>

                <Route path={englishRoutes.adminDashboard} element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path={legacyAdminListingsPath} element={<Listings />} />
                  <Route path={`${legacyAdminListingsPath}/new`} element={<PropertyForm />} />
                  <Route path={`${legacyAdminListingsPath}/:id`} element={<PropertyForm />} />
                  <Route path={legacyAdminBannersPath} element={<Banners />} />
                  <Route path={legacyAdminReservationsPath} element={<Reservations />} />
                  <Route path={legacyAdminOwnersPath} element={<Owners />} />
                  <Route path={legacyAdminSettingsPath} element={<Settings />} />
                </Route>

                <Route path={localizedRoutes.notFound} element={<NotFound />} />
              </Routes>
              </Suspense>
            </SiteShell>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HypeControllerProvider>
  </QueryClientProvider>
);

export default App;
