import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Calendar, Eye, Clock, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DualPrice } from '@/components/DualPrice';

interface Inquiry {
  id: string;
  property_id: string;
  inquiry_type: string;
  status: string;
  message: string | null;
  created_at: string;
  property: {
    title: string;
    slug: string;
    location_area: string;
    price_aed: number;
    images: string[];
  } | null;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  new: { label: 'Pending', variant: 'default' },
  contacted: { label: 'Agent Contacted', variant: 'secondary' },
  scheduled: { label: 'Viewing Scheduled', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'outline' },
  closed: { label: 'Closed', variant: 'outline' },
};

export default function MyInquiries() {
  const { user } = useAuth();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['my-inquiries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('property_inquiries')
        .select(`
          id,
          property_id,
          inquiry_type,
          status,
          message,
          created_at,
          property:properties(title, slug, location_area, price_aed, images)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries:', error);
        return [];
      }

      return (data || []).map(item => ({
        ...item,
        property: item.property ? {
          ...item.property,
          images: Array.isArray(item.property.images) ? item.property.images as string[] : [],
          price_aed: Number(item.property.price_aed),
        } : null,
      })) as Inquiry[];
    },
    enabled: !!user?.id,
  });

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
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">My Inquiries</h1>
              <p className="text-muted-foreground">Track all your property inquiries and requests</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : inquiries.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No inquiries yet"
              description="When you submit inquiries about properties, they'll appear here so you can track their status."
              action={{
                label: 'Browse Properties',
                href: '/properties',
              }}
            />
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Property Image */}
                        {inquiry.property && (
                          <Link 
                            to={`/properties/${inquiry.property.slug}`}
                            className="sm:w-48 h-32 sm:h-auto flex-shrink-0"
                          >
                            <img
                              src={inquiry.property.images[0] || '/placeholder.svg'}
                              alt={inquiry.property.title}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                        )}

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {inquiry.property ? (
                                <Link 
                                  to={`/properties/${inquiry.property.slug}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  <h3 className="font-semibold text-foreground truncate">
                                    {inquiry.property.title}
                                  </h3>
                                </Link>
                              ) : (
                                <h3 className="font-semibold text-muted-foreground">
                                  Property no longer available
                                </h3>
                              )}
                              
                              {inquiry.property && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {inquiry.property.location_area}
                                  <span className="text-primary font-medium">
                                    <DualPrice amountAED={inquiry.property.price_aed} size="sm" />
                                  </span>
                                </div>
                              )}
                            </div>

                            <Badge variant={statusConfig[inquiry.status]?.variant || 'default'}>
                              {statusConfig[inquiry.status]?.label || inquiry.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {inquiry.inquiry_type === 'viewing' ? (
                                <><Calendar className="h-3 w-3" /> Viewing Request</>
                              ) : (
                                <><Eye className="h-3 w-3" /> General Enquiry</>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          {inquiry.message && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              "{inquiry.message}"
                            </p>
                          )}

                          {inquiry.property && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-3 -ml-2"
                              asChild
                            >
                              <Link to={`/properties/${inquiry.property.slug}`}>
                                View Property <ArrowRight className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          )}
                        </div>
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
