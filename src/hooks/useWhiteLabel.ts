import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WhiteLabelConfig {
  id: string;
  workspace_id: string;
  custom_domain: string | null;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  favicon_url: string | null;
  company_name: string | null;
  custom_css: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useWhiteLabelConfig(workspaceId: string | null) {
  const { data: config, isLoading } = useQuery({
    queryKey: ["white-label-config", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const { data, error } = await supabase
        .from("white_label_configs")
        .select("*")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (error) throw error;
      return data as WhiteLabelConfig | null;
    },
    enabled: !!workspaceId,
  });

  return { config, isLoading };
}

export function useUpdateWhiteLabelConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      config,
    }: {
      workspaceId: string;
      config: Partial<Omit<WhiteLabelConfig, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>>;
    }) => {
      // Check if config exists
      const { data: existing } = await supabase
        .from("white_label_configs")
        .select("id")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("white_label_configs")
          .update(config)
          .eq("workspace_id", workspaceId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("white_label_configs")
          .insert({
            workspace_id: workspaceId,
            ...config,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["white-label-config", workspaceId] });
      toast.success("White-label configuration saved");
    },
    onError: (error) => {
      toast.error(`Failed to save configuration: ${error.message}`);
    },
  });
}

// Apply white-label styles dynamically
export function applyWhiteLabelStyles(config: WhiteLabelConfig | null) {
  if (!config || !config.is_active) return;

  const root = document.documentElement;

  // Apply primary color
  if (config.primary_color) {
    // Convert hex to HSL for CSS variable
    const hsl = hexToHsl(config.primary_color);
    if (hsl) {
      root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  }

  // Apply secondary color
  if (config.secondary_color) {
    const hsl = hexToHsl(config.secondary_color);
    if (hsl) {
      root.style.setProperty('--secondary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }
  }

  // Apply custom CSS
  if (config.custom_css) {
    let styleEl = document.getElementById('white-label-custom-css');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'white-label-custom-css';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = config.custom_css;
  }

  // Update favicon
  if (config.favicon_url) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = config.favicon_url;
    }
  }

  // Update document title with company name
  if (config.company_name) {
    const currentTitle = document.title;
    if (!currentTitle.includes(config.company_name)) {
      document.title = currentTitle.replace('Dubai Real Estate Intel', config.company_name);
    }
  }
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}
