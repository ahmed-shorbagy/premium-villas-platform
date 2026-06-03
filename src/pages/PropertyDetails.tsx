import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  Calendar,
  CalendarDays,
  Phone,
  Share2,
  Heart,
  Check,
  FileQuestion,
  Loader2,
  History,
  Users,
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
}

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCheckIn, setSelectedCheckIn] = useState('');
  const [selectedCheckOut, setSelectedCheckOut] = useState('');
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (data) {
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
          images: data.images || [],
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
        });
      } else {
        setProperty(null);
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  };

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

  const features = property.features?.map(key => featureLabels[key] || key) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <SEO
        title={property.title}
        description={property.description}
        image={property.images[0]}
        price={property.price}
        location={property.location}
        type="product"
      />
      <Header />
      <main className="flex-1">
        {/* Hero Image / Carousel */}
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
                        poster={property.images.find(img => !isVideo(img))}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`${property.title} - ${index + 1}`}
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

          {/* Back Button */}
          <div className="absolute start-4 top-4 z-10">
            <Link to={buildLocalizedPath.home()}>
              <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm">
                <ArrowRight className="h-4 w-4" />
                رجوع
              </Button>
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute end-4 top-4 flex gap-2 z-10">
            <Badge variant="property">
              {propertyTypeLabels[property.type] || property.type}
            </Badge>
            <Badge className="bg-green-600 text-white">إيجار</Badge>
            {property.featured && <Badge variant="featured">مميز</Badge>}
          </div>
        </section>

        {/* Content */}
        <section className="py-8 lg:py-12">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Title & Price */}
                <div className="mb-6">
                  <h1 className="font-display text-3xl font-bold text-foreground lg:text-4xl">
                    {property.title}
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-gold" />
                    <span>{property.location}</span>
                  </div>
                  <div className="mt-4">
                    {property.pricing_type === 'per_stay' ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-display text-3xl font-bold text-gold">
                          {formatPrice(property.price)}
                        </span>
                        <p className="text-sm text-muted-foreground">السعر للإقامة الكاملة</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-x-6 gap-y-2 p-4 bg-secondary/50 rounded-xl border border-border max-w-xl">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground mb-1">وسط الأسبوع (السبت - الأربعاء)</span>
                          <span className="font-display text-2xl font-bold text-gold">
                            {formatPrice(property.price)}
                            <span className="text-xs text-muted-foreground font-normal"> / ليلة</span>
                          </span>
                        </div>
                        {property.price_weekend && (
                          <div className="flex flex-col border-r border-border pr-6">
                            <span className="text-xs text-muted-foreground mb-1">نهاية الأسبوع (الخميس - الجمعة)</span>
                            <span className="font-display text-2xl font-bold text-gold">
                              {formatPrice(property.price_weekend)}
                              <span className="text-xs text-muted-foreground font-normal"> / ليلة</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 rounded-xl bg-secondary p-4">
                  {property.bedrooms > 0 && (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <BedDouble className="h-6 w-6 text-gold" />
                      <span className="text-sm font-medium text-foreground">{property.bedrooms}</span>
                      <span className="text-xs text-muted-foreground">غرف نوم</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Bath className="h-6 w-6 text-gold" />
                    <span className="text-sm font-medium text-foreground">{property.bathrooms}</span>
                    <span className="text-xs text-muted-foreground">حمامات</span>
                  </div>
                  {property.rent_count && property.rent_count > 0 ? (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <History className="h-6 w-6 text-gold" />
                      <span className="text-sm font-medium text-foreground">{property.rent_count} {property.rent_count === 1 ? 'مرة' : 'مرات'}</span>
                      <span className="text-xs text-muted-foreground">تم تأجيرها سابقاً</span>
                    </div>
                  ) : null}
                  {property.max_guests ? (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <Users className="h-6 w-6 text-gold" />
                      <span className="text-sm font-medium text-foreground">لغاية {property.max_guests} شخص</span>
                      <span className="text-xs text-muted-foreground">الحد الأقصى</span>
                    </div>
                  ) : null}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Calendar className="h-6 w-6 text-gold" />
                    <span className="text-sm font-medium text-foreground">
                      {property.createdAt.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-muted-foreground">تاريخ الإضافة</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="mb-4 font-display text-xl font-semibold text-foreground">الوصف</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description || (
                      <>
                        هذا {propertyTypeLabels[property.type] || property.type} الرائع يقع في {property.location}.
                        يتميز {property.bedrooms > 0 ? `بـ ${property.bedrooms} غرف نوم فسيحة، ` : ''}
                        {property.bathrooms} حمامات عصرية.
                        تتميز الفيلا بتشطيبات عالية الجودة وتركيبات فاخرة وإطلالات خلابة على المنطقة المحيطة.
                        مثالي للعائلات أو المحترفين الباحثين عن نمط حياة فاخر في أحد أكثر الأحياء المرغوبة.
                      </>
                    )}
                  </p>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div>
                    <h2 className="mb-4 font-display text-xl font-semibold text-foreground">المميزات والمرافق</h2>
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
              </div>

              {/* Sidebar - Contact Card (Desktop) */}
              <div className="hidden lg:block space-y-6">
                {/* Availability Calendar */}
                <AvailabilityCalendar
                  propertyId={property.id}
                  onDateSelect={(ci, co) => {
                    setSelectedCheckIn(ci);
                    setSelectedCheckOut(co);
                  }}
                />

                {/* Booking Card */}
                <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                    مهتم بهذه الفيلا؟
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    احجز الآن أو تواصل معنا للحصول على مزيد من التفاصيل.
                  </p>

                  <ReservationDialog
                    propertyId={property.id}
                    propertyTitle={property.title}
                    propertyPrice={property.price}
                    propertyPriceWeekend={property.price_weekend}
                    propertyLocation={property.location}
                    pricingType={property.pricing_type || 'per_night'}
                    checkIn={selectedCheckIn}
                    checkOut={selectedCheckOut}
                  >
                    <Button variant="gold" size="lg" className="w-full gap-2 mb-3">
                      <CalendarDays className="h-5 w-5" />
                      حجز الفيلا
                    </Button>
                  </ReservationDialog>

                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 start-0 end-0 z-50 border-t border-border bg-card p-4 lg:hidden">
        <ReservationDialog
          propertyId={property.id}
          propertyTitle={property.title}
          propertyPrice={property.price}
          propertyPriceWeekend={property.price_weekend}
          propertyLocation={property.location}
          pricingType={property.pricing_type || 'per_night'}
          checkIn={selectedCheckIn}
          checkOut={selectedCheckOut}
        >
          <Button variant="gold" size="lg" className="w-full gap-2">
            <CalendarDays className="h-5 w-5" />
            حجز الفيلا
          </Button>
        </ReservationDialog>
      </div>

      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </div >
  );
};

export default PropertyDetails;
