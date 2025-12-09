import { Phone, Mail, MessageCircle, BadgeCheck, Briefcase, Star, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AgentTier } from '@/lib/agent-tiers-config';

interface Agent {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  rera_brn: string | null;
  avatar_url: string | null;
  years_experience: number;
  is_verified: boolean;
  specializations: string[];
  subscription_tier?: AgentTier | null;
  show_direct_contact?: boolean | null;
  brokerage?: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface AgentContactCardProps {
  agent: Agent;
  propertyTitle?: string;
}

function TierBadge({ tier }: { tier: AgentTier | null | undefined }) {
  if (!tier || tier === 'basic') return null;
  
  if (tier === 'preferred') {
    return (
      <Badge className="bg-blue-500 text-white text-xs">
        <Star className="h-3 w-3 mr-1" />
        Preferred
      </Badge>
    );
  }
  if (tier === 'premium') {
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs">
        <Crown className="h-3 w-3 mr-1" />
        Premium
      </Badge>
    );
  }
  return null;
}

export function AgentContactCard({ agent, propertyTitle }: AgentContactCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Determine if direct contact should be shown
  const tier = agent.subscription_tier || 'basic';
  const canShowDirectContact = agent.show_direct_contact === true && (tier === 'preferred' || tier === 'premium');

  const handleCall = () => {
    if (agent.phone && canShowDirectContact) {
      window.location.href = `tel:${agent.phone}`;
    }
  };

  const handleEmail = () => {
    if (agent.email && canShowDirectContact) {
      const subject = propertyTitle ? `Inquiry about ${propertyTitle}` : 'Property Inquiry';
      window.location.href = `mailto:${agent.email}?subject=${encodeURIComponent(subject)}`;
    }
  };

  const handleWhatsApp = () => {
    if (agent.whatsapp && canShowDirectContact) {
      const phone = agent.whatsapp.replace(/[^0-9]/g, '');
      const message = propertyTitle 
        ? `Hi, I'm interested in ${propertyTitle}. Can you provide more details?`
        : `Hi, I'm interested in a property listing. Can you provide more details?`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg text-foreground">Listing Agent</h3>
        <TierBadge tier={tier} />
      </div>
      
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16 border-2 border-gold/20">
          <AvatarImage src={agent.avatar_url || undefined} alt={agent.full_name} />
          <AvatarFallback className="bg-gold/10 text-gold font-medium">
            {getInitials(agent.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">{agent.full_name}</h4>
            {agent.is_verified && (
              <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          {agent.brokerage && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <Briefcase className="h-3 w-3" />
              <span className="truncate">{agent.brokerage.name}</span>
            </div>
          )}
          
          {agent.years_experience > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {agent.years_experience} years experience
            </p>
          )}
          
          {agent.rera_brn && (
            <p className="text-xs text-muted-foreground mt-1">
              RERA BRN: {agent.rera_brn}
            </p>
          )}
        </div>
      </div>

      {agent.specializations && agent.specializations.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {agent.specializations.slice(0, 3).map((spec, idx) => (
            <span 
              key={idx}
              className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>
      )}

      {canShowDirectContact ? (
        // Show direct contact buttons for Preferred/Premium agents
        <div className="grid grid-cols-3 gap-2">
          {agent.phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCall}
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          
          {agent.email && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleEmail}
            >
              <Mail className="h-4 w-4" />
            </Button>
          )}
          
          {agent.whatsapp && (
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        // Show message for Basic tier agents - contact goes through platform
        <div className="p-3 bg-muted/50 rounded-lg text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Contact via Inquiry Form</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Submit an inquiry below and our team will connect you with this agent.
          </p>
        </div>
      )}
    </div>
  );
}
