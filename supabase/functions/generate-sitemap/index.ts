import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://dubai-wealth-ai.lovable.app";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const urls: SitemapUrl[] = [];

    // Static pages
    const staticPages = [
      { path: "/", changefreq: "daily" as const, priority: 1.0 },
      { path: "/properties", changefreq: "hourly" as const, priority: 0.9 },
      { path: "/neighborhoods", changefreq: "weekly" as const, priority: 0.8 },
      { path: "/developers", changefreq: "weekly" as const, priority: 0.8 },
      { path: "/news", changefreq: "hourly" as const, priority: 0.8 },
      { path: "/calculators", changefreq: "monthly" as const, priority: 0.7 },
      { path: "/calculators/mortgage", changefreq: "monthly" as const, priority: 0.7 },
      { path: "/calculators/roi", changefreq: "monthly" as const, priority: 0.7 },
      { path: "/golden-visa", changefreq: "monthly" as const, priority: 0.7 },
      { path: "/pricing", changefreq: "weekly" as const, priority: 0.6 },
      { path: "/about", changefreq: "monthly" as const, priority: 0.5 },
      { path: "/contact", changefreq: "monthly" as const, priority: 0.5 },
      { path: "/terms", changefreq: "yearly" as const, priority: 0.3 },
      { path: "/privacy", changefreq: "yearly" as const, priority: 0.3 },
    ];

    staticPages.forEach((page) => {
      urls.push({
        loc: `${SITE_URL}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
      });
    });

    // Published properties
    const { data: properties } = await supabase
      .from("properties")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(5000);

    properties?.forEach((property) => {
      urls.push({
        loc: `${SITE_URL}/properties/${property.slug}`,
        lastmod: property.updated_at?.split("T")[0],
        changefreq: "weekly",
        priority: 0.7,
      });
    });

    // Published neighborhoods
    const { data: neighborhoods } = await supabase
      .from("neighborhoods")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    neighborhoods?.forEach((neighborhood) => {
      urls.push({
        loc: `${SITE_URL}/neighborhoods/${neighborhood.slug}`,
        lastmod: neighborhood.updated_at?.split("T")[0],
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    // Developers
    const { data: developers } = await supabase
      .from("developers")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    developers?.forEach((developer) => {
      urls.push({
        loc: `${SITE_URL}/developers/${developer.slug}`,
        lastmod: developer.updated_at?.split("T")[0],
        changefreq: "weekly",
        priority: 0.7,
      });
    });

    // News articles
    const { data: articles } = await supabase
      .from("news_articles")
      .select("slug, published_at, updated_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1000);

    articles?.forEach((article) => {
      const date = article.updated_at || article.published_at;
      urls.push({
        loc: `${SITE_URL}/news/${article.slug}`,
        lastmod: date?.split("T")[0],
        changefreq: "monthly",
        priority: 0.6,
      });
    });

    // Areas (from area_benchmarks)
    const { data: areas } = await supabase
      .from("area_benchmarks")
      .select("area_name, updated_at");

    areas?.forEach((area) => {
      const slug = area.area_name.toLowerCase().replace(/\s+/g, "-");
      urls.push({
        loc: `${SITE_URL}/area/${slug}`,
        lastmod: area.updated_at?.split("T")[0],
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    // Generate XML
    const xml = generateSitemapXml(urls);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlElements = urls
    .map((url) => {
      let urlXml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;
      if (url.lastmod) {
        urlXml += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      if (url.changefreq) {
        urlXml += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      if (url.priority !== undefined) {
        urlXml += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }
      urlXml += "\n  </url>";
      return urlXml;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
