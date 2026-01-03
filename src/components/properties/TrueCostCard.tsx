import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, ChevronDown, Info, Calculator, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  calculateAcquisitionCosts, 
  calculateAnnualOngoingCosts,
  AREA_SERVICE_CHARGES,
  FEE_DESCRIPTIONS 
} from '@/lib/dubaiRealEstateFees';
import { useCurrency } from '@/contexts/CurrencyContext';
import { InlinePrice } from '@/components/DualPrice';
import type { AccessLevel } from '@/hooks/usePropertyViewLimit';

interface TrueCostCardProps {
  priceAed: number;
  sizeSqft: number;
  area: string;
  isOffPlan?: boolean;
  className?: string;
  accessLevel?: AccessLevel;
}

function formatAed(amount: number): string {
  if (amount >= 1000000) {
    return `AED ${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `AED ${(amount / 1000).toFixed(0)}K`;
  }
  return `AED ${amount.toLocaleString()}`;
}

export function TrueCostCard({ 
  priceAed, 
  sizeSqft, 
  area, 
  isOffPlan = false,
  className,
  accessLevel = 'full',
}: TrueCostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMortgage, setShowMortgage] = useState(false);

  // Calculate costs
  const downPayment = priceAed * 0.20; // 20% down for expats
  const loanAmount = priceAed - downPayment;
  
  const cashCosts = calculateAcquisitionCosts(priceAed);
  const mortgageCosts = calculateAcquisitionCosts(priceAed, undefined, true, loanAmount);
  const annualCosts = calculateAnnualOngoingCosts(priceAed, sizeSqft, area, false);
  
  const costs = showMortgage ? mortgageCosts : cashCosts;
  const trueCost = showMortgage 
    ? priceAed + costs.grandTotal 
    : priceAed + costs.grandTotal;

  const serviceChargeRate = AREA_SERVICE_CHARGES[area] || 15;

  const feeItems = [
    { 
      label: 'DLD Registration (4%)', 
      value: costs.dldFee, 
      key: 'dldRegistration',
      category: 'government'
    },
    { 
      label: 'DLD Admin Fee', 
      value: costs.dldAdminFee, 
      key: 'dldAdminFee',
      category: 'government'
    },
    { 
      label: 'Trustee Fee', 
      value: costs.trusteeFee, 
      key: 'trusteeFee',
      category: 'legal'
    },
    { 
      label: 'Title Deed Fee', 
      value: costs.titleDeedFee, 
      key: 'titleDeedFee',
      category: 'government'
    },
    { 
      label: 'Agent Commission (2%)', 
      value: costs.agentFee, 
      key: 'agentCommission',
      category: 'agent'
    },
    { 
      label: 'Developer NOC', 
      value: costs.nocFee, 
      key: 'nocFee',
      category: 'developer'
    },
  ];

  if (showMortgage) {
    feeItems.push(
      { 
        label: 'Mortgage Registration (0.25%)', 
        value: costs.mortgageRegistration, 
        key: 'mortgageRegistration',
        category: 'mortgage'
      },
      { 
        label: 'Bank Processing (1%)', 
        value: costs.bankProcessing, 
        key: 'bankProcessing',
        category: 'mortgage'
      },
      { 
        label: 'Bank Valuation', 
        value: costs.bankValuation, 
        key: 'bankValuation',
        category: 'mortgage'
      },
    );
  }

  const categoryColors: Record<string, string> = {
    government: 'text-blue-400',
    legal: 'text-purple-400',
    agent: 'text-green-400',
    developer: 'text-orange-400',
    mortgage: 'text-pink-400',
  };

  // Blocked state - show locked card
  if (accessLevel === 'blocked') {
    return (
      <div className={cn('p-4 rounded-xl bg-card border border-border', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold" />
            <h3 className="font-heading text-lg">True Cost of Ownership</h3>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Lock className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Sign up to see the true cost breakdown</p>
          <Link to="/auth">
            <Button variant="gold" size="sm">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Partial access - show summary, lock breakdown
  if (accessLevel === 'partial') {
    return (
      <div className={cn('p-4 rounded-xl bg-card border border-border', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold" />
            <h3 className="font-heading text-lg">True Cost of Ownership</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Complete breakdown of all acquisition costs including government fees, agent commission, and legal costs.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Summary - visible */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Property Price</span>
            <InlinePrice amountAED={priceAed} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Acquisition Costs</span>
            <span className="font-medium text-amber-400">+{formatAed(costs.grandTotal)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <span className="font-semibold">True Cost to Own</span>
            <InlinePrice amountAED={trueCost} className="text-lg" />
          </div>
          <p className="text-xs text-muted-foreground">
            {costs.percentageOfProperty.toFixed(1)}% above listing price
          </p>
        </div>

        {/* Locked breakdown */}
        <div className="relative pt-3 border-t border-border">
          <div className="space-y-2 blur-sm select-none">
            {feeItems.slice(0, 4).map((item) => (
              <div key={item.key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span>AED ???</span>
              </div>
            ))}
          </div>
          <Link 
            to="/auth" 
            className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-lg"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full hover:bg-gold/20 transition-colors">
              <Lock className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Sign up for full breakdown</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Full access
  return (
    <div className={cn('p-4 rounded-xl bg-card border border-border', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gold" />
          <h3 className="font-heading text-lg">True Cost of Ownership</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Complete breakdown of all acquisition costs including government fees, agent commission, and legal costs.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Toggle: Cash vs Mortgage */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={!showMortgage ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowMortgage(false)}
          className={cn(!showMortgage && 'bg-gold text-primary-dark hover:bg-gold/90')}
        >
          Cash Purchase
        </Button>
        <Button
          variant={showMortgage ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowMortgage(true)}
          className={cn(showMortgage && 'bg-gold text-primary-dark hover:bg-gold/90')}
        >
          With Mortgage
        </Button>
      </div>

      {/* Summary */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Property Price</span>
          <InlinePrice amountAED={priceAed} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Acquisition Costs</span>
          <span className="font-medium text-amber-400">+{formatAed(costs.grandTotal)}</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex justify-between items-center">
          <span className="font-semibold">True Cost to Own</span>
          <InlinePrice amountAED={trueCost} className="text-lg" />
        </div>
        <p className="text-xs text-muted-foreground">
          {costs.percentageOfProperty.toFixed(1)}% above listing price
        </p>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>View detailed breakdown</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Acquisition Fees</p>
              
              <TooltipProvider>
                {feeItems.map((item) => (
                  <Tooltip key={item.key}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between text-sm cursor-help hover:bg-muted/50 px-1 py-0.5 rounded">
                        <span className={cn('text-muted-foreground', categoryColors[item.category])}>
                          {item.label}
                        </span>
                        <span>{formatAed(item.value)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-xs">{FEE_DESCRIPTIONS[item.key] || 'Standard fee'}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>

              {/* Annual Costs Preview */}
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Estimated Annual Costs</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charges ({serviceChargeRate} AED/sqft)</span>
                    <span>{formatAed(annualCosts.serviceCharges)}</span>
                  </div>
                  {annualCosts.chillerAnnual > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">District Cooling</span>
                      <span>{formatAed(annualCosts.chillerAnnual)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium pt-1">
                    <span>Est. Annual Total</span>
                    <span className="text-amber-400">{formatAed(annualCosts.total)}</span>
                  </div>
                </div>
              </div>

              {/* CTA to Full Calculator */}
              <div className="mt-4 pt-3 border-t border-border">
                <Link to={`/tools/total-cost?price=${priceAed}&size=${sizeSqft}&area=${encodeURIComponent(area)}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Calculator className="w-4 h-4 mr-2" />
                    Open Full Cost Calculator
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
