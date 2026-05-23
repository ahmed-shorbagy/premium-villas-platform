import { supabase } from "@/integrations/supabase/client";

const SITE_URL = window.location.origin;

export const generateSitemap = async () => {
  try {
    const { data: properties } = await supabase
      .from("properties")
      .select("id, updated_at");

    if (!properties) return null;

    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/properties</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    properties.forEach((property) => {
      // Assuming buildLocalizedPath.property(id) returns a relative path like /property/:id
      // We need to construct the full URL manually or ensure buildLocalizedPath returns what we need.
      // Based on usual patterns:
      const propertyPath = `/property/${property.id}`;

      xml += `
  <url>
    <loc>${SITE_URL}${propertyPath}</loc>
    <lastmod>${new Date(property.updated_at || currentDate).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    return xml;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return null;
  }
};

export const downloadSitemap = async () => {
  const sitemap = await generateSitemap();
  if (!sitemap) {
    alert("Failed to generate sitemap");
    return;
  }

  const blob = new Blob([sitemap], { type: "text/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sitemap.xml";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
