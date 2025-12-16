import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MortgageLead {
  id: string;
  user_id: string | null;
  property_price: number;
  down_payment_percent: number;
  down_payment_amount: number;
  loan_amount: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_payment: number;
  property_id: string | null;
  property_area: string | null;
  property_type: string | null;
  is_off_plan: boolean;
  employment_status: string;
  monthly_income_range: string;
  purchase_timeline: string;
  first_time_buyer: boolean;
  existing_mortgage: boolean;
  uae_resident: boolean;
  full_name: string;
  email: string;
  phone: string;
  preferred_contact_method: string;
  consent_bank_contact: boolean;
  consent_marketing: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer_url: string | null;
  status: string;
  lead_score: number;
  assigned_partner_id: string | null;
  admin_notes: string | null;
  partner_notified_at: string | null;
  converted_at: string | null;
  revenue_earned: number;
  created_at: string;
  updated_at: string;
}

export interface MortgagePartner {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  base_rate: number | null;
  max_ltv: number;
  processing_fee_percent: number;
  min_loan_amount: number;
  max_loan_amount: number | null;
  partnership_type: string;
  cpl_amount: number;
  cpa_amount: number;
  sponsorship_monthly: number;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useMortgageLeads(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['mortgage-leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('mortgage_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MortgageLead[];
    },
  });
}

export function useMortgageLeadStats() {
  return useQuery({
    queryKey: ['mortgage-lead-stats'],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from('mortgage_leads')
        .select('status, lead_score, revenue_earned, loan_amount, created_at');

      if (error) throw error;

      const stats = {
        total: leads?.length || 0,
        new: leads?.filter(l => l.status === 'new').length || 0,
        contacted: leads?.filter(l => l.status === 'contacted').length || 0,
        qualified: leads?.filter(l => l.status === 'qualified').length || 0,
        converted: leads?.filter(l => l.status === 'converted').length || 0,
        avgLeadScore: leads?.length ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length) : 0,
        totalRevenue: leads?.reduce((sum, l) => sum + (l.revenue_earned || 0), 0) || 0,
        totalLoanVolume: leads?.reduce((sum, l) => sum + (l.loan_amount || 0), 0) || 0,
        thisMonth: leads?.filter(l => {
          const created = new Date(l.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length || 0,
      };

      return stats;
    },
  });
}

export function useUpdateMortgageLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MortgageLead> }) => {
      const { data, error } = await supabase
        .from('mortgage_leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-leads'] });
      queryClient.invalidateQueries({ queryKey: ['mortgage-lead-stats'] });
    },
  });
}

export function useMortgagePartners() {
  return useQuery({
    queryKey: ['mortgage-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortgage_partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as MortgagePartner[];
    },
  });
}

export function useCreateMortgagePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: { name: string } & Partial<Omit<MortgagePartner, 'name'>>) => {
      const { data, error } = await supabase
        .from('mortgage_partners')
        .insert([partner as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-partners'] });
    },
  });
}

export function useUpdateMortgagePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MortgagePartner> }) => {
      const { data, error } = await supabase
        .from('mortgage_partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-partners'] });
    },
  });
}

export function useDeleteMortgagePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mortgage_partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-partners'] });
    },
  });
}
