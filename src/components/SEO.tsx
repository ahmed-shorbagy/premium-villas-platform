import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/config/site";
import { getAbsoluteAssetUrl, getCanonicalUrl, getSiteUrl } from "@/lib/site-url";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  price?: string | number;
  currency?: string;
  location?: string;
}

const SEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  price,
  currency = "ILS",
  location,
}: SEOProps) => {
  const siteTitle = siteConfig.seo.defaultTitleAr;
  const displayLocation = location ? ` في ${location}` : "";
  const fullTitle =
    title === "الرئيسية"
      ? `${siteTitle}${displayLocation}`
      : `${title}${displayLocation} | ${siteTitle}`;

  const metaDescription = description || siteConfig.seo.defaultDescriptionAr;
  const metaImage = image
    ? image.startsWith("http")
      ? image
      : getAbsoluteAssetUrl(image)
    : getAbsoluteAssetUrl(siteConfig.assets.ogImage);
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/";
  const metaUrl = url || getCanonicalUrl(pathname);
  const canonicalUrl = url || getCanonicalUrl(pathname);

  const structuredData =
    type === "product" && price
      ? {
          "@context": "https://schema.org/",
          "@type": "Product",
          name: title,
          description: metaDescription,
          image: metaImage,
          offers: {
            "@type": "Offer",
            priceCurrency: currency,
            price,
            availability: "https://schema.org/InStock",
          },
        }
      : {
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          name: title,
          image: metaImage,
          description: metaDescription,
        };

  const siteOrigin = getSiteUrl();

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={siteConfig.seo.keywordsAr} />
      {siteOrigin ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta name="robots" content="index, follow" />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:locale" content="ar" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};

export default SEO;
