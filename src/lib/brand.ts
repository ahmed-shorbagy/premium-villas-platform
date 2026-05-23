import { siteConfig } from "@/config/site";

export function getBrandName(): string {
  return siteConfig.brand.name;
}

export function getBrandNameAr(): string {
  return siteConfig.brand.nameAr;
}

export function getAdminTitle(): string {
  return `${siteConfig.brand.name} — لوحة الإدارة`;
}

export function getCopyrightLine(): string {
  const year = new Date().getFullYear();
  return `© ${year} ${siteConfig.brand.name}. جميع الحقوق محفوظة.`;
}
