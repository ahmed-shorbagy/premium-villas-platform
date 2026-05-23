import { useLocation } from "react-router-dom";
import { PremiumAmbientBackground } from "@/components/brand/PremiumAmbientBackground";

interface SiteShellProps {
  children: React.ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  const { pathname } = useLocation();
  const isAdmin =
    pathname.includes("/admin") || pathname.includes("لوحة-التحكم");

  return (
    <>
      <PremiumAmbientBackground intensity={isAdmin ? "low" : "full"} />
      <div className="relative z-[1] flex min-h-screen flex-col">{children}</div>
    </>
  );
}
