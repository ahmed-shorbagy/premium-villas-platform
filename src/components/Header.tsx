import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLocalizedPath } from "@/routes";
import { siteConfig } from "@/config";
import { getBrandName } from "@/lib/brand";
import { BrandMark } from "@/components/brand/BrandMark";
import { HypeThemeToggle } from "@/components/theme/HypeThemeToggle";

const Header = () => {
  const brandName = getBrandName();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-glass-border bg-glass/90 backdrop-blur-glass supports-[backdrop-filter]:bg-glass/80 transition-colors duration-300">
      <div className="container flex h-16 items-center justify-between">
        <Link to={buildLocalizedPath.home()} className="flex items-center gap-2.5 group">
          <BrandMark size="md" />
          <div className="flex flex-col items-start leading-tight">
            {brandName ? (
              <span className="font-display text-xl font-semibold text-foreground">{brandName}</span>
            ) : (
              <span className="font-display text-lg font-semibold text-foreground">
                {siteConfig.seo.defaultTitleAr}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">{siteConfig.brand.taglineAr}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to={buildLocalizedPath.home()}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            الرئيسية
          </Link>
          <Link
            to={`${buildLocalizedPath.home()}?type=apartment`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            شقق
          </Link>
          <Link
            to={`${buildLocalizedPath.home()}?type=villa`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            فلل
          </Link>
          <Link
            to={`${buildLocalizedPath.home()}?type=commercial`}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            تجاري
          </Link>
          <Link
            to={buildLocalizedPath.submitListing()}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            أضف إعلانك
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <HypeThemeToggle compact className="hidden sm:inline-flex" />
          <Link to={buildLocalizedPath.submitListing()}>
            <Button variant="gold" size="default" className="gap-2 premium-hover">
              <Phone className="h-4 w-4" />
              <span className="inline">أضف عقارك</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
