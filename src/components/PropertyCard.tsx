import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Property, formatPrice, propertyTypeLabels } from '@/data/properties';
import { buildLocalizedPath } from '@/routes';

interface PropertyCardProps {
  property: Property;
}

const isVideo = (url: string) => {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Link
      to={buildLocalizedPath.propertyDetails(property.id)}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      {/* Image/Video Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {isVideo(property.image) ? (
          <video
            src={property.image}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            muted
            playsInline
            autoPlay
            loop
          />
        ) : (
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Type Badge */}
        <Badge variant="property" className="absolute start-3 top-3">
          {propertyTypeLabels[property.type] || property.type}
        </Badge>

        {/* Featured Badge */}
        {property.featured && (
          <Badge variant="featured" className="absolute end-3 top-3 gap-1">
            <Star className="h-3 w-3" />
            مميز
          </Badge>
        )}

        {/* Listing Type Badge */}
        <div className="absolute bottom-3 start-3 flex gap-2">
          <Badge className={`${property.listingType === 'sale' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
            {property.listingType === 'sale' ? 'بيع' : 'إيجار'}
          </Badge>
          {(property as any).installments_available && (
            <Badge variant="secondary" className="bg-emerald-500/90 text-white backdrop-blur-sm border-0">
              تقسيط
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="mb-2">
          <span className="font-display text-xl font-bold text-gold">
            {formatPrice(property.price)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-gold transition-colors">
          {property.title}
        </h3>

        {/* Location */}
        <div className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-gold" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 border-t border-border pt-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BedDouble className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Maximize className="h-4 w-4" />
            <span>{property.areaSize} م²</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
