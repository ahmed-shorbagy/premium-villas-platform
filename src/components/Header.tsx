import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildLocalizedPath } from '@/routes';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to={buildLocalizedPath.home()} className="flex items-center gap-2 group">
          <img
            src="/logo.jpg"
            alt="Fredian"
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="font-display text-xl font-semibold text-foreground">Fredian</span>
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

        <Link to={buildLocalizedPath.submitListing()}>
          <Button variant="gold" size="default" className="gap-2">
            <Phone className="h-4 w-4" />
            <span className="inline">أضف عقارك</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
