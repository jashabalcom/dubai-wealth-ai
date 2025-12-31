import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Clock, Shield, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFunnelConfig, FunnelConfig } from '@/lib/funnel-config';
import { STRIPE_TIERS, BillingPeriod } from '@/lib/stripe-config';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

type PaidTier = 'investor' | 'elite' | 'private';

const Funnel = () => {
  const { funnelType } = useParams<{ funnelType: string }>();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<PaidTier>('investor');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const { loading, startCheckout } = useSubscription();
  const { user } = useAuth();

  const config = funnelType ? getFunnelConfig(funnelType) : null;

  useEffect(() => {
    if (config && config.defaultTier !== 'free') {
      setSelectedTier(config.defaultTier as PaidTier);
    }
  }, [config]);

  if (!config || !funnelType) {
    return <Navigate to="/pricing" replace />;
  }

  const handleStartTrial = async () => {
    if (!user) {
      // Navigate to auth page with return URL
      navigate(`/auth?redirect=/funnel/${funnelType}`);
      return;
    }

    await startCheckout(selectedTier, billingPeriod, {
      source: funnelType,
      trialDays: config.trialDays,
    });
  };

  const tierConfig = STRIPE_TIERS[selectedTier];
  const priceConfig = billingPeriod === 'annual' ? tierConfig.annual : tierConfig.monthly;

  const allowedPaidTiers = config.allowedTiers.filter(t => t !== 'free') as PaidTier[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {config.urgencyText && (
            <Badge variant="destructive" className="mb-4 text-sm px-4 py-1">
              <Clock className="w-4 h-4 mr-2" />
              {config.urgencyText}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {config.headline}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {config.subheadline}
          </p>
        </motion.div>

        {/* Tier Selection */}
        {allowedPaidTiers.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {allowedPaidTiers.map((tier) => (
              <Button
                key={tier}
                variant={selectedTier === tier ? 'default' : 'outline'}
                onClick={() => setSelectedTier(tier)}
                className="min-w-[120px]"
              >
                {STRIPE_TIERS[tier].name}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Billing Toggle */}
        {config.showAnnualOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-3 mb-8"
          >
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'annual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBillingPeriod('annual')}
            >
              Annual (Save {tierConfig.annual.savingsDisplay})
            </Button>
          </motion.div>
        )}

        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <CardTitle className="text-2xl">{tierConfig.name}</CardTitle>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <CardDescription className="text-lg">
                <span className="text-4xl font-bold text-foreground">{priceConfig.priceDisplay}</span>
                <span className="text-muted-foreground">{priceConfig.period}</span>
                {billingPeriod === 'annual' && (
                  <span className="block text-sm text-primary mt-1">
                    ({tierConfig.annual.monthlyEquivalent}/month)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trial Badge */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-base px-6 py-2 bg-primary/10 text-primary">
                  <Shield className="w-4 h-4 mr-2" />
                  {config.trialDays}-Day Free Trial
                </Badge>
              </div>

              {/* Bonuses */}
              {config.bonuses && config.bonuses.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-semibold mb-3 text-center">Special Bonuses Included:</p>
                  <ul className="space-y-2">
                    {config.bonuses.map((bonus, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <Button
                size="lg"
                className="w-full text-lg py-6"
                onClick={handleStartTrial}
                disabled={loading}
              >
                {loading ? 'Processing...' : config.ctaText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Trust Signals */}
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Cancel anytime
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  No charge during trial
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Full access
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <h2 className="text-2xl font-bold mb-6">What You'll Get Access To:</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              'Real-time Dubai property market data',
              'AI-powered investment analysis',
              'Exclusive member community',
              'Weekly market reports',
              'Price alerts and notifications',
              'Developer & project insights',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Funnel;
