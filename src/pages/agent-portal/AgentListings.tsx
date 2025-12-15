import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  Clock, 
  CheckCircle2,
  Pencil,
  Trash2,
  Eye,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAgentAuth } from '@/hooks/useAgentAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formatPrice = (price: number, currency: string = 'AED') => {
  return `${currency} ${price?.toLocaleString() || 0}`;
};

interface Property {
  id: string;
  title: string;
  asking_price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  size_sqft: number;
  location_area: string;
  images: string[];
  is_published: boolean;
  created_at: string;
}

export default function AgentListings() {
  const { agent } = useAgentAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (agent) {
      fetchProperties();
    }
  }, [agent]);

  const fetchProperties = async () => {
    if (!agent) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, asking_price, property_type, bedrooms, bathrooms, size_sqft, location_area, images, is_published, created_at')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties((data as any) || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete);

      if (error) throw error;

      toast({
        title: "Property Deleted",
        description: "The property has been removed from your listings.",
      });

      setProperties(prev => prev.filter(p => p.id !== propertyToDelete));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">My Listings</h1>
          <p className="text-muted-foreground mt-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
        <Link to="/agent-portal/listings/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Listings */}
      {properties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your first property to start connecting with verified investors.
            </p>
            <Link to="/agent-portal/listings/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-40 sm:h-auto relative">
                      {property.images && property.images[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        {property.is_published ? (
                          <Badge className="bg-green-500/90 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/90 text-white">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Review
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{property.title}</h3>
                          <p className="text-sm text-muted-foreground">{property.location_area}</p>
                          
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <span className="text-muted-foreground">
                              {property.property_type}
                            </span>
                            <span className="text-muted-foreground">
                              {property.bedrooms} bed • {property.bathrooms} bath
                            </span>
                            <span className="text-muted-foreground">
                              {property.size_sqft?.toLocaleString()} sqft
                            </span>
                          </div>

                          <p className="text-lg font-bold text-primary mt-3">
                            {formatPrice(property.asking_price, 'AED')}
                          </p>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {property.is_published && (
                              <DropdownMenuItem asChild>
                                <Link to={`/properties/${property.id}`} target="_blank">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Live
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to={`/agent-portal/listings/${property.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDelete(property.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pending Review Notice */}
      {properties.some(p => !p.is_published) && (
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Properties Pending Review</p>
              <p className="text-sm text-muted-foreground">
                New listings are reviewed by our team before going live. This usually takes 24-48 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The property will be permanently removed from your listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
