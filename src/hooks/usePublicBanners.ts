import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Banner } from '@/types/banners';

async function fetchActiveBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('id, title, description, image_url, link, is_active, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return (data as Banner[]) || [];
}

export const usePublicBanners = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['banners', 'public'],
    queryFn: fetchActiveBanners,
    staleTime: 5 * 60_000,
  });

  return {
    banners: data ?? [],
    loading: isLoading,
    error: (error as Error) || null,
  };
};
