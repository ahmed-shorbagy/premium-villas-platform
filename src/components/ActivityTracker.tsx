import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DEBOUNCE_MS = 30 * 60 * 1000; // 30 minutes
const DEBOUNCE_STORAGE_KEY = 'page_view_debounce';

type DebounceMap = Record<string, number>;

const readDebounceMap = (): DebounceMap => {
  try {
    const raw = sessionStorage.getItem(DEBOUNCE_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DebounceMap;
  } catch {
    return {};
  }
};

const writeDebounceMap = (map: DebounceMap) => {
  try {
    sessionStorage.setItem(DEBOUNCE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
};

export const ActivityTracker = () => {
  const location = useLocation();
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const trackPageView = async () => {
      try {
        const path = location.pathname;

        // Skip admin routes and staff browsing public pages
        if (path.startsWith('/admin') || isAdmin) return;

        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem('visitor_id', visitorId);
        }

        const debounceKey = `${visitorId}|${path}`;
        const map = readDebounceMap();
        const last = map[debounceKey] || 0;
        const now = Date.now();
        if (now - last < DEBOUNCE_MS) return;

        map[debounceKey] = now;
        writeDebounceMap(map);

        await supabase.from('analytics').insert({
          event_type: 'page_view',
          metadata: {
            path,
            search: location.search,
            timestamp: new Date().toISOString(),
            visitor_id: visitorId,
          },
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname, location.search, isAdmin, loading]);

  return null;
};
