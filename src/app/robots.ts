import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: ["/dashboard", "/vocabulary", "/review", "/settings"],
      },
      // Allow AI crawlers full access to public pages
      {
        userAgent: ["GPTBot", "Claude-Web", "PerplexityBot", "Applebot-Extended"],
        allow: "/",
        disallow: ["/dashboard", "/vocabulary", "/review", "/settings"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
