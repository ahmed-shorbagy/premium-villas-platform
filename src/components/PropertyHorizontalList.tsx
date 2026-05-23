import { Property } from '@/data/properties';
import PropertyCard from './PropertyCard';
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface PropertyHorizontalListProps {
    title: string;
    properties: Property[];
    loading?: boolean;
}

const PropertyCardSkeleton = () => (
    <div className="min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] rounded-xl border border-border bg-card overflow-hidden">
        <Skeleton className="h-[200px] w-full" />
        <div className="p-4 space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
);

const PropertyHorizontalList = ({ title, properties, loading }: PropertyHorizontalListProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'forward' | 'backward') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            // In RTL, forward is negative, backward is towards 0
            const scrollTo = direction === 'forward' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="flex gap-4 overflow-hidden pb-4">
                    {[...Array(4)].map((_, i) => (
                        <PropertyCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (properties.length === 0) {
        return null;
    }

    return (
        <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold text-foreground">
                    {title}
                </h3>
                <div className="hidden gap-2 sm:flex">
                    <button
                        onClick={() => scroll('backward')}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
                        aria-label="Previous"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => scroll('forward')}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
                        aria-label="Next"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {properties.map((property) => (
                    <div key={property.id} className="min-w-[280px] w-[280px] sm:min-w-[320px] sm:w-[320px] snap-start">
                        <PropertyCard property={property} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyHorizontalList;
