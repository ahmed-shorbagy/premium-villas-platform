import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isPublicVisitPath } from '@/utils/visitStats';

const DEBOUNCE_MS = 2 * 60 * 1000;
const DEBOUNCE_STORAGE_KEY = 'page_view_debounce';
const inFlight = new Set<string>();

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

const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  } catch {
    return crypto.randomUUID();
  }
};

export const ActivityTracker = () => {
  const location = useLocation();
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading || isAdmin || !isPublicVisitPath(location.pathname)) return;

    const visitorId = getVisitorId();
    const debounceKey = `${visitorId}|${location.pathname}`;
    if (inFlight.has(debounceKey)) return;

    const map = readDebounceMap();
    const now = Date.now();
    if (now - (map[debounceKey] || 0) < DEBOUNCE_MS) return;

    inFlight.add(debounceKey);
    map[debounceKey] = now;
    writeDebounceMap(map);

    const trackPageView = async () => {
      try {
        const { error } = await supabase.from('analytics').insert({
          event_type: 'page_view',
          metadata: {
            path: location.pathname,
            search: location.search,
            timestamp: new Date().toISOString(),
            visitor_id: visitorId,
          },
        });
        if (error) {
          console.error('Failed to track page view:', error);
          const latest = readDebounceMap();
          delete latest[debounceKey];
          writeDebounceMap(latest);
        }
      } catch (error) {
        console.error('Failed to track page view:', error);
      } finally {
        inFlight.delete(debounceKey);
      }
    };

    void trackPageView();
  }, [location.pathname, location.search, isAdmin, loading]);

  return null;
};
