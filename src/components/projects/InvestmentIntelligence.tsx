import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Users, AlertTriangle, Lightbulb, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InvestmentIntelligenceProps {
  investmentThesis: string | null;
  idealBuyerPersona: string | null;
  capitalAppreciationRating: string | null;
  rentalYieldRating: string | null;
  risksConsiderations: string | null;
  paymentPlanStructure: string | null;
  brandColor?: string;
}

const ratingConfig = {
  high: { label: 'High', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: TrendingUp },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: BarChart3 },
  low: { label: 'Low', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: TrendingDown },
};

export function InvestmentIntelligence({
  investmentThesis,
  idealBuyerPersona,
  capitalAppreciationRating,
  rentalYieldRating,
  risksConsiderations,
  paymentPlanStructure,
  brandColor,
}: InvestmentIntelligenceProps) {
  const hasData = investmentThesis || idealBuyerPersona || capitalAppreciationRating || rentalYieldRating || risksConsiderations;

  if (!hasData) {
    return null;
  }

  const appreciationConfig = ratingConfig[capitalAppreciationRating as keyof typeof ratingConfig] || ratingConfig.medium;
  const yieldConfig = ratingConfig[rentalYieldRating as keyof typeof ratingConfig] || ratingConfig.medium;
  const AppreciationIcon = appreciationConfig.icon;
  const YieldIcon = yieldConfig.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: brandColor ? `${brandColor}20` : 'hsl(var(--primary) / 0.1)' }}
        >
          <Lightbulb 
            className="h-5 w-5"
            style={{ color: brandColor || 'hsl(var(--primary))' }}
          />
        </div>
        <h2 className="text-2xl font-semibold">Investment Intelligence</h2>
      </div>

      <div className="grid gap-6">
        {/* Rating Cards */}
        {(capitalAppreciationRating || rentalYieldRating) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {capitalAppreciationRating && (
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Capital Appreciation</p>
                      <Badge variant="outline" className={appreciationConfig.color}>
                        <AppreciationIcon className="h-3 w-3 mr-1" />
                        {appreciationConfig.label} Potential
                      </Badge>
                    </div>
                    <div 
                      className="p-3 rounded-full"
                      style={{ backgroundColor: brandColor ? `${brandColor}10` : 'hsl(var(--muted))' }}
                    >
                      <TrendingUp 
                        className="h-6 w-6"
                        style={{ color: brandColor || 'hsl(var(--foreground))' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {rentalYieldRating && (
              <Card className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Rental Yield</p>
                      <Badge variant="outline" className={yieldConfig.color}>
                        <YieldIcon className="h-3 w-3 mr-1" />
                        {yieldConfig.label} Yield
                      </Badge>
                    </div>
                    <div 
                      className="p-3 rounded-full"
                      style={{ backgroundColor: brandColor ? `${brandColor}10` : 'hsl(var(--muted))' }}
                    >
                      <DollarSign 
                        className="h-6 w-6"
                        style={{ color: brandColor || 'hsl(var(--foreground))' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Investment Thesis */}
        {investmentThesis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Investment Thesis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{investmentThesis}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Ideal Buyer Persona */}
        {idealBuyerPersona && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Ideal Buyer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{idealBuyerPersona}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payment Plan */}
        {paymentPlanStructure && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Plan</p>
                    <p className="font-medium">{paymentPlanStructure}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Risks & Considerations */}
        {risksConsiderations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  Risks & Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{risksConsiderations}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}