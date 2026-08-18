import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Star, ArrowUpLeft, Eye, Users, MessageSquareMore } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Property, formatPrice } from "@/data/properties";
import { groupTypeLabels } from "@/config";
import { buildLocalizedPath } from "@/routes";
import { cn } from "@/lib/utils";
import OptimizedImage from "@/components/OptimizedImage";
import { firstImageUrl, isVideoUrl } from "@/utils/media";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

function cardCover(property: Property): { src?: string; extra: number } {
  const media =
    property.card_images?.length
      ? property.card_images
      : property.images?.length
        ? property.images
        : [property.image, property.demoVideo].filter(Boolean) as string[];
  const src = firstImageUrl(media.filter((url) => !isVideoUrl(url))) || firstImageUrl(media);
  return { src, extra: Math.max(0, media.length - 1) };
}

const PropertyCard = ({ property, className }: PropertyCardProps) => {
  const { src, extra } = cardCover(property);

  return (
    <Link
      to={buildLocalizedPath.propertyDetails(property.slug || property.id)}
      className={cn("group shima-card flex flex-col h-full", className)}
    >
      <div className="relative overflow-hidden w-full aspect-[4/3] bg-muted">
        {src ? (
          <OptimizedImage
            src={src}
            alt={property.title}
            size="sm"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            لا توجد صورة
          </div>
        )}
        {extra > 0 && (
          <div className="absolute bottom-16 end-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
            +{extra}
          </div>
        )}

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
            <div className="space-y-0.5">
              <div className="flex items-end gap-1.5">
                <span className="font-display text-xl font-semibold text-white">
                  {formatPrice(property.price)}
                </span>
                <span className="text-[11px] text-white/80 pb-0.5">/ وسط الأسبوع</span>
              </div>
              {property.price_weekend && (
                <div className="flex items-end gap-1.5">
                  <span className="font-display text-xl font-semibold text-white">
                    {formatPrice(property.price_weekend)}
                  </span>
                  <span className="text-[11px] text-white/80 pb-0.5">/ نهاية الأسبوع</span>
                </div>
              )}
            </div>
            {property.is_negotiable && (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#fdf3d1] px-2 py-0.5 text-[11px] font-medium text-[#7a5c18]">
                السعر قابل للتفاوض
                <MessageSquareMore className="h-3 w-3" />
              </div>
            )}
          </div>
          <Badge variant="rent" className="normal-case">
            إيجار
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg font-semibold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-brand mb-3">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="mt-auto">
          <div className="shima-divider mb-3" />

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
            {property.max_guests ? (
              <span className="flex items-center gap-1.5" title="الحد الأقصى للأفراد">
                <Users className="h-4 w-4 text-brand/70" />
                {property.max_guests}
              </span>
            ) : null}
          </div>
          {property.rent_count && property.rent_count > 0 ? (
            <span className="flex items-center gap-1.5 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-100 text-cyan-600 text-xs font-medium">
              <Eye className="h-3.5 w-3.5" />
              {property.rent_count} حجز سابق
            </span>
          ) : null}
        </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
