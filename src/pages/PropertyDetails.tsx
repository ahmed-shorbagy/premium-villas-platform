import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Calendar,
  Phone,
  Share2,
  Heart,
  Check,
  FileQuestion,
  Loader2,
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
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import SEO from '@/components/SEO';

import { formatPrice, propertyTypeLabels, featureLabels } from '@/data/properties';
import { supabase } from '@/integrations/supabase/client';
import { buildLocalizedPath } from '@/routes';
import PreviewRequestDialog from '@/components/PreviewRequestDialog';

interface PropertyDetailsType {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  areaSize: number;
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
}

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
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
          location: data.location,
          area: data.area,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          areaSize: data.area_size,
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
        });
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
        location={`${property.location}, ${property.area}`}
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
                  <div className="mt-4 flex flex-col gap-2">
                    <span className="font-display text-3xl font-bold text-gold">
                      {formatPrice(property.price)}
                    </span>
                    <p className="text-sm text-muted-foreground">السعر لليلة الواحدة</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mb-8 grid grid-cols-3 gap-4 rounded-xl bg-secondary p-4 sm:grid-cols-4">
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
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Maximize className="h-6 w-6 text-gold" />
                    <span className="text-sm font-medium text-foreground">{property.areaSize} م²</span>
                    <span className="text-xs text-muted-foreground">المساحة</span>
                  </div>
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
                        هذا {propertyTypeLabels[property.type] || property.type} الرائع يقع في منطقة {property.area} المرموقة.
                        يتميز {property.bedrooms > 0 ? `بـ ${property.bedrooms} غرف نوم فسيحة، ` : ''}
                        {property.bathrooms} حمامات عصرية، ومساحة معيشة سخية تبلغ {property.areaSize} متر مربع.
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
              <div className="hidden lg:block">
                <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                    مهتم بهذه الفيلا؟
                  </h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    تواصل معنا لحجز الفيلا أو للحصول على مزيد من التفاصيل.
                  </p>

                  <PreviewRequestDialog
                    propertyId={property.id}
                    propertyTitle={property.title}
                    propertyPrice={formatPrice(property.price)}

                    propertyLocation={property.location}
                    whatsappNumber={property.contact_phone ? `2${property.contact_phone.replace(/^0+/, '')}` : undefined}
                  >
                    <Button variant="gold" size="lg" className="w-full gap-2 mb-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      ترتيب معاينة عبر واتساب
                    </Button>
                  </PreviewRequestDialog>

                  <div className="flex gap-2">
                    <a href={`tel:${property.contact_phone || '01211847800'}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Phone className="h-4 w-4" />
                        اتصال
                      </Button>
                    </a>
                    {/* <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Heart className="h-4 w-4" />
                    حفظ
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Share2 className="h-4 w-4" />
                    مشاركة
                  </Button> */}
                  </div>
                  {/* Contact Info display */}
                  {property.contact_phone && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {property.contact_name ? `المالك: ${property.contact_name}` : 'بيانات المالك'}
                      </p>
                      <p className="text-lg font-bold text-gold" dir="ltr">
                        {property.contact_phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 start-0 end-0 z-50 border-t border-border bg-card p-4 lg:hidden">
        <PreviewRequestDialog
          propertyId={property.id}
          propertyTitle={property.title}
          propertyPrice={formatPrice(property.price)}
          propertyLocation={property.location}
          whatsappNumber={property.contact_phone ? `2${property.contact_phone.replace(/^0+/, '')}` : undefined}
        >
          <Button variant="gold" size="lg" className="w-full gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            ترتيب معاينة عبر واتساب
          </Button>
        </PreviewRequestDialog>
      </div>

      <div className="pb-20 lg:pb-0">
        <Footer />
      </div>
    </div >
  );
};

export default PropertyDetails;
