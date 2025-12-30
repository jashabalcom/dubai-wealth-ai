import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface PortfolioProperty {
  id: string;
  portfolio_id: string;
  property_name: string;
  location_area: string;
  property_type: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  monthly_rental_income: number;
  monthly_expenses: number;
  mortgage_balance: number;
  notes: string | null;
  size_sqft: number | null;
  bedrooms: number | null;
  last_valuation_date: string | null;
  valuation_source: string | null;
  created_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalPurchasePrice: number;
  totalEquity: number;
  totalMortgageBalance: number;
  monthlyRentalIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  averageROI: number;
  totalAppreciation: number;
  appreciationPercentage: number;
}

export function usePortfolio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Portfolio | null;
    },
    enabled: !!user,
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['portfolio-properties', portfolio?.id],
    queryFn: async () => {
      if (!portfolio) return [];
      
      const { data, error } = await supabase
        .from('portfolio_properties')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PortfolioProperty[];
    },
    enabled: !!portfolio,
  });

  const createPortfolio = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('portfolios')
        .insert({ user_id: user.id, name: 'My Portfolio' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
      toast.success('Portfolio created');
    },
    onError: (error) => {
      toast.error('Failed to create portfolio: ' + error.message);
    },
  });

  const addProperty = useMutation({
    mutationFn: async (property: {
      property_name: string;
      location_area: string;
      property_type: string;
      purchase_price: number;
      current_value: number;
      purchase_date: string;
      monthly_rental_income: number;
      monthly_expenses: number;
      mortgage_balance: number;
      notes: string | null;
      size_sqft?: number | null;
      bedrooms?: number | null;
    }) => {
      if (!portfolio) throw new Error('No portfolio found');
      
      const { data, error } = await supabase
        .from('portfolio_properties')
        .insert({ ...property, portfolio_id: portfolio.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    // Optimistic update
    onMutate: async (newProperty) => {
      await queryClient.cancelQueries({ queryKey: ['portfolio-properties', portfolio?.id] });
      const previousProperties = queryClient.getQueryData<PortfolioProperty[]>(['portfolio-properties', portfolio?.id]) || [];
      
      const optimisticProperty: PortfolioProperty = {
        id: `temp-${Date.now()}`,
        portfolio_id: portfolio?.id || '',
        ...newProperty,
        notes: newProperty.notes,
        size_sqft: newProperty.size_sqft || null,
        bedrooms: newProperty.bedrooms || null,
        last_valuation_date: null,
        valuation_source: null,
        created_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['portfolio-properties', portfolio?.id], [optimisticProperty, ...previousProperties]);
      return { previousProperties };
    },
    onError: (error, newProperty, context) => {
      if (context?.previousProperties) {
        queryClient.setQueryData(['portfolio-properties', portfolio?.id], context.previousProperties);
      }
      toast.error('Failed to add property: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Property added to portfolio');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-properties', portfolio?.id] });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PortfolioProperty> & { id: string }) => {
      const { error } = await supabase
        .from('portfolio_properties')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    // Optimistic update
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['portfolio-properties', portfolio?.id] });
      const previousProperties = queryClient.getQueryData<PortfolioProperty[]>(['portfolio-properties', portfolio?.id]) || [];
      
      queryClient.setQueryData(
        ['portfolio-properties', portfolio?.id],
        previousProperties.map(p => p.id === id ? { ...p, ...updates } : p)
      );
      return { previousProperties };
    },
    onError: (error, variables, context) => {
      if (context?.previousProperties) {
        queryClient.setQueryData(['portfolio-properties', portfolio?.id], context.previousProperties);
      }
      toast.error('Failed to update property');
    },
    onSuccess: () => {
      toast.success('Property updated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-properties', portfolio?.id] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from('portfolio_properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    // Optimistic update
    onMutate: async (propertyId: string) => {
      await queryClient.cancelQueries({ queryKey: ['portfolio-properties', portfolio?.id] });
      const previousProperties = queryClient.getQueryData<PortfolioProperty[]>(['portfolio-properties', portfolio?.id]) || [];
      
      queryClient.setQueryData(
        ['portfolio-properties', portfolio?.id],
        previousProperties.filter(p => p.id !== propertyId)
      );
      return { previousProperties };
    },
    onError: (error, propertyId, context) => {
      if (context?.previousProperties) {
        queryClient.setQueryData(['portfolio-properties', portfolio?.id], context.previousProperties);
      }
      toast.error('Failed to remove property');
    },
    onSuccess: () => {
      toast.success('Property removed from portfolio');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-properties', portfolio?.id] });
    },
  });

  // Calculate portfolio metrics
  const metrics: PortfolioMetrics = {
    totalValue: properties.reduce((sum, p) => sum + Number(p.current_value), 0),
    totalPurchasePrice: properties.reduce((sum, p) => sum + Number(p.purchase_price), 0),
    totalEquity: properties.reduce((sum, p) => sum + (Number(p.current_value) - Number(p.mortgage_balance)), 0),
    totalMortgageBalance: properties.reduce((sum, p) => sum + Number(p.mortgage_balance), 0),
    monthlyRentalIncome: properties.reduce((sum, p) => sum + Number(p.monthly_rental_income), 0),
    monthlyExpenses: properties.reduce((sum, p) => sum + Number(p.monthly_expenses), 0),
    monthlyCashFlow: properties.reduce((sum, p) => sum + (Number(p.monthly_rental_income) - Number(p.monthly_expenses)), 0),
    annualCashFlow: properties.reduce((sum, p) => sum + (Number(p.monthly_rental_income) - Number(p.monthly_expenses)), 0) * 12,
    averageROI: properties.length > 0
      ? properties.reduce((sum, p) => {
          const annualIncome = (Number(p.monthly_rental_income) - Number(p.monthly_expenses)) * 12;
          const roi = (annualIncome / Number(p.purchase_price)) * 100;
          return sum + roi;
        }, 0) / properties.length
      : 0,
    totalAppreciation: properties.reduce((sum, p) => sum + (Number(p.current_value) - Number(p.purchase_price)), 0),
    appreciationPercentage: properties.length > 0
      ? ((properties.reduce((sum, p) => sum + Number(p.current_value), 0) / 
          properties.reduce((sum, p) => sum + Number(p.purchase_price), 0)) - 1) * 100
      : 0,
  };

  return {
    portfolio,
    properties,
    metrics,
    loading: portfolioLoading || propertiesLoading,
    createPortfolio,
    addProperty,
    updateProperty,
    deleteProperty,
  };
}
