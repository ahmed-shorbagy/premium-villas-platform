import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import PropertyDetails from "./pages/PropertyDetails";
import SubmitListing from "./pages/SubmitListing";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Listings from "./pages/admin/Listings";
import Settings from "./pages/admin/Settings";
import PropertyForm from "./pages/admin/PropertyForm";
import Banners from "./pages/admin/Banners";
import ListingRequests from "./pages/admin/ListingRequests";
import PropertyTypePage from "./pages/PropertyTypePage";
import NotFound from "./pages/NotFound";
import { getLocalizedRoutes } from "./routes";
import { ActivityTracker } from "./components/ActivityTracker";

const queryClient = new QueryClient();

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
const adminListingRequestsPath = localizedRoutes.adminListingRequests
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
const legacyAdminListingRequestsPath = englishRoutes.adminListingRequests
  .replace(`${englishRoutes.adminDashboard}/`, "")
  .replace(`${englishRoutes.adminDashboard}`, "")
  .replace(/^\//, "");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ActivityTracker />
          <Routes>
            <Route path={localizedRoutes.home} element={<Index />} />

            <Route path={localizedRoutes.propertyDetails} element={<PropertyDetails />} />
            <Route path={englishRoutes.propertyDetails} element={<PropertyDetails />} />

            <Route path={localizedRoutes.submitListing} element={<SubmitListing />} />
            <Route path={englishRoutes.submitListing} element={<SubmitListing />} />

            <Route path={localizedRoutes.adminLogin} element={<AdminLogin />} />
            <Route path={englishRoutes.adminLogin} element={<AdminLogin />} />

            <Route path={localizedRoutes.propertyType} element={<PropertyTypePage />} />
            <Route path={englishRoutes.propertyType} element={<PropertyTypePage />} />

            <Route path={localizedRoutes.adminDashboard} element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path={adminListingsPath} element={<Listings />} />
              <Route path={`${adminListingsPath}/new`} element={<PropertyForm />} />
              <Route path={`${adminListingsPath}/:id`} element={<PropertyForm />} />
              <Route path={adminBannersPath} element={<Banners />} />
              <Route path={adminListingRequestsPath} element={<ListingRequests />} />
              <Route path={adminSettingsPath} element={<Settings />} />
            </Route>

            <Route path={englishRoutes.adminDashboard} element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path={legacyAdminListingsPath} element={<Listings />} />
              <Route path={`${legacyAdminListingsPath}/new`} element={<PropertyForm />} />
              <Route path={`${legacyAdminListingsPath}/:id`} element={<PropertyForm />} />
              <Route path={legacyAdminBannersPath} element={<Banners />} />
              <Route path={legacyAdminListingRequestsPath} element={<ListingRequests />} />
              <Route path={legacyAdminSettingsPath} element={<Settings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path={localizedRoutes.notFound} element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

