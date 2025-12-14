import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeveloperCard } from '@/components/developers/DeveloperCard';
import { useDevelopers } from '@/hooks/useDevelopers';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/SEOHead';

const tierFilters = [
  { value: 'all', label: 'All Developers' },
  { value: 'government', label: 'Government-Linked' },
  { value: 'premium', label: 'Premium' },
  { value: 'boutique', label: 'Boutique' },
  { value: 'emerging', label: 'Emerging' },
];

export default function Developers() {
  const [tierFilter, setTierFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: developers, isLoading } = useDevelopers(tierFilter);

  const filteredDevelopers = developers?.filter((dev) =>
    dev.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead
        title="Dubai Developer Directory | Dubai Wealth Hub"
        description="Explore top Dubai real estate developers - Emaar, Nakheel, DAMAC, Sobha, and more. View project portfolios, track records, and find your ideal investment partner."
        keywords={['dubai developers', 'emaar properties', 'nakheel', 'damac', 'dubai real estate developers']}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm mb-6">
                <Building2 className="h-4 w-4" />
                Developer Directory
              </div>
              
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Dubai's Premier{' '}
                <span className="text-gold">Developers</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Research the track record, portfolio, and reputation of Dubai's leading 
                real estate developers before making your investment decision.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search developers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card/50 border-border focus:border-gold"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filter & Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Tier Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-8"
            >
              <Tabs value={tierFilter} onValueChange={setTierFilter}>
                <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start">
                  {tierFilters.map((filter) => (
                    <TabsTrigger
                      key={filter.value}
                      value={filter.value}
                      className="data-[state=active]:bg-gold data-[state=active]:text-primary-foreground px-4 py-2"
                    >
                      {filter.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </motion.div>

            {/* Developers Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : filteredDevelopers && filteredDevelopers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDevelopers.map((developer, index) => (
                  <DeveloperCard
                    key={developer.id}
                    developer={developer}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Developers Found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
