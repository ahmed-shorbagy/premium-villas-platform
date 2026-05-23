import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdBanner = () => {
  const [bannerImage, setBannerImage] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'banner')
        .maybeSingle();

      if (data?.value) {
        const banner = data.value as { image_url?: string; enabled?: boolean };
        setBannerImage(banner.image_url || '');
        setEnabled(banner.enabled ?? true);
      }
      setLoading(false);
    };

    fetchBannerSettings();
  }, []);

  if (loading || !enabled) return null;

  return (
    <div className="w-full bg-muted border-b border-border">
      <div className="container py-3">
        {bannerImage ? (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={bannerImage} 
              alt="Featured Advertisement" 
              className="w-full h-[80px] object-cover"
            />
          </div>
        ) : (
          <div className="flex min-h-[80px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 px-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Megaphone className="h-5 w-5" />
              <span className="text-sm font-medium">Featured Ad Space — Your Advertisement Here</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
