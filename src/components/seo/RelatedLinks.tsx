import { Link } from "react-router-dom";
import { ArrowRight, Building2, MapPin, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedLink {
  title: string;
  href: string;
  type: "area" | "developer" | "property" | "article";
  description?: string;
}

interface RelatedLinksProps {
  links: RelatedLink[];
  title?: string;
  className?: string;
  variant?: "inline" | "card" | "compact";
}

const iconMap = {
  area: MapPin,
  developer: Building2,
  property: Building2,
  article: Newspaper,
};

export function RelatedLinks({
  links,
  title = "Related",
  className,
  variant = "card",
}: RelatedLinksProps) {
  if (!links || links.length === 0) return null;

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.href}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {link.title}
            <ArrowRight className="w-3 h-3" />
          </Link>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2", className)}>
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
        <ul className="space-y-1">
          {links.slice(0, 5).map((link, index) => {
            const Icon = iconMap[link.type];
            return (
              <li key={index}>
                <Link
                  to={link.href}
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {link.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-serif font-semibold">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.slice(0, 6).map((link, index) => {
          const Icon = iconMap[link.type];
          return (
            <Link
              key={index}
              to={link.href}
              className={cn(
                "group flex items-start gap-3 p-3 rounded-lg",
                "bg-muted/50 hover:bg-muted transition-colors",
                "border border-transparent hover:border-border"
              )}
            >
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {link.title}
                </p>
                {link.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {link.description}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to generate related links for a property
export function generatePropertyRelatedLinks(property: {
  location_area: string;
  developer_name?: string | null;
}): RelatedLink[] {
  const links: RelatedLink[] = [];

  // Link to area page
  if (property.location_area) {
    const areaSlug = property.location_area.toLowerCase().replace(/\s+/g, "-");
    links.push({
      title: `Explore ${property.location_area}`,
      href: `/area/${areaSlug}`,
      type: "area",
      description: "View neighborhood guide",
    });
  }

  // Link to developer page
  if (property.developer_name) {
    const developerSlug = property.developer_name.toLowerCase().replace(/\s+/g, "-");
    links.push({
      title: `${property.developer_name} Projects`,
      href: `/developer/${developerSlug}`,
      type: "developer",
      description: "See all projects by this developer",
    });
  }

  // Link to similar properties
  if (property.location_area) {
    links.push({
      title: `More in ${property.location_area}`,
      href: `/properties?area=${encodeURIComponent(property.location_area)}`,
      type: "property",
      description: "Browse similar listings",
    });
  }

  return links;
}

// Helper function to generate related links for an article
export function generateArticleRelatedLinks(article: {
  area_references?: string[];
  developer_references?: string[];
}): RelatedLink[] {
  const links: RelatedLink[] = [];

  // Link to mentioned areas
  article.area_references?.slice(0, 3).forEach((area) => {
    const areaSlug = area.toLowerCase().replace(/\s+/g, "-");
    links.push({
      title: `${area} Guide`,
      href: `/area/${areaSlug}`,
      type: "area",
    });
  });

  // Link to mentioned developers
  article.developer_references?.slice(0, 2).forEach((developer) => {
    const developerSlug = developer.toLowerCase().replace(/\s+/g, "-");
    links.push({
      title: developer,
      href: `/developer/${developerSlug}`,
      type: "developer",
    });
  });

  return links;
}
