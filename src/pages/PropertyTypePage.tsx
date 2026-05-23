import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyGrid from '@/components/PropertyGrid';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useProperties } from '@/hooks/useProperties';
import { propertyTypeLabels, listingTypeLabels } from '@/data/properties';
import { buildLocalizedPath } from '@/routes';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Map Arabic URL slugs to property type values
const slugToType: Record<string, string> = {
    'شقق': 'apartment',
    'فلل': 'villa',
    'مكاتب': 'office',
    'تجاري': 'commercial',
    'دوبلكس': 'duplex',
    'اراضي': 'land',
};

// SEO-friendly titles for each type (plural forms for listings)
const typeSeoTitles: Record<string, string> = {
    apartment: 'شقق للبيع والإيجار',
    villa: 'فلل فاخرة للبيع والإيجار',
    office: 'مكاتب للبيع والإيجار',
    commercial: 'عقارات تجارية للبيع والإيجار',
    duplex: 'دوبلكس للبيع والإيجار',
    land: 'أراضي للبيع',
};

// SEO descriptions for each type
const typeSeoDescriptions: Record<string, string> = {
    apartment: 'تصفح أفضل الشقق المتاحة للبيع والإيجار. شقق سكنية بأسعار مناسبة ومواقع متميزة.',
    villa: 'اكتشف فلل فاخرة للبيع والإيجار في أرقى المناطق. فلل عائلية مع حدائق ومسابح خاصة.',
    office: 'ابحث عن مكاتب للبيع والإيجار في مواقع استراتيجية. مساحات مكتبية عصرية للشركات.',
    commercial: 'عقارات تجارية ومحلات للبيع والإيجار في أماكن حيوية. فرص استثمارية مميزة.',
    duplex: 'شقق دوبلكس فاخرة للبيع والإيجار. مساحات واسعة بتصميمات عصرية.',
    land: 'أراضي للبيع في مواقع متميزة. فرص استثمارية في قطع أراضي سكنية وتجارية.',
};

const PropertyTypePage = () => {
    const { typeSlug } = useParams<{ typeSlug: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { properties, loading } = useProperties();

    const propertyType = typeSlug ? slugToType[decodeURIComponent(typeSlug)] : undefined;

    const [activeListingType, setActiveListingType] = useState(searchParams.get('listingType') || 'all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const listingType = searchParams.get('listingType');
        if (listingType) setActiveListingType(listingType);
    }, [searchParams]);

    const handleListingTypeChange = (type: string) => {
        setActiveListingType(type);
        const params = new URLSearchParams(searchParams);
        if (type === 'all') params.delete('listingType');
        else params.set('listingType', type);
        setSearchParams(params);
    };

    const filteredProperties = useMemo(() => {
        let filtered = [...properties];

        // Filter by type
        if (propertyType) {
            filtered = filtered.filter((p) => p.type === propertyType);
        }

        // Filter by listing type
        if (activeListingType !== 'all') {
            filtered = filtered.filter((p) => p.listingType === activeListingType);
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }

        return filtered;
    }, [propertyType, activeListingType, sortBy, properties]);

    // Handle invalid type slug
    if (typeSlug && !propertyType) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex flex-1 items-center justify-center p-4">
                    <div className="flex w-full max-w-md flex-col items-center text-center">
                        <h1 className="mb-2 font-display text-2xl font-bold text-foreground">
                            عذراً، نوع العقار غير موجود
                        </h1>
                        <p className="mb-8 text-muted-foreground">
                            الصفحة التي تبحث عنها غير متاحة.
                        </p>
                        <Link to={buildLocalizedPath.home()}>
                            <Button variant="gold" className="gap-2">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const seoTitle = propertyType ? typeSeoTitles[propertyType] : 'جميع العقارات';
    const seoDescription = propertyType ? typeSeoDescriptions[propertyType] : undefined;
    const displayTitle = propertyType ? propertyTypeLabels[propertyType] : 'جميع العقارات';

    return (
        <div className="flex min-h-screen flex-col">
            <SEO
                title={seoTitle}
                description={seoDescription}
            />
            <Header />

            <main className="flex-1">
                <section className="py-12 lg:py-16">
                    <div className="container">
                        <div className="mb-8 text-center">
                            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                                {seoTitle}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {seoDescription}
                            </p>
                        </div>

                        <div className="mb-8">
                            <PropertyFilters
                                activeType={propertyType || 'all'}
                                activeListingType={activeListingType}
                                sortBy={sortBy}
                                onTypeChange={() => { }} // Type is fixed on this page
                                onListingTypeChange={handleListingTypeChange}
                                onSortChange={setSortBy}
                                hideTypeFilter={true}
                            />
                        </div>

                        <PropertyGrid properties={filteredProperties} loading={loading} />

                        {!loading && filteredProperties.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    لا توجد عقارات متاحة حالياً من نوع {displayTitle}.
                                </p>
                                <Link to={buildLocalizedPath.home()} className="mt-4 inline-block">
                                    <Button variant="outline">
                                        تصفح جميع العقارات
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PropertyTypePage;
