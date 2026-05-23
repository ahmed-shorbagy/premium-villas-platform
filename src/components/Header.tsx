import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLocalizedPath } from "@/routes";
import { siteConfig } from "@/config";
import { ShimaLogo } from "@/components/brand/ShimaLogo";
import { HypeThemeToggle } from "@/components/theme/HypeThemeToggle";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-glass-border bg-glass/85 backdrop-blur-glass supports-[backdrop-filter]:bg-glass/75 transition-colors duration-300">
      <div className="container flex h-[4.25rem] items-center justify-between">
        <Link
          to={buildLocalizedPath.home()}
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <ShimaLogo variant="icon" size="md" className="transition-transform duration-300 group-hover:scale-105" />
          <div className="hidden flex-col leading-tight sm:flex">
            <ShimaLogo variant="wordmark" size="md" />
            <span className="mt-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
              {siteConfig.brand.taglineAr}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to={buildLocalizedPath.home()}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            الرئيسية
          </Link>
          <Link
            to={buildLocalizedPath.propertyType("فلل")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            فلل
          </Link>
          <Link
            to={buildLocalizedPath.propertyType("شقق")}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            شقق
          </Link>
          <Link
            to={buildLocalizedPath.submitListing()}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            أضف إعلانك
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <HypeThemeToggle compact className="hidden sm:inline-flex" />
          <Link to={buildLocalizedPath.submitListing()}>
            <Button variant="gold" size="default" className="gap-2 premium-hover shadow-brand">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">احجز الآن</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
