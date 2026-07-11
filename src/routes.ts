export type SupportedLocale = "ar" | "en";

type RouteKey =
  | "home"
  | "propertyDetails"
  | "submitListing"
  | "adminLogin"
  | "adminDashboard"
  | "adminListings"
  | "adminSettings"
  | "adminBanners"
  | "adminListingRequests"
  | "adminReservations"
  | "propertyType"
  | "notFound";

type LocaleRoutes = Record<RouteKey, string>;

export const DEFAULT_LOCALE: SupportedLocale = "ar";

const LOCALIZED_ROUTES: Record<SupportedLocale, LocaleRoutes> = {
  ar: {
    home: "/",
    propertyDetails: "/p/:id",
    submitListing: "/submit",
    adminLogin: "/admin/login",
    adminDashboard: "/admin",
    adminListings: "/admin/listings",
    adminSettings: "/admin/settings",
    adminBanners: "/admin/banners",
    adminListingRequests: "/admin/requests",
    adminReservations: "/admin/reservations",
    propertyType: "/type/:typeSlug",
    notFound: "*",
  },
  en: {
    home: "/",
    propertyDetails: "/property/:id",
    submitListing: "/submit-listing",
    adminLogin: "/admin/login",
    adminDashboard: "/admin",
    adminListings: "/admin/listings",
    adminSettings: "/admin/settings",
    adminBanners: "/admin/banners",
    adminListingRequests: "/admin/listing-requests",
    adminReservations: "/admin/reservations",
    propertyType: "/type/:typeSlug",
    notFound: "*",
  },
};

const LEGACY_ALIASES: Partial<Record<RouteKey, string[]>> = {
  propertyDetails: [LOCALIZED_ROUTES.en.propertyDetails, "/عقار/:id"],
  submitListing: [LOCALIZED_ROUTES.en.submitListing],
  adminLogin: [LOCALIZED_ROUTES.en.adminLogin],
  adminDashboard: [LOCALIZED_ROUTES.en.adminDashboard],
  adminListings: [LOCALIZED_ROUTES.en.adminListings],
  adminSettings: [LOCALIZED_ROUTES.en.adminSettings],
  adminBanners: [LOCALIZED_ROUTES.en.adminBanners],
  adminListingRequests: [LOCALIZED_ROUTES.en.adminListingRequests],
  adminReservations: [LOCALIZED_ROUTES.en.adminReservations],
};

export const getLocalizedRoutes = (locale: SupportedLocale = DEFAULT_LOCALE) =>
  LOCALIZED_ROUTES[locale];

export const getLegacyAliases = () => LEGACY_ALIASES;

export const buildLocalizedPath = {
  home: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].home,
  propertyDetails: (id: string, locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].propertyDetails.replace(":id", id),
  submitListing: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].submitListing,
  adminLogin: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].adminLogin,
  adminDashboard: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].adminDashboard,
  adminListings: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].adminListings,
  adminSettings: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].adminSettings,
  adminBanners: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].adminBanners,
  adminListingRequests: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].adminListingRequests,
  adminReservations: (locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].adminReservations,
  propertyType: (typeSlug: string, locale: SupportedLocale = DEFAULT_LOCALE) =>
    LOCALIZED_ROUTES[locale].propertyType.replace(":typeSlug", typeSlug),
};

