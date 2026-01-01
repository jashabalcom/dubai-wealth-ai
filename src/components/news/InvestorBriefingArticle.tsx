import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  AlertCircle, 
  Clock, 
  MapPin, 
  TrendingUp,
  Shield,
  Bookmark,
  Share2,
  ChevronRight,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NewsArticle } from '@/hooks/useNews';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { QuickTakeBox } from './QuickTakeBox';
import { RiskOpportunityGauge } from './RiskOpportunityGauge';
import { OriginalSourceLink } from './OriginalSourceLink';

interface InvestorBriefingArticleProps {
  article: NewsArticle;
}

const URGENCY_CONFIG = {
  breaking: { label: 'Breaking', color: 'bg-red-500', icon: AlertCircle },
  high: { label: 'High Priority', color: 'bg-orange-500', icon: AlertCircle },
  normal: { label: 'Standard', color: 'bg-blue-500', icon: Clock },
  evergreen: { label: 'Evergreen', color: 'bg-green-500', icon: CheckCircle2 },
};

const VERIFICATION_CONFIG = {
  verified: { label: 'Verified', color: 'text-green-500', icon: Shield },
  unverified: { label: 'Unverified', color: 'text-muted-foreground', icon: AlertCircle },
  flagged: { label: 'Flagged', color: 'text-red-500', icon: AlertCircle },
};

// Extract Quick-Take from markdown content
function extractQuickTake(content: string | null): string | null {
  if (!content) return null;
  const match = content.match(/## Quick-Take\s*\n+([\s\S]*?)(?=\n## |$)/);
  if (match) {
    return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

// Extract Contrarian View from markdown content
function extractContrarianView(content: string | null): string | null {
  if (!content) return null;
  const match = content.match(/## Contrarian View\s*\n+([\s\S]*?)(?=\n## |$)/);
  if (match) {
    return match[1].trim();
  }
  return null;
}

// Extract Risk/Opportunity Assessment from markdown content
function extractRiskAssessment(content: string | null): { 
  opportunityScore?: number; 
  riskLevel?: 'low' | 'medium' | 'high';
  timeSensitivity?: 'immediate' | '2_weeks' | '1_month' | 'evergreen';
} {
  if (!content) return {};
  
  const result: ReturnType<typeof extractRiskAssessment> = {};
  
  // Extract Opportunity Score
  const scoreMatch = content.match(/\*\*Opportunity Score\*\*:\s*\[?(\d+)\]?/i);
  if (scoreMatch) {
    const score = parseInt(scoreMatch[1]);
    if (score >= 1 && score <= 10) result.opportunityScore = score;
  }
  
  // Extract Risk Level
  const riskMatch = content.match(/\*\*Risk Level\*\*:\s*\[?(Low|Medium|High)\]?/i);
  if (riskMatch) {
    result.riskLevel = riskMatch[1].toLowerCase() as 'low' | 'medium' | 'high';
  }
  
  // Extract Time Sensitivity
  const timeMatch = content.match(/\*\*Time Sensitivity\*\*:\s*\[?(Immediate|2 Weeks?|1 Month?|Evergreen)\]?/i);
  if (timeMatch) {
    const timeValue = timeMatch[1].toLowerCase();
    if (timeValue === 'immediate') result.timeSensitivity = 'immediate';
    else if (timeValue.includes('week')) result.timeSensitivity = '2_weeks';
    else if (timeValue.includes('month')) result.timeSensitivity = '1_month';
    else if (timeValue === 'evergreen') result.timeSensitivity = 'evergreen';
  }
  
  return result;
}

// Remove extracted sections from content for cleaner rendering
function getCleanedContent(content: string | null): string {
  if (!content) return '';
  
  // Remove Quick-Take section (it's displayed separately)
  let cleaned = content.replace(/## Quick-Take\s*\n+[\s\S]*?(?=\n## |$)/, '');
  
  // Remove Risk/Opportunity Assessment section (displayed as gauge)
  cleaned = cleaned.replace(/## Risk\/Opportunity Assessment\s*\n+[\s\S]*?(?=\n## |$)/, '');
  
  return cleaned.trim();
}

export function InvestorBriefingArticle({ article }: InvestorBriefingArticleProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isContrarianOpen, setIsContrarianOpen] = useState(false);

  // Extract structured data from content
  const quickTake = useMemo(() => 
    article.quick_take || extractQuickTake(article.content), 
    [article.quick_take, article.content]
  );
  
  const contrarianView = useMemo(() => 
    article.contrarian_view || extractContrarianView(article.content), 
    [article.contrarian_view, article.content]
  );
  
  const riskAssessment = useMemo(() => ({
    opportunityScore: article.opportunity_score || extractRiskAssessment(article.content).opportunityScore,
    riskLevel: (article.risk_level as 'low' | 'medium' | 'high') || extractRiskAssessment(article.content).riskLevel,
    timeSensitivity: (article.time_sensitivity as 'immediate' | '2_weeks' | '1_month' | 'evergreen') || extractRiskAssessment(article.content).timeSensitivity,
  }), [article.opportunity_score, article.risk_level, article.time_sensitivity, article.content]);

  const cleanedContent = useMemo(() => getCleanedContent(article.content), [article.content]);

  // Extract table of contents from markdown headings
  const tableOfContents = useMemo(() => {
    if (!cleanedContent) return [];
    const headingRegex = /^##\s+(.+)$/gm;
    const matches = [...cleanedContent.matchAll(headingRegex)];
    return matches.map(match => ({
      title: match[1].replace(/[*_]/g, ''),
      id: match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    }));
  }, [cleanedContent]);

  const urgency = article.urgency_level || 'normal';
  const verification = article.verification_status || 'unverified';
  const UrgencyIcon = URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG]?.icon || Clock;
  const VerificationIcon = VERIFICATION_CONFIG[verification as keyof typeof VERIFICATION_CONFIG]?.icon || AlertCircle;

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? 'Removed from watchlist' : 'Added to watchlist',
      description: isSaved ? 'Article removed from your portfolio watchlist' : 'You\'ll be notified of related updates',
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        text: article.excerpt || '',
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* Main Content */}
        <article className="space-y-8">
          {/* Header */}
          <header className="space-y-4">
            {/* AI Analysis Badge */}
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-gold/80 to-gold text-background font-semibold">
                <TrendingUp className="h-3 w-3 mr-1" />
                AI Investment Analysis
              </Badge>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2">
              {article.briefing_type && (
                <Badge variant="outline" className="uppercase text-xs">
                  {article.briefing_type.replace('_', ' ')}
                </Badge>
              )}
              <Badge className={`${URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG]?.color} text-white`}>
                <UrgencyIcon className="h-3 w-3 mr-1" />
                {URGENCY_CONFIG[urgency as keyof typeof URGENCY_CONFIG]?.label}
              </Badge>
              <Badge variant="outline" className={VERIFICATION_CONFIG[verification as keyof typeof VERIFICATION_CONFIG]?.color}>
                <VerificationIcon className="h-3 w-3 mr-1" />
                {VERIFICATION_CONFIG[verification as keyof typeof VERIFICATION_CONFIG]?.label}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {article.title}
            </h1>

            {/* Investment Rating */}
            {article.investment_rating && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Investment Rating:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= article.investment_rating!
                          ? 'text-gold fill-gold'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gold">
                  {article.investment_rating}/5
                </span>
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.reading_time_minutes || 5} min read
              </span>
              <span>{article.source_name}</span>
              {article.published_at && (
                <span>{format(new Date(article.published_at), 'MMMM d, yyyy')}</span>
              )}
              {article.ai_confidence_score && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {Math.round(article.ai_confidence_score * 100)}% AI Confidence
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={isSaved ? 'default' : 'outline'}
                size="sm"
                onClick={handleSave}
              >
                <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save to Watchlist'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </header>

          <Separator />

          {/* Quick-Take Box - Most prominent */}
          {quickTake && (
            <QuickTakeBox quickTake={quickTake} />
          )}

          {/* Risk/Opportunity Gauge */}
          {(riskAssessment.opportunityScore || riskAssessment.riskLevel || riskAssessment.timeSensitivity) && (
            <RiskOpportunityGauge 
              opportunityScore={riskAssessment.opportunityScore}
              riskLevel={riskAssessment.riskLevel}
              timeSensitivity={riskAssessment.timeSensitivity}
            />
          )}

          {/* Affected Areas */}
          {article.affected_areas && article.affected_areas.length > 0 && (
            <Card className="bg-muted/50 border-gold/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Affected Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.affected_areas.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          {article.key_metrics && Object.keys(article.key_metrics).length > 0 && (
            <Card className="bg-gradient-to-r from-gold/5 to-transparent border-gold/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gold" />
                  Key Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(article.key_metrics as Record<string, string>).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-lg font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Featured Image */}
          {article.image_url && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-[21/9] rounded-xl overflow-hidden bg-muted"
            >
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Article Content */}
          <div className="prose-luxury prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 
                    id={String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    className="scroll-mt-24"
                  >
                    {children}
                  </h2>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border border-border rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
              }}
            >
              {cleanedContent || article.excerpt || ''}
            </ReactMarkdown>
          </div>

          {/* Contrarian View - Collapsible */}
          {contrarianView && (
            <Collapsible open={isContrarianOpen} onOpenChange={setIsContrarianOpen}>
              <Card className="bg-amber-500/5 border-amber-500/20">
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-amber-500/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <div>
                          <h3 className="text-sm font-semibold text-amber-500">Contrarian View</h3>
                          <p className="text-xs text-muted-foreground">Alternative perspective to consider</p>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-amber-500 transition-transform ${isContrarianOpen ? 'rotate-90' : ''}`} />
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 px-4">
                    <Separator className="mb-4" />
                    <div className="prose-luxury prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {contrarianView}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Verification Notes */}
          {article.verification_notes && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-500 mb-1">Verification Notes</h3>
                    <p className="text-sm text-foreground/80">{article.verification_notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Original Source Link - Always at bottom */}
          {article.source_url && (
            <OriginalSourceLink 
              sourceUrl={article.source_url}
              sourceName={article.source_name || 'Original Source'}
            />
          )}
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-6">
          {/* Sticky TOC */}
          <div className="sticky top-24 space-y-6">
            {tableOfContents.length > 0 && (
              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">In This Briefing</h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronRight className="h-3 w-3" />
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            )}

            {/* Affected Sectors */}
            {article.affected_sectors && article.affected_sectors.length > 0 && (
              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Sectors Impacted</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.affected_sectors.map((sector) => (
                      <Badge key={sector} variant="outline" className="text-xs">
                        {sector.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
