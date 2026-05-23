import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Banknote, BedDouble, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildLocalizedPath } from '@/routes';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import heroImage from '@/assets/hero-cairo.jpg';
import { useBanners } from '@/hooks/useBanners';
import BannerCarousel from '@/components/BannerCarousel';

interface HeroProps {
  onSearch: (filters: { location: string; maxPrice: string; bedrooms: string; listingType: string }) => void;
  initialValues?: { location: string; maxPrice: string; bedrooms: string; listingType: string };
}

const Hero = ({ onSearch, initialValues }: HeroProps) => {
  const [listingType, setListingType] = useState(initialValues?.listingType || 'all');
  const { banners } = useBanners();
  const activeBanners = banners.filter(b => b.is_active);

  useEffect(() => {
    if (initialValues?.listingType) {
      setListingType(initialValues.listingType);
    }
  }, [initialValues?.listingType]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const location = formData.get('location') as string || '';
    const maxPrice = formData.get('maxPrice') as string || '';
    const bedrooms = formData.get('bedrooms') as string || '';
    onSearch({ location, maxPrice, bedrooms, listingType });
  };

  return (
    <section className="flex flex-col w-full">
      {/* Top Banner Section */}
      <div className="relative w-[calc(100%-2rem)] max-w-7xl mx-auto h-[140px] md:h-[280px] lg:h-[350px] overflow-hidden shrink-0 rounded-2xl mt-4">
        {activeBanners.length > 0 ? (
          <BannerCarousel banners={activeBanners} />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="container flex flex-col items-center justify-center px-4 py-12 text-center bg-background">
        <span className="mb-4 inline-block animate-fade-in rounded-full bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
          منصة العقارات الأولى في الوطن العربي
        </span>
        <h1 className="mb-4 max-w-4xl animate-fade-in font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl" style={{ animationDelay: '0.1s' }}>
          اعثر على منزل أحلامك في{' '}
          <span className="text-gradient-gold">الوطن العربي</span>
        </h1>
        <p className="mb-10 max-w-2xl animate-fade-in text-lg text-muted-foreground" style={{ animationDelay: '0.2s' }}>
          اكتشف الشقق الفاخرة والفلل الأنيقة والمساحات التجارية المتميزة في أرقى مناطق الوطن العربي.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-4xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {/* Listing Type Tabs */}
          <div className="mb-4 flex gap-2 justify-center">
            <button
              onClick={() => setListingType('all')}
              className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${listingType === 'all' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setListingType('sale')}
              className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${listingType === 'sale' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              تمليك
            </button>
            <button
              onClick={() => setListingType('rent')}
              className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${listingType === 'rent' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              إيجار
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="w-full rounded-2xl bg-card p-4 shadow-lg border border-border sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <MapPin className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="location"
                  placeholder="الموقع"
                  className="ps-10 bg-secondary border-0"
                  defaultValue={initialValues?.location}
                />
              </div>

              <div className="relative">
                <Banknote className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Select name="maxPrice" defaultValue={initialValues?.maxPrice}>
                  <SelectTrigger className="ps-10 bg-secondary border-0">
                    <SelectValue placeholder="أقصى سعر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000000">حتى 5 مليون</SelectItem>
                    <SelectItem value="10000000">حتى 10 مليون</SelectItem>
                    <SelectItem value="20000000">حتى 20 مليون</SelectItem>
                    <SelectItem value="50000000">حتى 50 مليون</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <BedDouble className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Select name="bedrooms" defaultValue={initialValues?.bedrooms}>
                  <SelectTrigger className="ps-10 bg-secondary border-0">
                    <SelectValue placeholder="غرف النوم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">غرفة نوم+</SelectItem>
                    <SelectItem value="2">غرفتين نوم+</SelectItem>
                    <SelectItem value="3">3 غرف نوم+</SelectItem>
                    <SelectItem value="4">4 غرف نوم+</SelectItem>
                    <SelectItem value="5">5 غرف نوم+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" variant="gold" size="lg" className="gap-2 w-full">
                <Search className="h-4 w-4" />
                بحث
              </Button>
            </div>
          </form>
        </div>

        {/* Add Property CTA */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-muted-foreground mb-4">هل لديك عقار تريد بيعه أو تأجيره؟</p>
          <Link to={buildLocalizedPath.submitListing()}>
            <Button variant="outline" size="lg" className="gap-2 border-gold text-gold hover:bg-gold hover:text-white transition-colors">
              <PlusCircle className="h-5 w-5" />
              اضف عقارك معنا
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
