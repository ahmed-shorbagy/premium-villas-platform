import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdBanner = () => {
  const [bannerImage, setBannerImage] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "banner")
        .maybeSingle();

      if (data?.value) {
        const banner = data.value as { image_url?: string; enabled?: boolean };
        setBannerImage(banner.image_url || "");
        setEnabled(banner.enabled ?? true);
      }
      setLoading(false);
    };
    fetchBannerSettings();
  }, []);

  if (loading || !enabled || !bannerImage) return null;

  return (
    <div className="container -mt-6 mb-2 px-4">
      <div className="overflow-hidden rounded-2xl border border-glass-border shadow-card">
        <img src={bannerImage} alt="" className="h-20 w-full object-cover md:h-28" />
      </div>
    </div>
  );
};

export default AdBanner;
