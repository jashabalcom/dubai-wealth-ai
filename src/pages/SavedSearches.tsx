import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Search, Trash2, Loader2, BellOff } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    area?: string;
    type?: string;
    bedrooms?: number;
    priceMin?: number;
    priceMax?: number;
    offPlanOnly?: boolean;
  };
  notify_email: boolean;
  notify_frequency: string;
  created_at: string;
}

export default function SavedSearches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: searches = [], isLoading } = useQuery({
    queryKey: ['saved-searches', user?.id],
    queryFn: async (): Promise<SavedSearch[]> => {
      if (!user?.id) return [];
      
      // Use rpc or raw query for new table not in generated types
      const { data, error } = await supabase.rpc('get_user_saved_searches' as any, {
        p_user_id: user.id
      });

      if (error) {
        // Fallback to direct query with type assertion
        const result = await supabase
          .from('saved_searches' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (result.error) {
          console.error('Error fetching saved searches:', result.error);
          return [];
        }
        return (result.data || []) as unknown as SavedSearch[];
      }

      return (data || []) as unknown as SavedSearch[];
    },
    enabled: !!user?.id,
  });

  const toggleNotification = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('saved_searches' as any)
        .update({ notify_email: enabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({
        title: 'Notifications updated',
        description: 'Your notification preferences have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings.',
        variant: 'destructive',
      });
    },
  });

  const deleteSearch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_searches' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({
        title: 'Search deleted',
        description: 'Your saved search has been removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete saved search.',
        variant: 'destructive',
      });
    },
  });

  const runSearch = (filters: SavedSearch['filters']) => {
    const params = new URLSearchParams();
    if (filters.area) params.set('area', filters.area);
    if (filters.type) params.set('type', filters.type);
    if (filters.bedrooms !== undefined) params.set('beds', String(filters.bedrooms));
    if (filters.priceMin || filters.priceMax) {
      if (filters.priceMax && filters.priceMax <= 1000000) params.set('price', '1m');
      else if (filters.priceMax && filters.priceMax <= 2000000) params.set('price', '2m');
      else if (filters.priceMax && filters.priceMax <= 5000000) params.set('price', '5m');
      else if (filters.priceMin && filters.priceMin >= 5000000) params.set('price', '5m+');
    }
    if (filters.offPlanOnly) params.set('offplan', 'true');
    
    navigate(`/properties?${params.toString()}`);
  };

  const formatFilters = (filters: SavedSearch['filters']) => {
    const parts: string[] = [];
    if (filters.area) parts.push(filters.area);
    if (filters.type) parts.push(filters.type);
    if (filters.bedrooms !== undefined) parts.push(`${filters.bedrooms} bed${filters.bedrooms !== 1 ? 's' : ''}`);
    if (filters.offPlanOnly) parts.push('Off-plan');
    return parts.length > 0 ? parts : ['All properties'];
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Saved Searches</h1>
              <p className="text-muted-foreground">Get notified when new properties match your criteria</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searches.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No saved searches yet"
              description="Save your search filters on the properties page to get notified when new matching properties are listed."
              action={{
                label: 'Browse Properties',
                href: '/properties',
              }}
            />
          ) : (
            <div className="space-y-4">
              {searches.map((search, index) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{search.name}</h3>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formatFilters(search.filters).map((filter, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {filter}
                              </Badge>
                            ))}
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            Created {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {search.notify_email ? (
                              <Bell className="h-4 w-4 text-primary" />
                            ) : (
                              <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Switch
                              checked={search.notify_email}
                              onCheckedChange={(checked) => 
                                toggleNotification.mutate({ id: search.id, enabled: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => runSearch(search.filters)}
                        >
                          <Search className="h-3 w-3 mr-1" />
                          Run Search
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSearch.mutate(search.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
