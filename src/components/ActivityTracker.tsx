
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const ActivityTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackPageView = async () => {
            try {
                // Get or create visitor ID
                let visitorId = localStorage.getItem('visitor_id');
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem('visitor_id', visitorId);
                }

                await supabase.from('analytics').insert({
                    event_type: 'page_view',
                    metadata: {
                        path: location.pathname,
                        search: location.search,
                        timestamp: new Date().toISOString(),
                        visitor_id: visitorId
                    }
                });
            } catch (error) {
                console.error('Failed to track page view:', error);
            }
        };

        trackPageView();
    }, [location.pathname, location.search]);

    return null;
};
