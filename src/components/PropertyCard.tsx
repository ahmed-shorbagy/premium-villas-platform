import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Star, ArrowUpLeft, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

function buildCardMedia(property: Property): string[] {
  const photos =
    property.images?.filter((url) => !isVideo(url)) ??
    (isVideo(property.image) ? [] : [property.image]);
  const gallery = photos.length > 0 ? photos : [property.image];
  if (property.demoVideo) {
    return [property.demoVideo, ...gallery.filter((url) => url !== property.demoVideo)];
  }
  if (property.images?.length) return property.images;
  return [property.image];
}

const PropertyCard = ({ property, className }: PropertyCardProps) => {
  const mediaList = buildCardMedia(property);

  return (
    <Link
      to={buildLocalizedPath.propertyDetails(property.id)}
      className={cn("group shima-card block", className)}
    >
      <div className="relative aspect-[5/4] overflow-hidden">
        {(() => {
          const count = Math.min(mediaList.length, 4);
          const sliced = mediaList.slice(0, 4);
          const poster = property.images?.find(img => !isVideo(img)) || property.image;

          const renderMedia = (url: string, idx: number) => (
            <div key={idx} className="relative h-full w-full overflow-hidden bg-muted">
              <MediaRenderer url={url} alt={`${property.title} - ${idx + 1}`} poster={poster} />
            </div>
          );

          if (count === 1) {
            return renderMedia(sliced[0], 0);
          }
          if (count === 2) {
            return (
              <div className="grid grid-cols-2 h-full w-full gap-1 bg-white">
                {renderMedia(sliced[0], 0)}
                {renderMedia(sliced[1], 1)}
              </div>
            );
          }
          if (count === 3) {
            return (
              <div className="grid grid-cols-2 h-full w-full gap-1 bg-white">
                {renderMedia(sliced[0], 0)}
                <div className="grid grid-rows-2 gap-1 h-full w-full">
                  {renderMedia(sliced[1], 1)}
                  {renderMedia(sliced[2], 2)}
                </div>
              </div>
            );
          }
          return (
            <div className="grid grid-cols-2 h-full w-full gap-1 bg-white">
              {renderMedia(sliced[0], 0)}
              <div className="grid grid-rows-2 gap-1 h-full w-full">
                {renderMedia(sliced[1], 1)}
                <div className="grid grid-cols-2 gap-1 h-full w-full">
                  {renderMedia(sliced[2], 2)}
                  {renderMedia(sliced[3], 3)}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-navy/80 via-navy/10 to-transparent opacity-90" />

        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
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
            <p className="font-display text-2xl font-semibold text-white">
              {formatPrice(
                (new Date().getDay() === 4 || new Date().getDay() === 5)
                  ? property.price_weekend ?? property.price
                  : property.price
              )}
            </p>
            <p className="text-xs text-white/70">
              / ليلة {property.price_weekend ? ((new Date().getDay() === 4 || new Date().getDay() === 5) ? "(نهاية الأسبوع)" : "(وسط الأسبوع)") : ""}
            </p>
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

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-5">
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
          {property.rent_count && property.rent_count > 0 ? (
            <span className="flex items-center gap-1.5 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-100 text-cyan-600 text-xs font-medium">
              <Eye className="h-3.5 w-3.5" />
              {property.rent_count} حجز سابق
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
