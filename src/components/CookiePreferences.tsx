import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Shield, BarChart3, Megaphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COOKIE_CONSENT_KEY = "dwh_cookie_consent";
const CONSENT_EXPIRY_MONTHS = 12;

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  consented_at: string;
  expires_at: string;
}

const getDefaultPreferences = (): CookiePreferences => ({
  essential: true,
  analytics: false,
  marketing: false,
  consented_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + CONSENT_EXPIRY_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString(),
});

export const loadCookiePreferences = (): CookiePreferences | null => {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    
    const prefs = JSON.parse(stored) as CookiePreferences;
    
    // Check if consent has expired
    if (new Date(prefs.expires_at) < new Date()) {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }
    
    return prefs;
  } catch {
    return null;
  }
};

export const saveCookiePreferences = (prefs: CookiePreferences) => {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
};

interface CookiePreferencesProps {
  onSave?: () => void;
  variant?: "card" | "inline";
}

export const CookiePreferencesManager = ({ onSave, variant = "card" }: CookiePreferencesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>(
    loadCookiePreferences() || getDefaultPreferences()
  );
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences from user profile if logged in
  useEffect(() => {
    const loadFromProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("cookie_consent")
        .eq("id", user.id)
        .single();
      
      if (!error && data?.cookie_consent) {
        const profilePrefs = data.cookie_consent as unknown as CookiePreferences;
        // Only use profile prefs if they haven't expired
        if (new Date(profilePrefs.expires_at) > new Date()) {
          setPreferences(profilePrefs);
          saveCookiePreferences(profilePrefs);
        }
      }
    };
    
    loadFromProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const updatedPrefs: CookiePreferences = {
      ...preferences,
      consented_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + CONSENT_EXPIRY_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    // Save to localStorage
    saveCookiePreferences(updatedPrefs);
    setPreferences(updatedPrefs);
    
    // Sync to profile if logged in
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ cookie_consent: JSON.parse(JSON.stringify(updatedPrefs)) })
        .eq("id", user.id);
      
      if (error) {
        console.error("Failed to sync cookie preferences to profile:", error);
      }
    }
    
    toast({
      title: "Cookie preferences saved",
      description: "Your cookie preferences have been updated.",
    });
    
    setIsSaving(false);
    onSave?.();
  };

  const cookieTypes = [
    {
      id: "essential",
      name: "Essential Cookies",
      description: "Required for the website to function. Cannot be disabled.",
      icon: Shield,
      disabled: true,
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website.",
      icon: BarChart3,
      disabled: false,
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      description: "Used to deliver personalized advertisements.",
      icon: Megaphone,
      disabled: false,
    },
  ];

  const content = (
    <div className="space-y-4">
      {cookieTypes.map((cookie) => (
        <div
          key={cookie.id}
          className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50"
        >
          <div className="flex items-start gap-3">
            <cookie.icon className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <Label className="font-medium">{cookie.name}</Label>
              <p className="text-sm text-muted-foreground">{cookie.description}</p>
            </div>
          </div>
          <Switch
            checked={preferences[cookie.id as keyof CookiePreferences] as boolean}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({ ...prev, [cookie.id]: checked }))
            }
            disabled={cookie.disabled}
          />
        </div>
      ))}
      
      <div className="pt-2">
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
      
      {preferences.consented_at && (
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(preferences.consented_at).toLocaleDateString()}
          {" • "}
          Expires: {new Date(preferences.expires_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );

  if (variant === "inline") {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="w-5 h-5" />
          Cookie Preferences
        </CardTitle>
        <CardDescription>
          Manage how we use cookies on this website. Your preferences are saved for 12 months.
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};
