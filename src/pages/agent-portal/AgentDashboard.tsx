import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Clock, 
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentAuth } from '@/hooks/useAgentAuth';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalListings: number;
  pendingListings: number;
  publishedListings: number;
  totalInquiries: number;
}

export default function AgentDashboard() {
  const { agent } = useAgentAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    pendingListings: 0,
    publishedListings: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agent) {
      fetchStats();
    }
  }, [agent]);

  const fetchStats = async () => {
    if (!agent) return;

    try {
      // Fetch property counts
      const { data: properties } = await supabase
        .from('properties')
        .select('id, is_published')
        .eq('agent_id', agent.id);

      const totalListings = properties?.length || 0;
      const publishedListings = properties?.filter(p => p.is_published).length || 0;
      const pendingListings = totalListings - publishedListings;

      // Fetch inquiry count
      const { count: inquiryCount } = await supabase
        .from('property_inquiries')
        .select('id', { count: 'exact', head: true })
        .in('property_id', properties?.map(p => p.id) || []);

      setStats({
        totalListings,
        pendingListings,
        publishedListings,
        totalInquiries: inquiryCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Listings',
      value: stats.totalListings,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Published',
      value: stats.publishedListings,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending Review',
      value: stats.pendingListings,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-semibold">
            Welcome back, {agent?.full_name?.split(' ')[0] || 'Agent'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your listings and connect with investors
          </p>
        </div>
        <Link to="/agent-portal/listings/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your listings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/agent-portal/listings/new" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Property
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/agent-portal/listings" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  View All Listings
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/agent-portal/profile" className="block">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Update Profile
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Inquiry Teaser */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Investor Interest
            </CardTitle>
            <CardDescription>Leads curated from our investor community</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.totalInquiries > 0 ? (
              <div className="space-y-4">
                <p className="text-3xl font-bold text-primary">
                  {stats.totalInquiries} inquiries
                </p>
                <p className="text-sm text-muted-foreground">
                  You've received interest from verified investors. Our team reviews 
                  and forwards qualified leads to help you close deals efficiently.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  No inquiries yet. Add more properties to increase your visibility 
                  to our global investor community.
                </p>
                <Link to="/agent-portal/listings/new">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Add Your First Listing
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empty State for New Agents */}
      {stats.totalListings === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Properties Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by adding your first property listing. Once approved, it will 
              be visible to thousands of verified investors on our platform.
            </p>
            <Link to="/agent-portal/listings/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
