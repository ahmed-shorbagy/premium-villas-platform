import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLocalizedPath } from "@/routes";
import { ShimaLogo } from "@/components/brand/ShimaLogo";
import { HypeThemeToggle } from "@/components/theme/HypeThemeToggle";

const navLinkClass =
  "relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:start-0 after:h-px after:w-0 after:bg-brand after:transition-all hover:after:w-full";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 md:px-6 md:pt-4">
      <div className="shima-float-header flex h-16 items-center justify-between px-5 md:h-[4.25rem] md:px-8">
        {/* ── Brand ── */}
        <Link
          to={buildLocalizedPath.home()}
          className="group transition-opacity hover:opacity-90"
          aria-label="Shima AK — الرئيسية"
        >
          <ShimaLogo
            surface="auto"
            size="md"
            framed
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* ── Navigation ── */}
        <nav className="hidden items-center gap-8 lg:flex">
          <Link to={buildLocalizedPath.home()} className={navLinkClass}>
            الرئيسية
          </Link>
          <a href="#villas" className={navLinkClass}>
            الفلل
          </a>
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3">
          <HypeThemeToggle compact className="inline-flex" />
          <a href="#villas">
            <Button variant="gold" size="sm" className="gap-2 shadow-brand md:size-default">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">احجز فيلا</span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
