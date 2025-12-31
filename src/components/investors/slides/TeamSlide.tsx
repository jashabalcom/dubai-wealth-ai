import { PitchDeckSlide } from "../PitchDeckSlide";
import { Globe, TrendingUp, Trophy, Building2, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import jashaPhoto from "@/assets/jasha-balcom.jpg";

export const TeamSlide = () => (
  <PitchDeckSlide className="p-8 md:p-12">
    <div className="space-y-6">
      <div>
        <p className="text-primary font-semibold mb-2">THE TEAM</p>
        <h2 className="text-3xl md:text-4xl font-bold">
          Built by Industry Experts
        </h2>
      </div>
      
      {/* Founder Spotlight */}
      <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img 
              src={jashaPhoto} 
              alt="Jasha Balcom - Founder & CEO"
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-lg"
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold">Jasha Balcom</h3>
              <p className="text-primary font-semibold">Founder & CEO</p>
              <p className="text-sm text-muted-foreground italic">
                Global Property Strategy & Sovereign Capital Placement
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jasha brings a rare combination of elite performance discipline, financial markets fluency, 
              and global luxury real estate expertise. After a professional baseball career with the 
              Chicago Cubs organization and a transition through Wall Street as a stock broker, Jasha 
              found his calling in global real estate—advising HNWIs and elite performers on sovereign 
              capital placement across Dubai, Miami, and Atlanta.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                <Building2 className="h-3.5 w-3.5" />
                Sotheby's International Realty
              </div>
              <div className="flex items-center gap-2 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">
                <TrendingUp className="h-3.5 w-3.5" />
                22+ Years Finance & RE
              </div>
              <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                <Globe className="h-3.5 w-3.5" />
                Dubai • Miami • Atlanta
              </div>
              <div className="flex items-center gap-2 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">
                <Trophy className="h-3.5 w-3.5" />
                Former Pro Athlete
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="https://www.linkedin.com/in/jashabalcom" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Founder-Market Fit */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h4 className="font-bold text-sm mb-3 text-primary">Founder-Market Fit</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-semibold">Direct Market Access</p>
            <p className="text-muted-foreground text-xs">
              Active HNWI network across 3 continents provides immediate distribution channel
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">First-Hand Pain Points</p>
            <p className="text-muted-foreground text-xs">
              Experienced the exact problems our platform solves while advising clients
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Performance Mindset</p>
            <p className="text-muted-foreground text-xs">
              Elite athletic background brings discipline, resilience, and coachability
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions / Advisory */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-muted/50 border border-dashed border-border rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">CTO / Technical Co-Founder</p>
          <p className="text-xs text-muted-foreground mt-1">Actively seeking</p>
        </div>
        <div className="bg-muted/50 border border-dashed border-border rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">Advisory Board</p>
          <p className="text-xs text-muted-foreground mt-1">Building strategic advisors</p>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
