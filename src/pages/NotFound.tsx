import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { buildLocalizedPath } from "@/routes";
import { ShimaLogo } from "@/components/brand/ShimaLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted px-4">
      <ShimaLogo surface="light" presentation="tight" size="lg" />
      <div className="text-center">
        <h1 className="mb-2 font-display text-4xl font-semibold text-foreground">404</h1>
        <p className="mb-6 text-muted-foreground">الصفحة غير موجودة</p>
        <Link
          to={buildLocalizedPath.home()}
          className="text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
