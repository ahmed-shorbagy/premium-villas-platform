import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import { buildLocalizedPath } from "@/routes";
import { siteConfig } from "@/config";
import { getBrandName, getCopyrightLine } from "@/lib/brand";
import { BrandMark } from "@/components/brand/BrandMark";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const socialLinks = [
  { key: "x" as const, label: "X", Icon: XIcon },
  { key: "facebook" as const, label: "Facebook", Icon: Facebook },
  { key: "instagram" as const, label: "Instagram", Icon: Instagram },
  { key: "tiktok" as const, label: "TikTok", Icon: TikTokIcon },
  { key: "youtube" as const, label: "YouTube", Icon: Youtube },
];

const Footer = () => {
  const brandName = getBrandName();
  const activeSocial = socialLinks.filter(({ key }) => siteConfig.social[key]?.trim());

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to={buildLocalizedPath.home()} className="mb-4 flex items-center gap-2.5">
              <BrandMark size="md" />
              <span className="font-display text-xl font-semibold">
                {brandName ?? siteConfig.seo.defaultTitleAr}
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/70">{siteConfig.brand.taglineAr}</p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={buildLocalizedPath.propertyType("شقق")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                >
                  شقق
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType("فلل")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                >
                  فلل
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType("تجاري")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                >
                  تجاري
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType("دوبلكس")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                >
                  دوبلكس
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType("اراضي")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                >
                  أراضي
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType("مكاتب")}
                  className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                >
                  مكاتب
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">المناطق الشائعة</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>الرياض</li>
              <li>دبي</li>
              <li>القاهرة</li>
              <li>جدة</li>
              <li>الكويت</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">تواصل معنا</h4>
            <ul className="space-y-3">
              {siteConfig.contact.phone ? (
                <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Phone className="h-4 w-4 text-gold" />
                  <span dir="ltr">{siteConfig.contact.phone}</span>
                </li>
              ) : null}
              {siteConfig.contact.email ? (
                <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Mail className="h-4 w-4 text-gold" />
                  <span dir="ltr">{siteConfig.contact.email}</span>
                </li>
              ) : null}
              {siteConfig.contact.locationAr ? (
                <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {siteConfig.contact.locationAr}
                </li>
              ) : (
                <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Phone className="h-4 w-4 text-gold" />
                  <span dir="ltr">{siteConfig.contact.adminWhatsAppDisplay}</span>
                </li>
              )}
            </ul>

            {activeSocial.length > 0 ? (
              <div className="mt-4 flex items-center gap-3">
                {activeSocial.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={siteConfig.social[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/70 transition-colors hover:text-gold"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/40">
              Developed by
            </span>
            <div className="group flex cursor-default flex-col items-center transition-transform duration-300 hover:scale-105">
              <span className="text-4xl font-bold leading-none tracking-tighter text-primary-foreground">
                DEVO
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-primary-foreground/60">
                Software Services
              </span>
            </div>
          </div>
          <div className="text-sm text-primary-foreground/50">{getCopyrightLine()}</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
