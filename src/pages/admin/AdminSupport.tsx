import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Headphones,
  Bot,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  User,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Radio,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { AdminLiveChatPanel } from '@/components/admin/AdminLiveChatPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  user_id: string | null;
  initial_message: string;
  conversation_history: Message[];
  status: string;
  category: string | null;
  priority: string;
  ai_confidence_score: number | null;
  escalation_reason: string | null;
  admin_id: string | null;
  admin_joined_at: string | null;
  created_at: string;
  last_message_at: string | null;
  resolved_at: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    membership_tier: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ai_handling: { label: 'AI Handling', color: 'bg-blue-500/10 text-blue-500', icon: <Bot className="h-3 w-3" /> },
  escalated: { label: 'Escalated', color: 'bg-amber-500/10 text-amber-500', icon: <AlertCircle className="h-3 w-3" /> },
  human_handling: { label: 'In Progress', color: 'bg-purple-500/10 text-purple-500', icon: <User className="h-3 w-3" /> },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-500', icon: <CheckCircle2 className="h-3 w-3" /> },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground', icon: <CheckCircle2 className="h-3 w-3" /> },
};

const PRIORITY_CONFIG: Record<string, string> = {
  low: 'bg-slate-500/10 text-slate-500',
  normal: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
};

export default function AdminSupport() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('escalated');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveChatTicket, setLiveChatTicket] = useState<SupportTicket | null>(null);

  // Fetch tickets
  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['support-tickets', statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            membership_tier
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as unknown as SupportTicket[];
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['support-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status, ai_confidence_score');
      
      if (error) throw error;
      
      const total = data.length;
      const aiHandled = data.filter(t => t.status === 'resolved' && (t.ai_confidence_score || 0) >= 0.7).length;
      const escalated = data.filter(t => t.status === 'escalated').length;
      const avgConfidence = data.reduce((sum, t) => sum + (t.ai_confidence_score || 0), 0) / (total || 1);
      
      return {
        total,
        aiHandled,
        escalated,
        resolutionRate: total > 0 ? ((aiHandled / total) * 100).toFixed(1) : '0',
        avgConfidence: (avgConfidence * 100).toFixed(0),
      };
    },
  });

  // Update ticket status
  const updateStatus = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const updates: any = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-stats'] });
      toast.success('Ticket updated');
    },
    onError: () => {
      toast.error('Failed to update ticket');
    },
  });

  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      ticket.initial_message.toLowerCase().includes(search) ||
      ticket.profiles?.full_name?.toLowerCase().includes(search) ||
      ticket.profiles?.email?.toLowerCase().includes(search)
    );
  });

  return (
    <AdminLayout title="AI Support Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Bot className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Resolved</p>
                <p className="text-2xl font-bold">{stats?.resolutionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold">{stats?.escalated || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">{stats?.avgConfidence}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="ai_handling">AI Handling</SelectItem>
                <SelectItem value="human_handling">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="account">Account</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Support Tickets
            <Badge variant="secondary" className="ml-2">{filteredTickets.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Headphones className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.ai_handling;
                
                return (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0" onClick={() => setLiveChatTicket(ticket)}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {ticket.profiles?.full_name || 'Anonymous User'}
                          </span>
                          {ticket.profiles?.membership_tier && (
                            <Badge variant="outline" className="text-xs">
                              {ticket.profiles.membership_tier}
                            </Badge>
                          )}
                          {ticket.admin_id && (
                            <Badge className="bg-green-500/10 text-green-500 text-xs">
                              <Radio className="h-2 w-2 mr-1" />
                              Live
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {ticket.initial_message}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={statusConfig.color}>
                            {statusConfig.icon}
                            <span className="ml-1">{statusConfig.label}</span>
                          </Badge>
                          {ticket.category && (
                            <Badge variant="outline">{ticket.category}</Badge>
                          )}
                          <Badge className={PRIORITY_CONFIG[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                          {ticket.ai_confidence_score && (
                            <span className="text-xs text-muted-foreground">
                              AI: {(ticket.ai_confidence_score * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-muted-foreground text-right">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                          </div>
                          <div className="mt-1">
                            {ticket.conversation_history?.length || 0} messages
                          </div>
                        </div>
                        {(ticket.status === 'escalated' || ticket.status === 'human_handling') && (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setLiveChatTicket(ticket);
                            }}
                          >
                            <Radio className="h-3 w-3 mr-1" />
                            Open Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Chat Panel - Full Screen Overlay */}
      {liveChatTicket && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="container max-w-4xl h-full py-4">
            <AdminLiveChatPanel
              ticket={liveChatTicket}
              onClose={() => setLiveChatTicket(null)}
              onResolved={() => {
                setLiveChatTicket(null);
                queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
                queryClient.invalidateQueries({ queryKey: ['support-stats'] });
                toast.success('Ticket resolved');
              }}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
