import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { buildLocalizedPath } from "@/routes";
import { siteConfig } from "@/config";
import { getCopyrightLine } from "@/lib/brand";
import { ShimaLogo } from "@/components/brand/ShimaLogo";

const Footer = () => {
  return (
    <footer className="shima-footer relative mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--gold)/0.08),transparent_60%)]" />
      <div className="container relative py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link to={buildLocalizedPath.home()} className="mb-5 inline-flex items-center gap-3">
              <ShimaLogo variant="icon" size="md" />
              <ShimaLogo variant="wordmark" size="md" light />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">{siteConfig.brand.taglineAr}</p>
            <p className="mt-3 text-xs tracking-widest text-brand/80 uppercase">إيجار فلل فاخرة فقط</p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-white/90">روابط</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to={buildLocalizedPath.home()} className="text-sm text-white/55 transition-colors hover:text-brand">
                  الرئيسية
                </Link>
              </li>
              <li>
                <a href="#villas" className="text-sm text-white/55 transition-colors hover:text-brand">
                  الفلل للإيجار
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-lg text-white/90">تواصل</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0 text-brand" />
                <span dir="ltr">{siteConfig.contact.adminWhatsAppDisplay}</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                حجز فلل — Shima AK
              </li>
            </ul>
          </div>
        </div>

        <div className="shima-divider my-10" />
        <p className="text-center text-sm text-white/40">{getCopyrightLine()}</p>
      </div>
    </footer>
  );
};

export default Footer;
