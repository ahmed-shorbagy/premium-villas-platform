import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Star, ArrowUpLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import { Property, formatPrice, propertyTypeLabels } from "@/data/properties";
import { groupTypeLabels } from "@/config";
import { buildLocalizedPath } from "@/routes";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

function MediaRenderer({ url, alt, poster }: { url: string; alt: string; poster?: string }) {
  if (isVideo(url)) {
    return (
      <video
        src={url}
        poster={poster}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        muted
        playsInline
        autoPlay
        loop
      />
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
  );
}

const PropertyCard = ({ property, className }: PropertyCardProps) => {
  const mediaList = property.images && property.images.length > 0 ? property.images : [property.image];

  return (
    <Link
      to={buildLocalizedPath.propertyDetails(property.id)}
      className={cn("group shima-card block", className)}
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        {mediaList.length > 1 ? (
          <Carousel className="h-full w-full" opts={{ loop: true, direction: "ltr" }} dir="ltr">
            <CarouselContent className="-ml-0 h-full">
              {mediaList.map((url, i) => (
                <CarouselItem key={i} className="relative h-full w-full pl-0">
                  <MediaRenderer 
                    url={url} 
                    alt={`${property.title} - ${i + 1}`} 
                    poster={property.images?.find(img => !isVideo(img)) || property.image} 
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CarouselPrevious className="pointer-events-auto left-3 border-white/20 bg-black/20 text-white hover:bg-black/40" />
              <CarouselNext className="pointer-events-auto right-3 border-white/20 bg-black/20 text-white hover:bg-black/40" />
            </div>
            <div className="absolute bottom-3 left-0 right-0 z-20 pointer-events-auto">
              <CarouselDots />
            </div>
          </Carousel>
        ) : (
          <MediaRenderer 
            url={mediaList[0]} 
            alt={property.title} 
            poster={property.images?.find(img => !isVideo(img)) || property.image} 
          />
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-navy/80 via-navy/10 to-transparent opacity-90" />

        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
          <Badge variant="property">{propertyTypeLabels[property.type] || property.type}</Badge>
          {property.groupType && (
            <Badge variant="secondary" className="normal-case">
              {groupTypeLabels[property.groupType]}
            </Badge>
          )}
          {property.featured && (
            <Badge variant="featured" className="gap-1 normal-case">
              <Star className="h-3 w-3 fill-current" />
              مميز
            </Badge>
          )}
        </div>

        <div className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
          <ArrowUpLeft className="h-4 w-4" />
        </div>

        <div className="absolute bottom-3 start-3 end-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-2xl font-semibold text-white">{formatPrice(property.price)}</p>
            <p className="text-xs text-white/70">/ ليلة</p>
          </div>
          <Badge variant="rent" className="normal-case">
            إيجار
          </Badge>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-brand">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="shima-divider" />

        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4 text-brand/70" />
              {property.bedrooms}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-brand/70" />
            {property.bathrooms}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
