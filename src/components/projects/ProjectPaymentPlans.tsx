import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Calculator, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import type { ProjectPaymentPlan } from '@/hooks/useProject';

interface ProjectPaymentPlansProps {
  paymentPlans: ProjectPaymentPlan[];
  brandColor?: string;
}

interface PlanSegment {
  label: string;
  percentage: number;
  color: string;
  description: string;
}

export function ProjectPaymentPlans({ paymentPlans, brandColor }: ProjectPaymentPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    paymentPlans.find(p => p.is_default)?.id || paymentPlans[0]?.id || null
  );

  const getSegments = (plan: ProjectPaymentPlan): PlanSegment[] => {
    const segments: PlanSegment[] = [];
    
    if (plan.down_payment_percent > 0) {
      segments.push({
        label: 'Down Payment',
        percentage: plan.down_payment_percent,
        color: brandColor || 'hsl(35 25% 70%)',
        description: 'Due on booking',
      });
    }
    
    if (plan.during_construction_percent > 0) {
      segments.push({
        label: 'During Construction',
        percentage: plan.during_construction_percent,
        color: 'hsl(220 40% 40%)',
        description: 'Spread over construction period',
      });
    }
    
    if (plan.on_handover_percent > 0) {
      segments.push({
        label: 'On Handover',
        percentage: plan.on_handover_percent,
        color: 'hsl(220 35% 25%)',
        description: 'Due on completion',
      });
    }
    
    if (plan.post_handover_percent > 0) {
      segments.push({
        label: 'Post-Handover',
        percentage: plan.post_handover_percent,
        color: 'hsl(220 30% 15%)',
        description: plan.post_handover_months 
          ? `Over ${plan.post_handover_months} months after handover`
          : 'After handover',
      });
    }

    return segments;
  };

  const activePlan = paymentPlans.find(p => p.id === selectedPlan);

  return (
    <div className="space-y-8">
      {/* Plan Selection */}
      {paymentPlans.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {paymentPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative px-4 py-3 rounded-lg border-2 transition-all ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{plan.name}</span>
                {plan.is_default && (
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                )}
              </div>
              {selectedPlan === plan.id && (
                <motion.div
                  layoutId="selected-plan"
                  className="absolute inset-0 border-2 border-primary rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Active Plan Visualization */}
      {activePlan && (
        <motion.div
          key={activePlan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              {activePlan.name}
            </h3>
            {activePlan.post_handover_months > 0 && (
              <Badge className="bg-primary/10 text-primary border-0">
                Post-Handover Available
              </Badge>
            )}
          </div>

          {/* Progress Bar Visualization */}
          <div className="mb-8">
            <div className="h-12 rounded-full overflow-hidden flex bg-muted/30">
              {getSegments(activePlan).map((segment, index) => (
                <motion.div
                  key={segment.label}
                  initial={{ width: 0 }}
                  animate={{ width: `${segment.percentage}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative h-full flex items-center justify-center"
                  style={{ backgroundColor: segment.color }}
                >
                  {segment.percentage >= 15 && (
                    <span className="text-white text-sm font-bold">
                      {segment.percentage}%
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getSegments(activePlan).map((segment, index) => (
              <motion.div
                key={segment.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="p-4 bg-muted/30 rounded-xl"
              >
                <div 
                  className="w-3 h-3 rounded-full mb-3"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="text-2xl font-bold text-foreground font-mono">
                  {segment.percentage}%
                </div>
                <div className="text-sm font-medium text-foreground mt-1">
                  {segment.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {segment.description}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key Benefits */}
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="font-medium text-foreground mb-4">Plan Benefits</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePlan.down_payment_percent <= 20 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  Low down payment requirement
                </div>
              )}
              {activePlan.post_handover_percent > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  Post-handover payment flexibility
                </div>
              )}
              {activePlan.during_construction_percent < 50 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  Manageable construction payments
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-500" />
                Developer-backed financing
              </div>
            </div>
          </div>

          {/* Calculator CTA */}
          <div className="mt-6 pt-6 border-t border-border">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/tools/offplan">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Your Payments
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {paymentPlans.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl">
          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Payment plans coming soon</p>
          <p className="text-sm mt-1">Contact us for current payment options</p>
        </div>
      )}
    </div>
  );
}
