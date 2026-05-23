import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { buildLocalizedPath } from '@/routes';

// Custom TikTok icon since lucide-react doesn't have one
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Custom X icon
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to={buildLocalizedPath.home()} className="flex items-center gap-2 mb-4">
              <img
                src="/logo.jpg"
                alt="Fredian"
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="font-display text-xl font-semibold">Fredian</span>
            </Link>
            <p className="text-sm text-primary-foreground/70">
              وجهتك الأولى للعقارات الفاخرة في الوطن العربي. نحن نربطك بأفضل العقارات في أرقى المواقع.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to={buildLocalizedPath.propertyType('شقق')}
                  className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  شقق
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType('فلل')}
                  className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  فلل
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType('تجاري')}
                  className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  تجاري
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType('دوبلكس')}
                  className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  دوبلكس
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType('اراضي')}
                  className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  أراضي
                </Link>
              </li>
              <li>
                <Link
                  to={buildLocalizedPath.propertyType('مكاتب')}
                  className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  مكاتب
                </Link>
              </li>
            </ul>
          </div>

          {/* Areas */}
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

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 text-gold" />
                <span dir="ltr">+20 121 184 7800</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 text-gold" />
                <span dir="ltr">fredianegp@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                الوطن العربي
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://x.com/shrktfyrydyan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-gold transition-colors"
                aria-label="X (Twitter)"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1HjhTRY1Xu/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/fayridian?igsh=anhuYnU4cDdnM3Az"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@fredianegp?_r=1&_t=ZS-92qWNR1VXfd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-gold transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@fredian8?si=6WwUQCx5g2qr7jqV"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-gold transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-primary-foreground/40 font-medium">Developed by</span>
            <div className="flex flex-col items-center transition-transform duration-300 hover:scale-105 cursor-default group">
              <span className="text-4xl font-bold tracking-tighter leading-none text-primary-foreground">DEVO</span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary-foreground/60 font-semibold mt-1">Software Services</span>
            </div>
          </div>
          <div className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Fredian. جميع الحقوق محفوظة.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
