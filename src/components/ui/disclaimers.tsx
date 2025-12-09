import { Info, Shield, Scale, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerProps {
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export function InvestmentDisclaimer({ className, variant = 'default' }: DisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        <Info className="w-3 h-3 inline mr-1" />
        Educational tool only — not financial advice. Consult professionals before investing.
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10", className)}>
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Educational Tool:</span> These calculations are for informational purposes only and do not constitute financial, investment, or legal advice.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl bg-muted/50 border border-border", className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Scale className="w-4 h-4 text-amber-500" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Educational Tool — Not Financial Advice</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            These calculations and projections are for educational and informational purposes only. They do not constitute financial, investment, legal, or tax advice. Actual returns may vary significantly based on market conditions. Always consult with qualified professionals before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PropertyDisclaimer({ className, variant = 'default' }: DisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Listings presented by licensed RERA agents. Verify all details independently.
      </p>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10", className)}>
        <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Properties presented by licensed RERA-registered agents and developers.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl bg-muted/50 border border-border", className)}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Shield className="w-4 h-4 text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Listings by Licensed Agents</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Properties displayed are presented by licensed RERA-registered real estate agents and developers. Dubai Wealth Hub is an educational and referral platform — we facilitate introductions but do not act as a licensed brokerage. Verify all property details, pricing, and legal status independently before making any decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

export function YieldDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground flex items-center gap-1", className)}>
      <Info className="w-3 h-3" />
      Yield estimates are projections based on market data and are not guaranteed.
    </p>
  );
}

export function AIDisclaimer({ className, variant = 'default' }: DisclaimerProps) {
  if (variant === 'compact') {
    return (
      <p className={cn("text-xs text-muted-foreground text-center", className)}>
        AI responses are for informational purposes only and do not constitute professional financial, legal, or real estate advice. Always consult licensed professionals.
      </p>
    );
  }

  return (
    <div className={cn("p-3 rounded-lg bg-primary/5 border border-primary/10", className)}>
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">AI Disclaimer:</span> This AI-generated analysis is for informational and educational purposes only. It does not constitute financial, investment, legal, or real estate advice. Market conditions change rapidly. Always verify information and consult with licensed professionals before making investment decisions.
      </p>
    </div>
  );
}

export function GoldenVisaDisclaimer({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-xl bg-amber-500/5 border border-amber-500/10", className)}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Not Legal or Immigration Advice</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This AI-generated analysis is for informational purposes only and does not constitute legal, immigration, or professional advice. Golden Visa requirements are subject to change by UAE authorities. Always consult with authorized immigration consultants and verify current requirements with official government sources before making any decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PlatformDisclaimer({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 text-sm text-muted-foreground", className)}>
      <div className="space-y-2">
        <p className="font-medium text-foreground">About Dubai Wealth Hub</p>
        <p>
          Dubai Wealth Hub is an educational platform and referral network operated by Balcom Privé. We provide real estate investment education, analysis tools, and community resources. We are not a licensed real estate brokerage in the UAE.
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-foreground">Property Listings</p>
        <p>
          All properties displayed are presented by licensed RERA-registered real estate agents and developers. We facilitate introductions between investors and licensed professionals but do not directly broker transactions.
        </p>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-foreground">Investment Analysis</p>
        <p>
          All calculations, projections, yield estimates, and AI-generated analyses are for educational purposes only. Past performance does not guarantee future results. Always conduct independent due diligence and consult with qualified financial, legal, and real estate professionals.
        </p>
      </div>
    </div>
  );
}
