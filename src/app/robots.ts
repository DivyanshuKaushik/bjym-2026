import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/dashboard", "/dashboard/", "/api/", "/login", "/register", "/admin-login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
