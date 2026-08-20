import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  Calendar,
  CalendarDays,
  Check,
  FileQuestion,
  Loader2,
  History,
  Users,
  MessageSquareMore,
  Clock,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import SEO from '@/components/SEO';

import { formatPrice, propertyTypeLabels, featureLabels } from '@/data/properties';
import { supabase } from '@/integrations/supabase/client';
import { buildLocalizedPath } from '@/routes';
import ReservationDialog from '@/components/ReservationDialog';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import PropertyHorizontalList from '@/components/PropertyHorizontalList';
import OptimizedImage from '@/components/OptimizedImage';
import { firstImageUrl, isVideoUrl, uniqueMediaUrls } from '@/utils/media';
import { bookingPolicies } from '@/config/booking';
import { groupTypeLabels, type GroupTypeId } from '@/config/filters';
import { useSimilarAvailableVillas } from '@/hooks/useSimilarAvailableVillas';

interface PropertyDetailsType {
  id: string;
  title: string;
  type: string;
  price: number;
  price_weekend?: number | null;
  rent_count?: number | null;
  max_guests?: number | null;
  location: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  listingType: 'sale' | 'rent';
  featured: boolean;
  createdAt: Date;
  description?: string;
  features: string[] | null;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_location?: string;
  installments_available?: boolean;
  installment_period?: string;
  installment_value?: number;
  pricing_type?: 'per_night' | 'per_stay';
  is_negotiable?: boolean;
  groupType?: GroupTypeId | null;
}

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCheckIn, setSelectedCheckIn] = useState('');
  const [selectedCheckOut, setSelectedCheckOut] = useState('');
  const [unavailableDate, setUnavailableDate] = useState<string | null>(null);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const similarGroupType: GroupTypeId | null =
    property?.groupType || null;

  const { properties: similarVillas, loading: similarLoading } =
    useSimilarAvailableVillas({
      propertyId: property?.id || '',
      groupType: similarGroupType,
      requestedDate: unavailableDate,
      currentPrice: property?.price || 0,
      enabled: !!unavailableDate && !!property,
    });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id
        );
      const columns =
        'id, slug, title, type, price, price_weekend, rent_count, max_guests, location, bedrooms, bathrooms, images, card_images, gallery_images, listing_type, featured, created_at, description, features, contact_name, contact_phone, contact_email, contact_location, installments_available, installment_period, installment_value, pricing_type, is_negotiable, group_type';
      let { data } = await supabase
        .from('properties')
        .select(columns)
        .eq(isUUID ? 'id' : 'slug', id)
        .maybeSingle();

      if (!data && !isUUID && id && id.includes('-')) {
        const parts = id.split('-');
        const possibleShortId = parts[parts.length - 1];
        if (possibleShortId) {
          const fallbackRes = await supabase
            .from('properties')
            .select(columns)
            .eq('slug', possibleShortId)
            .maybeSingle();
          if (fallbackRes.data) {
            data = fallbackRes.data;
          }
        }
      }

      if (data) {
        const cleanPath = buildLocalizedPath.propertyDetails(data.slug || data.id);
        const currentPath = window.location.pathname;
        if (decodeURIComponent(currentPath) !== decodeURIComponent(cleanPath)) {
          window.history.replaceState(null, '', cleanPath);
        }
        setProperty({
          id: data.id,
          title: data.title,
          type: data.type,
          price: data.price,
          price_weekend: data.price_weekend ?? null,
          rent_count: data.rent_count ?? null,
          max_guests: data.max_guests ?? null,
          location: data.location,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          images: uniqueMediaUrls(
            (data as any).card_images,
            (data as any).gallery_images,
            data.images
          ),
          listingType: (data as any).listing_type as 'sale' | 'rent',
          featured: data.featured,
          createdAt: new Date(data.created_at),
          description: data.description || undefined,
          features: data.features,
          contact_name: (data as any).contact_name,
          contact_phone: (data as any).contact_phone,
          contact_email: (data as any).contact_email,
          contact_location: (data as any).contact_location,
          installments_available: (data as any).installments_available,
          installment_period: (data as any).installment_period,
          installment_value: (data as any).installment_value,
          pricing_type: (data as any).pricing_type || 'per_night',
          is_negotiable: (data as any).is_negotiable || false,
          groupType: ((data as any).group_type as GroupTypeId) || null,
        });
        setUnavailableDate(null);
        setSelectedCheckIn('');
        setSelectedCheckOut('');
      } else {
        setProperty(null);
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  const isVideo = isVideoUrl;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">جاري تحميل بيانات الفيلا...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <div className="flex w-full max-w-md flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-muted p-6">
              <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground">
              عذراً، الفيلا غير موجودة
            </h1>
            <p className="mb-8 text-muted-foreground">
              ربما تم حذف الفيلا أو أن الرابط غير صحيح.
            </p>
            <div className="flex w-full gap-3 sm:w-auto">
              <Link to={buildLocalizedPath.home()} className="w-full sm:w-auto">
                <Button variant="gold" className="w-full gap-2">
                  <ArrowRight className="h-4 w-4" />
                  العودة للقائمة
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const features = property.features?.map((key) => featureLabels[key] || key) || [];
  const checkInOutNote = `الاستلام ${bookingPolicies.checkIn.displayAr} يوم الدخول — المغادرة ${bookingPolicies.checkOut.displayAr} يوم الخروج`;

  const priceBlock = (
    <div className="mt-4">
      <p className="text-sm font-semibold text-foreground mb-2">السعر</p>
      {property.pricing_type === 'per_stay' ? (
        <div className="rounded-xl border-2 border-gold/40 bg-gold/5 p-5 max-w-xl">
          <span className="font-display text-4xl font-bold text-gold">
            {formatPrice(property.price)}
          </span>
          <p className="text-sm text-muted-foreground mt-1">/ إقامة</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-8 gap-y-3 p-5 bg-gold/5 rounded-xl border-2 border-gold/40 max-w-xl">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground mb-1">
              وسط الأسبوع (السبت - الأربعاء)
            </span>
            <span className="font-display text-3xl font-bold text-gold">
              {formatPrice(property.price)}
              <span className="text-sm text-muted-foreground font-normal"> / ليلة</span>
            </span>
          </div>
          {property.price_weekend ? (
            <div className="flex flex-col border-r border-gold/20 pr-6">
              <span className="text-xs font-medium text-muted-foreground mb-1">
                نهاية الأسبوع (الخميس - الجمعة)
              </span>
              <span className="font-display text-3xl font-bold text-gold">
                {formatPrice(property.price_weekend)}
                <span className="text-sm text-muted-foreground font-normal"> / ليلة</span>
              </span>
            </div>
          ) : null}
        </div>
      )}
      {property.is_negotiable && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquareMore className="h-3.5 w-3.5" />
          السعر قابل للتفاوض
        </p>
      )}
    </div>
  );

  const bookingCard = (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
        مهتم بهذه الفيلا؟
      </h3>
      <div className="mb-4 rounded-lg border border-gold/30 bg-gold/5 p-3">
        <p className="text-xs text-muted-foreground mb-0.5">السعر</p>
        {property.pricing_type === 'per_stay' ? (
          <p className="font-display text-2xl font-bold text-gold">
            {formatPrice(property.price)}
            <span className="text-xs font-normal text-muted-foreground"> / إقامة</span>
          </p>
        ) : (
          <div className="space-y-1">
            <p className="font-display text-xl font-bold text-gold">
              {formatPrice(property.price)}
              <span className="text-xs font-normal text-muted-foreground">
                {' '}
                / ليلة · وسط الأسبوع
              </span>
            </p>
            {property.price_weekend ? (
              <p className="font-display text-lg font-semibold text-gold">
                {formatPrice(property.price_weekend)}
                <span className="text-xs font-normal text-muted-foreground">
                  {' '}
                  / ليلة · نهاية الأسبوع
                </span>
              </p>
            ) : null}
          </div>
        )}
      </div>
      <div className="mb-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 text-gold mt-0.5 shrink-0" />
        <span>{checkInOutNote}</span>
      </div>
      {property.groupType && (
        <p className="mb-4 text-xs text-muted-foreground">
          نوع الإيجار:{' '}
          <span className="text-foreground font-medium">
            {groupTypeLabels[property.groupType]}
          </span>
        </p>
      )}
      <ReservationDialog
        propertyId={property.id}
        propertyTitle={property.title}
        propertyPrice={property.price}
        propertyPriceWeekend={property.price_weekend}
        propertyLocation={property.location}
        pricingType={property.pricing_type || 'per_night'}
        groupType={property.groupType}
        checkIn={selectedCheckIn}
        checkOut={selectedCheckOut}
      >
        <Button variant="gold" size="lg" className="w-full gap-2">
          <CalendarDays className="h-5 w-5" />
          حجز الفيلا — {formatPrice(property.price)}
          {property.pricing_type !== 'per_stay' ? ' / ليلة' : ''}
        </Button>
      </ReservationDialog>
    </div>
  );

  const calendarBlock = (
    <AvailabilityCalendar
      propertyId={property.id}
      onDateSelect={(ci, co) => {
        setSelectedCheckIn(ci);
        setSelectedCheckOut(co);
        setUnavailableDate(null);
      }}
      onUnavailableDateSelect={(date) => {
        setUnavailableDate(date);
        setSelectedCheckIn('');
        setSelectedCheckOut('');
      }}
    />
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title={property.title}
        description={property.description}
        image={
          firstImageUrl(property.images.filter((url) => !isVideo(url))) || property.images[0]
        }
        price={property.price}
        location={property.location}
        type="product"
      />
      <Header />
      <main className="flex-1">
        <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden group">
          <Carousel
            plugins={[plugin.current]}
            className="w-full h-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              loop: true,
              direction: 'rtl',
            }}
          >
            <CarouselContent className="h-[50vh] min-h-[400px] ml-0">
              {property.images.length > 0 ? (
                property.images.map((url, index) => (
                  <CarouselItem key={index} className="relative h-full pl-0">
                    {isVideo(url) ? (
                      <video
                        src={url}
                        controls
                        playsInline
                        preload={index === 0 ? 'metadata' : 'none'}
                        poster={firstImageUrl(
                          property.images.filter((img) => !isVideo(img))
                        )}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <OptimizedImage
                        src={url}
                        alt={`${property.title} - ${index + 1}`}
                        size="full"
                        priority={index === 0}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent pointer-events-none" />
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem className="relative h-full pl-0">
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">لا توجد صور متاحة</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {property.images.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:flex left-4 text-white hover:text-white border-white/20 bg-black/20 hover:bg-black/40" />
                <CarouselNext className="hidden md:flex right-4 text-white hover:text-white border-white/20 bg-black/20 hover:bg-black/40" />
                <div className="absolute bottom-4 left-0 right-0 z-20 pointer-events-auto">
                  <CarouselDots />
                </div>
              </>
            )}
          </Carousel>

          <div className="absolute start-4 top-4 z-10">
            <Link to={buildLocalizedPath.home()}>
              <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm">
                <ArrowRight className="h-4 w-4" />
                رجوع
              </Button>
            </Link>
          </div>

          <div className="absolute end-4 top-4 flex gap-2 z-10">
            <Badge variant="property">
              {propertyTypeLabels[property.type] || property.type}
            </Badge>
            <Badge className="bg-green-600 text-white">إيجار</Badge>
            {property.featured && <Badge variant="featured">مميز</Badge>}
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
                    {property.title}
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-gold" />
                    <span>{property.location}</span>
                  </div>
                  {priceBlock}
                </div>

                <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 rounded-xl bg-secondary p-4">
                  {property.bedrooms > 0 && (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <BedDouble className="h-6 w-6 text-gold" />
                      <span className="text-sm font-medium text-foreground">
                        {property.bedrooms}
                      </span>
                      <span className="text-xs text-muted-foreground">غرف نوم</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Bath className="h-6 w-6 text-gold" />
                    <span className="text-sm font-medium text-foreground">
                      {property.bathrooms}
                    </span>
                    <span className="text-xs text-muted-foreground">حمامات</span>
                  </div>
                  {property.rent_count && property.rent_count > 0 ? (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <History className="h-6 w-6 text-gold" />
                      <span className="text-sm font-medium text-foreground">
                        {property.rent_count}{' '}
                        {property.rent_count === 1 ? 'مرة' : 'مرات'}
                      </span>
                      <span className="text-xs text-muted-foreground">تم تأجيرها سابقاً</span>
                    </div>
                  ) : null}
                  {property.max_guests ? (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Users className="h-6 w-6 text-gold" />
                      <span className="text-sm font-medium text-foreground">
                        لغاية {property.max_guests} شخص
                      </span>
                      <span className="text-xs text-muted-foreground">الحد الأقصى</span>
                    </div>
                  ) : null}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Calendar className="h-6 w-6 text-gold" />
                    <span className="text-sm font-medium text-foreground">
                      {property.createdAt.toLocaleDateString('ar-EG', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground">تاريخ الإضافة</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                    الوصف
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description || (
                      <>
                        هذا {propertyTypeLabels[property.type] || property.type} الرائع يقع في{' '}
                        {property.location}. يتميز{' '}
                        {property.bedrooms > 0
                          ? `بـ ${property.bedrooms} غرف نوم فسيحة، `
                          : ''}
                        {property.bathrooms} حمامات عصرية. تتميز الفيلا بتشطيبات عالية الجودة
                        وتركيبات فاخرة وإطلالات خلابة على المنطقة المحيطة. مثالي للعائلات أو
                        المحترفين الباحثين عن نمط حياة فاخر في أحد أكثر الأحياء المرغوبة.
                      </>
                    )}
                  </p>
                </div>

                {features.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                      المميزات والمرافق
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20">
                            <Check className="h-3.5 w-3.5 text-gold" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calendar on all breakpoints (was desktop-only before) */}
                <div className="mb-8">{calendarBlock}</div>

                {unavailableDate && (
                  <div className="mb-8">
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4">
                      <p className="text-sm font-medium text-foreground">
                        هذه الفيلا محجوزة في هذا التاريخ — خيارات مشابهة متاحة:
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        التاريخ المطلوب: {unavailableDate}
                      </p>
                    </div>
                    <PropertyHorizontalList
                      title="فلل مشابهة متاحة"
                      properties={similarVillas}
                      loading={similarLoading}
                    />
                    {!similarLoading && similarVillas.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        لا توجد فلل مشابهة متاحة في هذا التاريخ حالياً.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="hidden lg:block space-y-6">
                <div className="sticky top-24">{bookingCard}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 start-0 end-0 z-50 border-t border-border bg-card p-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground">السعر</p>
            <p className="font-display text-lg font-bold text-gold truncate">
              {formatPrice(property.price)}
              {property.pricing_type !== 'per_stay' ? (
                <span className="text-[10px] font-normal text-muted-foreground"> / ليلة</span>
              ) : null}
            </p>
          </div>
          <ReservationDialog
            propertyId={property.id}
            propertyTitle={property.title}
            propertyPrice={property.price}
            propertyPriceWeekend={property.price_weekend}
            propertyLocation={property.location}
            pricingType={property.pricing_type || 'per_night'}
            groupType={property.groupType}
            checkIn={selectedCheckIn}
            checkOut={selectedCheckOut}
          >
            <Button variant="gold" size="lg" className="gap-2 shrink-0">
              <CalendarDays className="h-5 w-5" />
              حجز الفيلا
            </Button>
          </ReservationDialog>
        </div>
      </div>

      <div className="pb-24 lg:pb-0">
        <Footer />
      </div>
    </div>
  );
};

export default PropertyDetails;
