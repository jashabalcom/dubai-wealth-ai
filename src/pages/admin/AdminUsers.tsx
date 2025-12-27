import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Crown, User, Shield } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';

type MembershipTier = 'free' | 'investor' | 'elite' | 'private';

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateTier = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: MembershipTier }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ membership_tier: tier })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Membership tier updated');
    },
    onError: (error) => {
      toast.error('Failed to update tier: ' + error.message);
    },
  });

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'private':
        return <Crown className="h-4 w-4 text-amber-400" />;
      case 'elite':
        return <Crown className="h-4 w-4 text-gold" />;
      case 'investor':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AdminLayout title="User Management">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {getTierIcon(user.membership_tier)}
                      </div>
                      <span className="font-medium">{user.full_name || 'No name'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      user.membership_status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.membership_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      user.membership_tier === 'private'
                        ? 'bg-gradient-to-r from-gold/20 to-amber-500/20 text-amber-400 border border-gold/30'
                        : user.membership_tier === 'elite'
                        ? 'bg-gold/10 text-gold'
                        : user.membership_tier === 'investor'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {getTierIcon(user.membership_tier)}
                      {user.membership_tier}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.membership_tier}
                      onValueChange={(value: MembershipTier) => updateTier.mutate({ userId: user.id, tier: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </AdminLayout>
  );
}
