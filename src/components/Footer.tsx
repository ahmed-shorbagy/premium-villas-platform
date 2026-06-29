import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";
import { buildLocalizedPath } from "@/routes";
import { siteConfig } from "@/config";
import { getCopyrightLine } from "@/lib/brand";
import { ShimaLogo } from "@/components/brand/ShimaLogo";
import { useVillaOwnerWhatsApp } from '@/hooks/useReservations';

const Footer = () => {
  const { ownerWhatsApp, loading } = useVillaOwnerWhatsApp();

  return (
    <footer className="shima-footer relative mt-20 overflow-hidden">
      {/* Decorative gold glow at top */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)/0.06),transparent_50%)]" />

      <div className="container relative py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand column */}
          <div>
            <Link to={buildLocalizedPath.home()} className="mb-6 inline-block" aria-label="نُزُل — الرئيسية">
              <ShimaLogo surface="dark" size="lg" framed />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/55">
              {siteConfig.brand.taglineAr}
            </p>
            <p className="mt-4 text-xs tracking-[0.2em] text-brand/70 uppercase">
              إيجار فلل فاخرة
            </p>
          </div>

          {/* Links column */}
          <div>
            <h4 className="mb-5 font-display text-lg font-medium text-white/90">روابط</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to={buildLocalizedPath.home()}
                  className="text-sm text-white/50 transition-colors duration-300 hover:text-brand"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <a
                  href="#villas"
                  className="text-sm text-white/50 transition-colors duration-300 hover:text-brand"
                >
                  الفلل للإيجار
                </a>
              </li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="mb-5 font-display text-lg font-medium text-white/90">تواصل</h4>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm text-white/55">
                <Phone className="h-4 w-4 shrink-0 text-brand" />
                <span dir="ltr">
                  {loading 
                    ? siteConfig.contact.adminWhatsAppDisplay 
                    : (ownerWhatsApp || siteConfig.contact.adminWhatsAppDisplay)}
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/55">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                حجز فلل — نُزُل
              </li>
            </ul>
          </div>
        </div>

        <div className="shima-divider my-12" />

        <p className="text-center text-sm text-white/35">{getCopyrightLine()}</p>
      </div>
    </footer>
  );
};

export default Footer;
