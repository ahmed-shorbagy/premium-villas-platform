import { siteConfig } from "@/config/site";

/** Display name when client has set brand; otherwise undefined for neutral UI */
export function getBrandName(): string | undefined {
  const name = siteConfig.brand.nameAr?.trim();
  return name || undefined;
}

export function getBrandNameEn(): string | undefined {
  const name = siteConfig.brand.nameEn?.trim();
  return name || undefined;
}

export function getAdminTitle(): string {
  const brand = getBrandName();
  return brand ? `${brand} — لوحة الإدارة` : "لوحة الإدارة";
}

export function getCopyrightLine(): string {
  const brand = getBrandName();
  const year = new Date().getFullYear();
  if (brand) {
    return `© ${year} ${brand}. جميع الحقوق محفوظة.`;
  }
  return `© ${year} جميع الحقوق محفوظة.`;
}
