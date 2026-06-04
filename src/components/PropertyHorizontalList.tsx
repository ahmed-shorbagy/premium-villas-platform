import { Property } from "@/data/properties";
import PropertyCard from "./PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface PropertyHorizontalListProps {
  title: string;
  properties: Property[];
  loading?: boolean;
}

const PropertyCardSkeleton = () => (
  <div className="min-w-[300px] w-[300px] sm:min-w-[340px] sm:w-[340px]">
    <div className="shima-card h-[420px] overflow-hidden">
      <Skeleton className="aspect-[5/4] w-full" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  </div>
);

const PropertyHorizontalList = ({ title, properties, loading }: PropertyHorizontalListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "forward" | "backward") => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const scrollTo = direction === "forward" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
    scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="mb-14">
        <Skeleton className="mb-6 h-8 w-40" />
        <div className="flex gap-5 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-[0.2em] text-brand uppercase">Shima AK</p>
          <h3 className="font-display text-2xl font-semibold text-foreground md:text-3xl">{title}</h3>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll("backward")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-card/60 backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-card"
            aria-label="السابق"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("forward")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-card/60 backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-card"
            aria-label="التالي"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
      >
        {properties.map((property) => (
          <div key={property.id} className="min-w-[300px] w-[300px] shrink-0 snap-start sm:min-w-[340px] sm:w-[340px]">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyHorizontalList;
