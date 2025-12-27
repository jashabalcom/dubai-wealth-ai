import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscribeOptions {
  source: string;
  leadMagnet?: string;
}

export function useEmailSubscribe() {
  const [isLoading, setIsLoading] = useState(false);

  const subscribe = async (email: string, options: SubscribeOptions) => {
    setIsLoading(true);
    
    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      
      const { error } = await supabase.from("email_subscribers").insert({
        email: email.toLowerCase().trim(),
        source: options.source,
        lead_magnet: options.leadMagnet,
        utm_source: urlParams.get("utm_source"),
        utm_medium: urlParams.get("utm_medium"),
        utm_campaign: urlParams.get("utm_campaign"),
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - email already exists
          toast.info("You're already subscribed!");
          return true;
        }
        throw error;
      }

      toast.success("Successfully subscribed!");
      return true;
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { subscribe, isLoading };
}
