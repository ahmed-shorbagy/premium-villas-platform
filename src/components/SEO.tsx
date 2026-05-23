import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    price?: string | number;
    currency?: string;
    location?: string;
}

const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website',
    price,
    currency = 'EGP',
    location
}: SEOProps) => {
    const siteTitle = 'العقارات في الوطن العربي';
    const displayLocation = location ? ` في ${location}` : '';
    const fullTitle = title === 'الرئيسية'
        ? `${siteTitle}${displayLocation}`
        : `${title}${displayLocation} | ${siteTitle}`;

    const metaDescription = description || 'ابحث عن عقار أحلامك في الوطن العربي باستخدام منصة العقارات في الوطن العربي.';
    const metaImage = image || '/og-image.jpg';
    const metaUrl = url || `https://fredian-eg.com${window.location.pathname}`;

    // Schema.org Structured Data
    const structuredData = type === 'product' && price ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": title,
        "description": metaDescription,
        "image": metaImage,
        "offers": {
            "@type": "Offer",
            "priceCurrency": currency,
            "price": price,
            "availability": "https://schema.org/InStock" // Assuming in stock if listed
        }
    } : {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": title,
        "image": metaImage,
        "description": metaDescription,
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={url || `https://fredian-eg.com${window.location.pathname}`} />
            <meta name="robots" content="index, follow" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={metaUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
