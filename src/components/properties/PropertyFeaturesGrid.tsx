import { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Feature {
  id: string;
  feature_definitions: {
    name: string;
    slug: string;
    category: string;
    icon: string | null;
  };
}

interface PropertyFeaturesGridProps {
  features: Feature[];
}

const categoryLabels: Record<string, string> = {
  amenity: 'Building Amenities',
  facility: 'Unit Features',
  nearby: 'Nearby',
  safety: 'Safety & Security',
};

const categoryOrder = ['facility', 'amenity', 'safety', 'nearby'];

export function PropertyFeaturesGrid({ features }: PropertyFeaturesGridProps) {
  const groupedFeatures = useMemo(() => {
    const groups: Record<string, Feature[]> = {};
    
    features.forEach((feature) => {
      const category = feature.feature_definitions.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(feature);
    });

    // Sort by category order
    return categoryOrder
      .filter((cat) => groups[cat]?.length > 0)
      .map((cat) => ({
        category: cat,
        label: categoryLabels[cat] || cat,
        items: groups[cat],
      }));
  }, [features]);

  if (features.length === 0) return null;

  const getIcon = (iconName: string | null): LucideIcon => {
    if (!iconName) return Icons.CheckCircle2;
    
    // Convert kebab-case to PascalCase
    const pascalCase = iconName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    const IconsRecord = Icons as unknown as Record<string, LucideIcon>;
    return IconsRecord[pascalCase] || Icons.CheckCircle2;
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h2 className="font-heading text-xl text-foreground mb-6">Features & Amenities</h2>
      
      <div className="space-y-6">
        {groupedFeatures.map(({ category, label, items }) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {label}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((feature) => {
                const IconComponent = getIcon(feature.feature_definitions.icon);
                return (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <IconComponent className="h-4 w-4 text-gold flex-shrink-0" />
                    <span className="text-sm">{feature.feature_definitions.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
