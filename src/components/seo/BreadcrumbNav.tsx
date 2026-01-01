import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <span key={index} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />
            {isLast || !item.href ? (
              <span
                className={cn(
                  isLast ? "text-foreground font-medium" : "text-muted-foreground"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// Helper functions to generate breadcrumbs for common page types
export function generatePropertyBreadcrumbs(property: {
  title: string;
  location_area?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Properties", href: "/buy" }];
  
  if (property.location_area) {
    items.push({
      label: property.location_area,
      href: `/buy?area=${encodeURIComponent(property.location_area)}`,
    });
  }
  
  items.push({ label: property.title });
  
  return items;
}

export function generateArticleBreadcrumbs(article: {
  title: string;
  category?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "News", href: "/news" }];
  
  if (article.category) {
    items.push({
      label: article.category,
      href: `/news?category=${encodeURIComponent(article.category)}`,
    });
  }
  
  items.push({ label: article.title });
  
  return items;
}

export function generateDeveloperBreadcrumbs(developer: {
  name: string;
}): BreadcrumbItem[] {
  return [
    { label: "Developers", href: "/developers" },
    { label: developer.name },
  ];
}

export function generateAreaBreadcrumbs(area: {
  name: string;
  parent?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Areas", href: "/areas" }];
  
  if (area.parent) {
    items.push({
      label: area.parent,
      href: `/area/${area.parent.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }
  
  items.push({ label: area.name });
  
  return items;
}
