import { PitchDeckSlide } from "../PitchDeckSlide";
import { Rocket, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AskSlide = () => (
  <PitchDeckSlide className="items-center justify-center text-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-12">
    <div className="space-y-8 max-w-3xl">
      <Rocket className="h-16 w-16 text-primary mx-auto" />
      
      <h2 className="text-4xl md:text-6xl font-bold">
        Join Us in Building the Future of Dubai Real Estate Investment
      </h2>
      
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-primary">$1M</p>
            <p className="text-muted-foreground">Seed Round</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-accent">$4M</p>
            <p className="text-muted-foreground">Pre-money Valuation</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">20%</p>
            <p className="text-muted-foreground">Equity Offered</p>
          </div>
        </div>
        
        <div className="border-t border-border pt-6">
          <p className="text-lg text-muted-foreground mb-4">
            SAFE notes available • Lead investor commitment: $500K minimum
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button size="lg" className="gap-2">
          <Calendar className="h-5 w-5" />
          Schedule a Meeting
        </Button>
        <Button size="lg" variant="outline" className="gap-2">
          <Mail className="h-5 w-5" />
          invest@dubaiwealthhub.com
        </Button>
      </div>

      <p className="text-sm text-muted-foreground pt-8">
        Dubai Wealth Hub © 2025 • Confidential Investment Materials
      </p>
    </div>
  </PitchDeckSlide>
);
